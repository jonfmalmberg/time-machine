"""Split every lecture paragraph of data/course.json into sentences, numbered chapter.paragraph.sentence."""
import json,re
d=json.load(open('/home/claude/time-machine/data/course.json'))
out=[]
for i,c in enumerate(d['chapters'],1):
    for j,p in enumerate(c['p'],1):
        parts=re.split(r'(?<=[.?!])\s+(?=[A-Z\[])',p)
        for k,s in enumerate(parts,1): out.append({'id':'%d.%d.%d'%(i,j,k),'chapter':i,'title':c['title'],'sentence':s})
if __name__=='__main__':
    json.dump(out,open('/home/claude/time-machine/work/2026-11-24-H24/scripts/sentences.json','w'),ensure_ascii=False,indent=0)
    for o in out: print(o['id'],o['sentence'])
    print(len(out))
