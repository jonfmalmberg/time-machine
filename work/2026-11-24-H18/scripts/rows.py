import json,re
R='/home/claude/time-machine/work/2026-11-24-wikicharts/'
_names={c['name']:c['id'] for c in json.load(open('/home/claude/time-machine/data/countries.json'))}
_names.update({'Czech Republic':'CZ','UK':'GB','US':'US'})
def load_rows():
    out=json.load(open(R+'chart.rows.json'))
    for r in json.load(open(R+'rows.partial.json')):
        if 'cc' not in r:
            m=re.search(r'\(([^)]+)\)\s*$',r['page']); r['cc']=_names.get(m.group(1)) if m else None
        out.append(r)
    return out
