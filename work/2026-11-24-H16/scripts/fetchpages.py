import json,sys,time,urllib.request,urllib.parse,os,re
UA='time-machine-research/1 (+https://github.com/jonfmalmberg/time-machine)'
def raw(lang,title):
    u='https://%s.wikipedia.org/wiki/%s?action=raw'%(lang,urllib.parse.quote(title.replace(' ','_'),safe="()',!:&"))
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':UA}),timeout=40) as r: return r.read().decode('utf-8','replace')
        except urllib.error.HTTPError as e:
            if e.code==404: return None
            print('retry',e.code,title,file=sys.stderr); time.sleep(10*(i+1))
        except Exception as e: print('retry',e,file=sys.stderr); time.sleep(5)
    return False
def fetch1(lang,t):
    seen=t
    for hop in range(3):
        x=raw(lang,seen); time.sleep(0.6)
        if x is False: return None
        if x is None: return {'title':seen,'text':None}
        m=re.match(r'\s*#(?:REDIRECT|WEITERLEITUNG|RINVIA|REDIRECCIÓN|REDIRECTION)\s*\[\[([^\]|#]+)',x,re.I)
        if m: seen=m.group(1).strip(); continue
        return {'title':seen,'text':x}
    return {'title':seen,'text':None}
def get(lang,titles,cachefile):
    cache=json.load(open(cachefile)) if os.path.exists(cachefile) else {}
    todo=[t for t in dict.fromkeys(titles) if t not in cache or cache[t]['text'] is None and cache[t].get('retry',True)]
    for i,t in enumerate(todo):
        r=fetch1(lang,t)
        if r: r['retry']=False; cache[t]=r
        if i%50==0:
            print(i,len(todo),file=sys.stderr); json.dump(cache,open(cachefile,'w'))
    json.dump(cache,open(cachefile,'w'))
    return cache
