"""Fetch English Wikipedia raw article text (following redirects) into a local cache; print passages around keywords."""
import json,os,re,sys,time,urllib.request,urllib.parse
C='/tmp/claude-0/-home-claude-time-machine/939457ce-56d0-5424-9e3d-c51378e92f96/scratchpad/h24'
os.makedirs(C,exist_ok=True)
UA='time-machine-research/1 (+https://github.com/jonfmalmberg/time-machine)'
def url(t,lang='en'): return 'https://%s.wikipedia.org/wiki/%s?action=raw'%(lang,urllib.parse.quote(t.replace(' ','_'),safe="()',!:&"))
def raw(t,lang='en'):
    f=os.path.join(C,lang+'_'+re.sub(r'[^\w]+','_',t)+'.txt')
    if os.path.exists(f): return open(f).read(),open(f+'.title').read()
    seen=t
    for _ in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url(seen,lang),headers={'User-Agent':UA}),timeout=40) as r: x=r.read().decode()
        except urllib.error.HTTPError as e:
            if e.code==404: return None,seen
            raise
        time.sleep(0.5)
        m=re.match(r'\s*#REDIRECT\s*\[\[([^\]|#]+)',x,re.I)
        if m: seen=m.group(1); continue
        break
    open(f,'w').write(x); open(f+'.title','w').write(seen); return x,seen
def grep(t,pat,w=150,n=3,lang='en'):
    x,title=raw(t,lang)
    if x is None: print('!! no page',t); return
    print('=== %s -> %s  %s'%(t,title,url(title,lang)))
    last=-10**9;i=0
    for m in re.finditer(pat,x,re.I):
        if i>=n: break
        if m.start()<last+w: continue
        last=m.start();i+=1
        s=max(0,m.start()-w); print('  …'+x[s:m.end()+w].replace('\n',' ⏎ ')+'…')
if __name__=='__main__':
    for a in sys.argv[1:]:
        t,p=a.split('::'); grep(t,p)
