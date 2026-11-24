import json,re,sys
creds=json.load(open('credits.json')); j=json.load(open('judged.json'))
byc={}
for x in j: byc.setdefault(x['credit'],[]).append(x)
SEPW=re.compile(r'&|\band\b|\bet\b|\by\b|\be\b|\bund\b|\bog\b|\boch\b|\bja\b|\bi\b|\bcon\b|\bwith\b|/|\+|,|\bx\b|\bvs\b|feat',re.I)
lines=[]
for c in creds:
    rs=byc.get(c['credit'],[]); hows={r.get('how') or '' for r in rs}
    dropped=[u for u in c['unlinked'] if not u[:1].isupper() and u.lower() not in ('no release','various artists','compilation')]
    why=None
    if any(h.startswith('whole credit') for h in hows): why='no link on the chart page; whole credit is one article, taken as one artist'
    elif c['linked'] and [u for u in c['unlinked'] if u[:1].isupper()]: why='partly linked; unlinked part looked up by name: '+', '.join(u for u in c['unlinked'] if u[:1].isupper())
    elif not c['linked'] and len(c['unlinked'])>1: why='no link on the chart page; split on the joining words'
    elif not c['linked'] and SEPW.search(c['credit']) and len(c['unlinked'])==1: why='no link on the chart page; joining word present but not split'
    if dropped: why=(why+'; ' if why else '')+'piece not matched to any artist: '+', '.join(dropped)
    if why: lines.append('- %s → %s (%s)'%(c['credit'],' + '.join(sorted({str(r.get('artist')) for r in rs})),why))
open(sys.argv[1],'w').write('# Credits whose split is uncertain\n\nEach line: the credit → the artists it was split into (why it is uncertain).\n\n'+'\n'.join(lines)+'\n'); print(len(lines))
