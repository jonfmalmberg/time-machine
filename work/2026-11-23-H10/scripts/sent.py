import re,html,sys
def text(f):
    p=open(f,encoding='utf-8',errors='replace').read()
    p=re.sub(r'(?is)<(script|style)\b.*?</\1>',' ',p)
    pass
    p=re.sub(r'(?i)<(/p|/li|/tr|br|/h\d|/th|/td)[^>]*>','\n',p)
    t=html.unescape(re.sub(r'<[^>]+>','',p))
    return [re.sub(r'[ \t]+',' ',l).strip() for l in t.split('\n') if l.strip()]
if __name__=='__main__':
    pats=sys.argv[2:]
    for l in text(sys.argv[1]):
        if all(re.search(p,l) for p in pats): print('*',l[:600])
