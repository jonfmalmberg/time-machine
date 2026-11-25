"""Check every quote is a verbatim piece of the cached raw page, then write claims.json and sources.json."""
import json,sys
from wiki import raw,url
from claims import C
W='/home/claude/time-machine/work/2026-11-24-H24/'
READ='2026-11-24'
S=json.load(open(W+'scripts/sentences.json'))
assert set(C)<=set(s['id'] for s in S), set(C)-set(s['id'] for s in S)
bad=0; claims=[]; sources=[]
def check(t,q):
    global bad
    x,title=raw(t)
    if x is None or q not in x: print('NOT IN PAGE',t,'|',q); bad+=1
    return url(title)
for s in S:
    cls,t,q,note,also=C.get(s['id'],('opinion',None,None,'',[]))
    rec={'id':s['id'],'chapter':s['chapter'],'sentence':s['sentence'],'class':cls,'url':None,'quote':None,'note':note or ''}
    if t:
        rec['url']=check(t,q); rec['quote']=q
        sources.append({'url':rec['url'],'quote':q,'artist':'','title':s['id'],'claim':s['sentence'],'read':READ})
    rec['also']=[]
    for t2,q2 in also:
        u2=check(t2,q2); rec['also'].append({'url':u2,'quote':q2})
        sources.append({'url':u2,'quote':q2,'artist':'','title':s['id'],'claim':s['sentence'],'read':READ})
    claims.append(rec)
print('bad',bad,'claims',len(claims),'sources',len(sources))
if bad: sys.exit(1)
with open(W+'claims.json','w') as f: f.write('[\n'+',\n'.join(json.dumps(c,ensure_ascii=False) for c in claims)+'\n]\n')
json.dump({'course':sources},open(W+'sources.json','w'),ensure_ascii=False,indent=1)
