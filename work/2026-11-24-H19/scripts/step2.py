import json,re,unicodedata
R='/home/claude/time-machine/work/2026-11-24-wikicharts/'
from rows import load_rows; rows=load_rows(); A=json.load(open(R+'artists.D.json'))
pages=json.load(open('chartpages.json'))
def n(s):
    s=unicodedata.normalize('NFKD',s); s=''.join(c for c in s if not unicodedata.combining(c)).casefold()
    return re.sub(r'[^\w]+',' ',s).strip()
def links(text):
    out=[]
    for m in re.finditer(r'\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]',text):
        t=m.group(1).strip(); d=(m.group(2) or t)
        d=re.sub(r"'''?|<[^>]+>",'',d).strip()
        if ':' in t and t.split(':')[0].lower() in ('file','image','category','wikt','w'): continue
        out.append((d,t,m.start()))
    return out
bypage={}
for r in rows: bypage.setdefault(r['artist'],set()).add(r['page'])
SEP=re.compile(r'\s*(?:,|\bfeaturing\b|\bfeat\.?|\bft\.?|\bwith\b|\band\b|&|/|\bvs\.?|\bx\b|\+|\bet\b|\bcon\b|\by\b|\bund\b|\be\b)\s*',re.I)
out=[]
for a in A:
    cr=a['artist']; ncr=n(cr)
    cands={}
    for p in bypage.get(cr,()):
        t=pages[p]['text'] or ''
        # only lines that hold the credit's words
        for line in t.split('\n'):
            if not any(w in n(line) for w in ncr.split()[:2]): continue
            for d,tt,_ in links(line):
                nd=n(d)
                if nd and len(nd)>1 and (' '+nd+' ') in (' '+ncr+' '): cands.setdefault(nd,tt)
    # cover credit greedily with longest displays
    cover=[]; rest=' '+ncr+' '
    for nd in sorted(cands,key=len,reverse=True):
        if (' '+nd+' ') in rest:
            cover.append((nd,cands[nd])); rest=rest.replace(' '+nd+' ',' | ',1)
    leftover=[x.strip() for x in SEP.split(re.sub(r'\|',' , ',rest)) if x and n(x)]
    orig=[x.strip() for x in SEP.split(cr) if x and n(x)]
    leftover=[next((o for o in orig if n(o)==x),x) for x in leftover]
    if not cover: leftover=orig
    out.append({'credit':cr,'rows':a['rows'],'linked':[t for _,t in cover],'unlinked':leftover,'single':len(cover)==1 and not leftover})
json.dump(out,open('credits.json','w'),ensure_ascii=False,indent=0)
import collections
print(len(out),sum(1 for o in out if o['single']),sum(1 for o in out if not o['linked']),sum(1 for o in out if o['unlinked']))

