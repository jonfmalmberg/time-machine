"""Write sources.json for the evidence check (one claim per artist and source), then, after the check, origins.json and unverified.json."""
import json,sys,collections
W='/home/claude/time-machine/work/2026-11-24-H18/'
READ='2026-11-24'
j=json.load(open('judged.json'))
creds=json.load(open('credits.json'))
mode=sys.argv[1]
def key(o): return (o['url'],o['quote'])
if mode=='sources':
    seen={}; claims=[]
    for o in j:
        if o['status'] in ('ok','kind unclear') and key(o) not in seen:
            seen[key(o)]=len(claims)
            claims.append({'url':o['url'],'quote':o['quote'],'artist':o['artist'],'title':'','kind':'origin','basis':o['basis'],'country':o['country'],'read':READ})
    json.dump({'C':claims},open(W+'sources.json','w'),ensure_ascii=False,indent=1)
    print(len(claims))
else:
    ev=json.load(open(W+'evidence-check.json'))
    res={(e['url'],e['quote']):e for e in ev}
    origins=[];unver=[]
    for o in j:
        base={'credit':o['credit'],'artist':o['artist']}
        if o['status'] in ('ok','kind unclear'):
            e=res.get(key(o))
            r=e['result'] if e else 'not checked'
            rec=dict(base,kind=o['kind'],country=o['country'],url=o['url'],quote=o['quote'],read=READ)
            if r=='found' and o['status']=='ok': origins.append(rec)
            elif r=='found': unver.append(dict(rec,result='kind unclear',reason='country found and checked, but the article does not say whether this is a person or a group'))
            else: unver.append(dict(rec,result=r,reason='evidence check: %s %s'%(r,(e or {}).get('why',''))))
        else:
            unver.append(dict(base,name_on_chart_page=o.get('name_on_page'),result=o['status'],reason=o.get('why') or o['status'],url=o.get('url'),tried=o.get('tried')))
    with open(W+'origins.json','w') as f: f.write('[\n'+',\n'.join(json.dumps(x,ensure_ascii=False) for x in origins)+'\n]\n')
    with open(W+'unverified.json','w') as f: f.write('[\n'+',\n'.join(json.dumps(x,ensure_ascii=False) for x in unver)+'\n]\n')
    print(len(origins),len(unver),collections.Counter(u['result'] for u in unver))
