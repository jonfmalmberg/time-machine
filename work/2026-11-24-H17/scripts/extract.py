import re
from demonyms import D
MUSIC=re.compile(r'sanger|sångare|sångerska|zanger|laulaja|yhtye|cantor|piosenkar|wokalist|raper|cântăre|şarkıcı|şarkıcı|pjeva|pevec|pevka|zpěvák|zpěvačka|énekes|zenekar|kapela|skupina|grupa|formație|formaţie|muzyk|muzician|muzikant|musikant|musiker|musikgrupp|duo|dj|\bmusic|\brap\b|hip hop|hip-hop|collective|\bact\b|musica|musique|musik|singer|band|group|musician|rapper|duo|trio|composer|songwriter|\bdj\b|disc jockey|producer|orchestra|choir|ensemble|vocalist|guitarist|pianist|entertainer|crooner|chansonnier|performer|artist|actor|actress|comedian|chanteur|chanteuse|groupe|musicien|compositeur|auteur|sänger|band|musiker|rapper|komponist|gruppe|duo|cantante|cantautore|gruppo|músico|cantautor|grupo|banda|conjunto|orquesta|rappeur|rapera?|trapper|cantautrice|musicista|produttore|produttrice|dj',re.I)
GROUPW=re.compile(r"\b(band|group|duo|trio|quartet|quintet|orchestra|choir|ensemble|collective|supergroup|boy band|girl group|project|groupe|gruppe|gruppo|grupo|banda|conjunto|orquesta|formation|chorale|coro|showband)s?\b",re.I)
def plain(s):
    s=re.sub(r'[\x00-\x03]+',' ',s); s=re.sub(r'<!--.*?-->',' ',s,flags=re.S)
    s=re.sub(r'<ref[^>]*/>|<ref[^>]*>.*?</ref>','',s,flags=re.S)
    s=re.sub(r'\{\{(?:lang|nowrap|nobr|ill|interlanguage link)\|(?:[a-z-]+\|)?([^|}]+)[^}]*\}\}',r'\1',s,flags=re.I)
    for _ in range(3): s=re.sub(r'\{\{[^{}]*\}\}','',s)
    s=re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]',r'\1',s)
    s=re.sub(r"'''?|<[^>]+>",'',s)
    return re.sub(r'\s+',' ',s).strip()
def country_of_place(val):
    p=plain(val)
    p=re.sub(r'\(.*?\)','',p).strip(' .,;')
    if not p: return None,p
    parts=[x.strip(' .') for x in re.split(r',|\bnow\b',p) if x.strip(' .')]
    last=parts[-1].lower() if parts else ''
    if last in D: return D[last],p
    return None,p
def mask(t):
    t=re.sub(r'<!--.*?-->',lambda m:'\x00'*len(m.group(0)),t,flags=re.S)
    t=re.sub(r'<ref[^>/]*/>|<ref[^>]*>.*?</ref>',lambda m:'\x01'*len(m.group(0)),t,flags=re.S|re.I)
    for _ in range(10):
        t2=re.sub(r'\{\{[^{}]*\}\}',lambda m:'\x02'*len(m.group(0)),t)
        if t2==t: break
        t=t2
    t=re.sub(r'\{\|.*?\|\}',lambda m:'\x03'*len(m.group(0)),t,flags=re.S)
    return t
Q3="'"*3
def lead_line(t):
    """the raw lead paragraph with templates, refs and comments masked out (same length as the raw text)"""
    m=mask(t)
    for mm in re.finditer(Q3,m):
        ls=m.rfind('\n',0,mm.start())+1
        if m[ls:ls+1] in ('|','!','*','#','=',':',';'): continue
        end=m.find('\n\n',mm.start()); end=len(m) if end<0 else end
        return m[ls:end].replace('\n',' ')
    return None
OCC=r"(?:proyecto|projet|progetto|project|trio|trío|singer|band|group|musician|rapper|duo|trio|composer|songwriter|DJ|disc jockey|record producer|producer|orchestra|choir|ensemble|vocalist|guitarist|pianist|entertainer|actor|actress|comedian|chanteur|chanteuse|groupe|musicien|compositeur|auteur|Sänger|Sängerin|Musiker|Musikerin|Rapper|Rapperin|Popsänger|Schlagersänger|Komponist|Gruppe|Band|cantante|cantautore|cantautrice|gruppo|rapper|músico|cantautor|grupo|banda|conjunto|orquesta|rappeur|rappeuse|personality|artist|performer|crooner|producer|television)"
def first_sentence_nat(line,lang='en'):
    """returns (codes, quote): the quote is a verbatim piece of the raw lead free of templates, refs and comments, holding the nationality"""
    masked=re.sub(r'[\x00-\x03]+','\x00',line); line=masked
    if lang not in ('en','de','fr','it','es'):
        # other languages: the first sentence after the bold name
        b=[x.end() for x in re.finditer("'''",masked[:400])]
        st0=b[-1] if b else 0
        rest=masked[st0:]
        e=re.search(r"\.\s+[A-ZÀ-ÝĀ-ſ]",rest)
        seg=rest[:e.start() if e else 400][:400]
        g=re.search(r"(sanger|sångare|sångerska|sångare|zanger|laulaja|muusikko|yhtye|cantor|cantora|piosenkar|wokalist|raper|rapper|cântăre|şarkıcı|şarkıcı|pjeva|pevec|pevka|zpěvák|zpěvačka|énekes|zenekar|kapela|skupina|grupa|formație|formaţie|muzyk|muzician|musiker|musikgrupp|popgrupp|band|duo|trio|DJ|artist|zespół|grupo|banda|producent|produtor|kompozytor|säveltäjä|komponist|låtskriver|låtskrivare|sangskriver|dramatiker|musikktrio)",seg,re.I)
        if g:
            tail=seg[g.end():g.end()+(110 if lang in ('pt','ro') else 60)]
            if lang in ('pt','ro'): c=re.search(r";|\s–\s|\bque\b|\bcare\b|\bconhecid|\bcunoscut",tail)
            else: c=re.search(r",|;|\s–\s|\bder\b|\bsom\b|\bjoka\b|\bque\b|\bcare\b|\bktóry|\bkterý|\baki\b|\btagjai\b|\bfra\b|\bfrån\b|\buit\b|\bz\b|\bze\b|\bdin\b|\bda\b|\bdo\b|\bde\b",tail)
            seg=seg[:g.end()+(c.start() if c else len(tail))]
    elif lang in ('en','de'):
        m=re.search(r"\b(is|was|are|were|ist|war|sind|waren)\b([^\n]{0,260}?)"+(r"\b" if lang=='en' else '')+OCC,masked,re.I)
        if not m: return None,None
        seg=masked[m.start():m.end()]
    else:
        m=re.search(r"\b(est|était|sont|étaient|è|era|sono|erano|stati|es|fue|son|fueron)\b([^\n]{0,160}?)"+r"\b"+OCC+r"[^\n.;:,]{0,120}",masked,re.I)
        if not m: return None,None
        seg=masked[m.start():m.end()]
        st=re.search(r"( \(|\b(?:chantant|en langue|de langue|d'origine|originaire|née?\b|qui\b|que\b|en lengua|en idioma|in lingua|en castellano|en español|en anglais|en inglés|in inglese|nacid[oa]|nat[oa]\b))",seg)
        if st: seg=seg[:st.start()]
    if lang in ('en','de') and False:
        pass
    if lang in ('en','de'):
        vs=list(re.finditer(r"\b(is|was|are|were|ist|war|sind|waren)\b",seg))
        if len(vs)>1: seg=seg[vs[-1].start():]   # the nearest verb before the occupation describes this artist
    if re.search(r"\b(child|son|daughter|wife|husband|brother|sister|member|mother|father|widow|niece|nephew|grandson|granddaughter) of\b",plain(seg)): return None,None
    if re.search(r"\. [A-Z]",plain(seg)): return None,None   # the nationality and the occupation are in different sentences
    pieces=[p for p in re.split(r'[\x00-\x03]+',seg) if p.strip()]
    found=[]; qp=[]
    for piece in pieces:
        p=plain(piece)
        low=p.lower().replace('–','-').replace('—','-')
        low=re.sub(r"\b[\w]+(?: [\w]+)?[ -]born\b",' ',low)
        low=re.sub(r"\b[\w]+(?: [\w]+)?[ -]based\b",' ',low)
        low=re.sub(r"\bof [\w]+(?: [\w]+)? (origin|descent|heritage|parentage|ancestry)\b",' ',low)
        low=re.sub(r'african-american|african american','american',low)
        low=re.sub(r"\b(?:med|with|mit|met|z|com|de)\s+(?:[\w]+[ -])?[\w]+\s+(?:bakgrunn|bakgrund|baggrund|afkomst|herkomst|achtergrond|ursprung|opprinnelse|oprindelse|origem|ascendência|herkunft|background)\b",' ',low)
        low=re.sub(r"\b(?:pochodzenia|původu|pôvodu|podrijetla|porijekla|de origem|de origen|d'origine|di origine)\s+[\w-]+",' ',low)
        low=re.sub(r"\b[\w-]+\s+(?:származású|kökenli|syntyperäinen|juurinen|taustainen)\b",' ',low)
        toks=re.split(r"[\s\-/,()]+",low)
        i=0; hit=False
        while i<len(toks):
            two=' '.join(toks[i:i+2]); three=' '.join(toks[i:i+3])
            if three in D: c=D[three]; i+=3
            elif two in D and ' ' in two: c=D[two]; i+=2
            elif toks[i] in D and toks[i] not in ('us','uk','usa','grupo','banda','argentina','svizzera','suiza'): c=D[toks[i]]; i+=1
            else: i+=1; continue
            if c is None: return 'AMBIG',piece.strip()
            hit=True
            if c not in found: found.append(c)
        if hit: qp.append(piece)
    if len(qp)>1: return 'AMBIG',' / '.join(q.strip() for q in qp)
    q=qp[0].strip() if qp else None
    if q and q.count('[[')>q.count(']]'):
        k=line.find(q); e=line.find(']]',k+len(q))
        if k>=0 and 0<=e-k-len(q)<60: q=line[k:e+2]
    return (found or None),q
def infobox_line(t,keys):
    for k in keys:
        m=re.search(r'^\s*\|\s*'+k+r'\s*=\s*(.+)$',t,re.M|re.I)
        if m and plain(re.split(r'<!--|<ref',m.group(1))[0]):
            line=re.split(r'<!--|<ref',m.group(0))[0].rstrip()
            return line.strip(),re.split(r'<!--|<ref',m.group(1))[0]
    return None,None
def kind_of(t,lead):
    if re.search(r'background\s*=\s*group',t,re.I): return 'group'
    if re.search(r'background\s*=\s*(solo|non_vocal|person|classical|composer|cultural|band_member)',t,re.I): return 'person'
    if re.search(r'^\s*\|\s*(birth_date|born|birth_place|lieu de naissance|date de naissance|fecha_nacimiento|lugar_nacimiento|Sesso|GEBURTSDATUM|GEBURTSORT)\s*=\s*\S',t,re.M|re.I): return 'person'
    if re.search(r'^\s*\|\s*(years_active|origin)\s*=',t,re.M|re.I) and re.search(r'^\s*\|\s*(current_members|past_members|members)\s*=',t,re.M|re.I): return 'group'
    if lead:
        p=plain(lead)
        m=re.search(r"\b(is|was|are|were|est|était|sont|ist|war|sind|waren|è|era|sono|stati|es|fue|son|fueron|er|var|är|on|oli|ovat|olivat|é|foi|este|jest|był|była|je|bio|bila|byl|byla|byli|volt|zijn|waren)\b(.{0,160})",p) or re.match(r"()(.{0,220})",p)
        if m and (GROUPW.search(m.group(2)) or re.search(r'(trio|duo|band|gruppe|orchester|chor|yhtye|grupa|skupina|kapela|zenekar|groep|formație|formaţie|grup|musikgrupp|popgrupp|rockgrupp|bandet|gruppen|zespół|zespol)\b',m.group(2),re.I)): return 'group'
        if m and re.search(r'\b(singer|rapper|musician|songwriter|actor|actress|composer|vocalist|guitarist|pianist|comedian|DJ|producer|chanteur|chanteuse|musicien|musicienne|auteur|compositeur|compositrice|rappeur|rappeuse|Sänger|Sängerin|Rapper|Rapperin|Musiker|Musikerin|Komponist|Komponistin|Influencer|cantante|cantautore|cantautrice|cantautor|cantautora|músico|actriz|attore|attrice|sanger|sangerinde|sångare|sångerska|zanger|zangeres|laulaja|cantor|cantora|piosenkar|wokalist|raper|rapper|cântăre|şarkıcı|şarkıcısı|pjevač|pjevačica|pevec|pevka|zpěvák|zpěvačka|énekes|énekesnő|muzyk|muzician|muzikant|räppäri|rap-artisti|låtskrivare|sangskriver|tekstforfatter|zangeres|kompozytor)',m.group(2),re.I): return 'person'
        if re.search(r'Sänger(in)?\b|sänger(in)?\b|\(born\b|\bborn\b|\* ',p): return 'person'
    return None
