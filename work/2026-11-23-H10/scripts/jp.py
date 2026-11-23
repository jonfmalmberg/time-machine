import re,html,json,sys,unicodedata
SP='/tmp/claude-0/-home-claude-time-machine/837b263a-f5e3-5c59-9d53-c92e67050de0/scratchpad'
def clean(s):
    s=re.sub(r'(?s)<sup.*?</sup>','',s)
    s=re.sub(r'<br[^>]*>',' ',s)
    s=html.unescape(re.sub(r'(?s)<[^>]+>','',s))
    return re.sub(r'\s+',' ',s).strip()
def rows(y):
    p=open(f'{SP}/pages/{y}.html',encoding='utf-8').read()
    b=p[p.find('id="mw-content-text"'):]
    h2=h3=''; out=[]
    pos=0
    for m in re.finditer(r'(?s)<h([23])[^>]*>(.*?)</h\1>|<table class="wikitable.*?</table>',b):
        g=m.group(0)
        if not g.startswith('<table'):
            t=clean(m.group(2))
            if m.group(1)=='2': h2,h3=t,''
            else: h3=t
            continue
        for tr in re.findall(r'(?s)<tr[^>]*>(.*?)</tr>',g):
            cells=[clean(c) for c in re.findall(r'(?s)<t[dh][^>]*>(.*?)</t[dh]>',tr)]
            if cells and any(cells): out.append(dict(section=(h2+' / '+h3).strip(' /'),cells=cells,text=' '.join(c for c in cells if c)))
    return out
def norm(s):
    s=unicodedata.normalize('NFKC',s).casefold()
    return re.sub(r'[^\w]+','',s)
if __name__=='__main__':
    for r in rows(int(sys.argv[1]))[:int(sys.argv[2])]: print(r['section'],'|',r['text'])
