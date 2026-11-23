import json,re,sys
from jp import rows,norm,SP
L=json.load(open(f'{SP}/links.json'))
R={y:rows(y) for y in range(1980,1990)}
def jp(t):
    while True:
        m=re.match(r'^(.*\S)\s*\(([^()]*)\)$',t)
        if m and re.fullmatch(r'[\x00-\x7fĀ-ſōūŌŪ]+',m.group(2)) and re.search(r'[^\x00-\x7f]',m.group(1)): t=m.group(1)
        else: return t
def art(a): return re.sub(r'\s*\([^()]*\)$','',a)
res=[]
for r in L:
    if 'JP' not in r['file']: continue
    l=r['link']; sc=l['scope']
    if not l.get('evidence'): res.append(dict(r=r,status='no source cited')); continue
    y=int(sc.split(':')[2]); title=jp(r['title']); nt=norm(title)
    hits=[]
    for row in R[y]:
        if not row['section'].startswith('シングル (日本) / 年間'): continue
        tc=row['cells'][-1].strip('「」'); nc=norm(tc)
        if nc and (nc==nt or (len(nt)>=2 and nt in nc) or (len(nc)>=2 and nc in nt)): hits.append(row)
    res.append(dict(r=r,status='hit' if hits else 'miss',hits=hits,jp=title))
json.dump(res,open(f'{SP}/jpmatch.json','w'),ensure_ascii=False)
for x in res:
    r=x['r'];l=r['link']
    if x['status']=='hit':
        h=x['hits'][0]; flag='' if norm(art(r['artists'][0]))[:3] in norm(h['cells'][1]) else ' ARTIST?'
        print('HIT',l['scope'],l.get('rank'),r['title'],r['artists'][0],'=>',h['text'],len(x['hits']),flag)
    else: print(x['status'].upper(),l['scope'],l.get('rank'),l['role'],r['title'],r['artists'])
