import json,re,sys,os,urllib.parse,collections
from extract import *
from demonyms import D
R='/home/claude/time-machine/work/2026-11-24-wikicharts/'
creds=json.load(open('credits.json'))
rows=json.load(open(R+'chart.rows.json'))
ccs=collections.defaultdict(collections.Counter)
for r in rows: ccs[r['artist']][r['cc']]+=1
import unicodedata
def nz(x):
    x=unicodedata.normalize('NFKD',x); x=''.join(ch for ch in x if not unicodedata.combining(ch)).casefold()
    return ' '+re.sub(r'[^\w]+',' ',x).strip()+' '
songs=collections.defaultdict(set)
for r in rows:
    t=re.split(r'"|/| \(lit\.',r['title'])[0].strip()
    if len(nz(t).strip())>=3: songs[r['artist']].add(nz(t))
byname=collections.defaultdict(set)
for c0 in creds:
    for x in c0['linked']+c0['unlinked']: byname[x]|=songs[c0['credit']]
def names_song(credit,text,nm=None):
    tt=nz(text or '')
    return any(s in tt for s in songs[credit]|byname.get(nm,set()))
LANGOF={'FR':'fr','DE':'de','IT':'it','ES':'es'}
def load(f): return json.load(open(f)) if os.path.exists(f) else {}
caches={'en':{**load('artists_en.json'),**load('artists_en_b.json')}}
for l in ('fr','de','it','es'): caches[l]=load('artists_%s.json'%l)
SKIP={'no release','various artists','compilation'}
def url(lang,title): return 'https://%s.wikipedia.org/wiki/%s?action=raw'%(lang,urllib.parse.quote(title.replace(' ','_'),safe="()',!:&"))
DISAMB=re.compile(r'\{\{\s*(disambiguation|dab|hndis|disambig|surname|given name|Begriffsklärung|disambigua|desambiguación|homonymie|set index)',re.I)
def judge(lang,entry):
    t=entry['text']; title=entry['title']
    if not t: return {'status':'no article','why':'no %s Wikipedia article at this title'%lang}
    if DISAMB.search(t[:3000]+t[-3000:]): return {'status':'ambiguous','why':'%s title is a disambiguation page'%lang}
    lead=lead_line(t)
    if title.startswith(('List of','Liste ','Lista ','Elenco ')) or (not lead and title!=entry.get('asked',title)):
        return {'status':'no article','why':'the %s title redirects to a page that is not about the artist (%s)'%(lang,title)}
    if not lead: return {'status':'not found','why':'%s lead sentence not found'%lang}
    pl=plain(lead)
    fm=re.search(r"\b(is|was|are|were|est|était|ist|war|è|era|es|fue)\b(.{0,90})",pl,re.I)
    if fm and re.search(r"\b(studio album|album|LP|single|song|EP|extended play|soundtrack|compilation|charity record|chanson|Lied|canzone|canción|émission|programa|programma|reality|competition|television series|film|episode)\b",fm.group(2),re.I) and not re.search(r'\b(singer|band|group|musician|rapper|duo|DJ|producer|project|act|collective|actor|actress|comedian|presenter|personality|humorist|cartoonist|author|writer|entertainer|chanteur|chanteuse|Sänger|Sängerin|cantante|cantautore)\b',fm.group(2).split(' by ')[0]):
        return {'status':'ambiguous','why':'the %s article at this title is a record or a programme, not the artist: '%lang+pl[:120]}
    if not MUSIC.search(pl[:400]) and not re.search(r'musical_artist|Infobox (musician|band)|Infobox Musiker|Attività\s*=\s*(cantante|music)',t,re.I):
        return {'status':'ambiguous','why':'the %s article does not describe a musician: '%lang+pl[:120]}
    kind=kind_of(t,lead)
    nat,q1=first_sentence_nat(lead,lang)
    res={'kind':kind,'url':url(lang,title),'title':title,'lang':lang}
    if nat=='AMBIG': return dict(res,status='ambiguous',why='the lead names a nationality that is not one present country: '+plain(q1)[:120])
    if lang=='it':
        nl,nv=infobox_line(t,['Nazionalità'])
        if nl and not nat:
            c=D.get(plain(nv).lower().strip())
            if c: nat,q1=[c],nl
        if re.search(r'^\s*\|\s*Sesso\s*=',t,re.M): kind=kind or 'person'
    ol,ov=infobox_line(t,['origin',"pays d'origine",'origine','origen','Herkunft','Paese'])
    bl,bv=infobox_line(t,['birth_place','lieu de naissance','lugar_nacimiento','lugar de nacimiento','LuogoNascita','Geburtsort','GEBURTSORT'])
    one=lambda n:n if len(n)>1 else n[0]
    if kind=='group':
        if ol:
            c,p=country_of_place(ov)
            if c: return dict(res,status='ok',country=c,quote=ol,basis='infobox origin')
        if nat: return dict(res,status='ok',country=one(nat),quote=q1,basis='lead sentence')
        return dict(res,status='not found',why='group: the %s article gives no origin that names a country (%s)'%(lang,plain(ov or '')[:80] or 'no origin line'))
    if nat: return dict(res,status='ok' if kind else 'kind unclear',country=one(nat),quote=q1,basis='lead sentence' if not q1.startswith('|') else 'infobox nationality')
    if bl:
        c,p=country_of_place(bv)
        if c: return dict(res,status='ok' if kind else 'kind unclear',country=c,quote=bl,basis='infobox birth_place')
    return dict(res,status='not found',why='the %s article has no nationality in the lead and its birthplace names no country (%s)'%(lang,plain(bv or '')[:80] or 'no birthplace line'))

def langs_for(credit):
    return [LANGOF[c] for c,_ in ccs[credit].most_common() if c in LANGOF][:1]
def plainname(nm): return re.sub(r'\s*\([^)]*\)$','',nm)

def run():
    out=[]; need={l:set() for l in ('fr','de','it','es')}
    for c in creds:
        names=[(x,'linked') for x in c['linked']]+[(x,'unlinked') for x in c['unlinked'] if x.lower() not in SKIP and x[:1].isupper()]
        if not names:
            out.append({'credit':c['credit'],'rows':c['rows'],'artist':None,'status':'not an artist','why':'placeholder or unreadable credit: '+', '.join(c['unlinked'])}); continue
        if not c['linked'] and len(c['unlinked'])>1:
            e=caches['en'].get(c['credit'])
            if e and e['text'] and judge('en',e).get('status') in ('ok','kind unclear','not found'): names=[(c['credit'],'whole credit is one article')]
        for nm,how in names:
            tried=[]; best=None
            iw=re.match(r'^:(fr|de|it|es):(.+)$',nm)
            if iw:
                l,pn=iw.group(1),iw.group(2); need[l].add(pn); e2=caches[l].get(pn)
                best=judge(l,dict(e2,asked=pn)) if e2 else {'status':'not fetched'}
                if e2: tried.append(l)
                out.append(dict({'credit':c['credit'],'rows':c['rows'],'name_on_page':nm,'artist':pn,'how':how+' (link to the %s Wikipedia)'%l,'split':len(names)>1,'tried':tried},**best)); continue
            e=caches['en'].get(nm)
            if e is not None: e=dict(e,asked=nm)
            if e is None: best={'status':'not fetched'}
            else:
                best=judge('en',e); tried.append('en')
                if best['status']!='ok':
                    for l in langs_for(c['credit']):
                        pn=plainname(nm); need[l].add(pn)
                        e2=caches[l].get(pn)
                        if e2 is None: continue
                        e2=dict(e2,asked=pn)
                        r2=judge(l,e2); tried.append(l)
                        if r2['status']=='ok' or best['status']=='no article': best=dict(r2,why=(best.get('why','')+'; '+r2.get('why','')).strip('; ') if r2['status']!='ok' else None)
            if best.get('status') in ('ok','kind unclear') and (how!='linked' or best.get('lang','en')!='en'):
                e3=caches[best.get('lang','en')].get(plainname(nm) if best.get('lang','en')!='en' else nm) or {}
                if not names_song(c['credit'],e3.get('text'),nm):
                    best=dict(best,status='ambiguous',why='looked up by name (no link on the chart page, or another language); the %s article does not mention the charted song, so it may be someone else'%best.get('lang','en'))
            artist=best.get('title') or plainname(nm)
            out.append(dict({'credit':c['credit'],'rows':c['rows'],'name_on_page':nm,'artist':plainname(artist),'how':how,'split':len(names)>1,'tried':tried},**best))
    return out,need
if __name__=='__main__':
    out,need=run()
    json.dump(out,open('judged.json','w'),ensure_ascii=False,indent=0)
    json.dump({k:sorted(v) for k,v in need.items()},open('need_other.json','w'),ensure_ascii=False)
    print(collections.Counter(o['status'] for o in out), {k:len(v) for k,v in need.items()})
