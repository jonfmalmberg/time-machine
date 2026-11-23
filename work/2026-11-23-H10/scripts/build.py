import json,re,sys
from jp import rows,norm,SP
OUT=sys.argv[1]
READ='2026-11-23'
L=json.load(open(f'{SP}/links.json'))
M={(x['r']['link']['scope'],x['r']['link']['song']):x for x in json.load(open(f'{SP}/jpmatch.json'))}
R={y:rows(y) for y in range(1980,1990)}
def jpurl(y): return f'https://ja.wikipedia.org/wiki/{y}年の音楽'
def art(a): return re.sub(r'\s*\([^()]*\)$','',a)
# chosen chart row by (year, page rank) for multi-hit or manual cases
manual={ # (scope,title-start): (rank or None, quote, class, note)
 ('c:JP:1980','昴'):('12位 谷村新司 「昴 -すばる-」','found: annual singles chart',None),
 ('c:JP:1980','さよなら'):('9位 オフコース 「さよなら」','found: annual singles chart',None),
 ('c:JP:1982','哀愁のカサブランカ'):('14位 郷ひろみ 「哀愁のカサブランカ」','found: annual singles chart',None),
 ('c:JP:1983','氷雨'):('5位 佳山明生 「氷雨」','found: annual singles chart','The same chart also has 15位 日野美歌 「氷雨」, a different recording of the same song.'),
 ('c:JP:1980',"I'm in the Mood"):('27位 ノーランズ 「ダンシング・シスター」','found under another title','The row names The Nolans with the Japanese release title 「ダンシング・シスター」; the page does not say this is "I\'m in the Mood for Dancing".'),
 ('c:JP:1981','Ai No Corrida'):('46位 クインシー・ジョーンズ 「愛のコリーダ」','found: annual singles chart','Title on the page in Japanese script (愛のコリーダ = Ai no Corrida).'),
 ('c:JP:1982','Casablanca'):('39位 バーティ・ヒギンズ 「カサブランカ」','found: annual singles chart','Title and artist in katakana.'),
 ('c:JP:1983','Flashdance'):('9位 アイリーン・キャラ 「フラッシュダンス…ホワット・ア・フィーリング」','found: annual singles chart','Title and artist in katakana.'),
 ('c:JP:1984','Thriller'):('1位 マイケル・ジャクソン 『スリラー』','not found as a song: the album of that name','The page names only the album 『スリラー』 (1位 in the annual album chart) and the Grammy for the album; no single.'),
 ('c:JP:1984','Footloose'):('特別賞 ケニー・ロギンス「フットルース」','found: award, not a chart','Named among the special prizes of the 13th FNS Kayousai; the soundtrack album is 2位 in the album chart; not in the singles chart.'),
 ('c:JP:1984','Karma Chameleon'):('最優秀シングル カルチャー・クラブ「カーマは気まぐれ」','found: foreign award only','Named only as the 4th BPI Awards (UK) best single, under its Japanese title; says nothing of Japan.'),
 ('c:JP:1985','We Are the World'):('25位 USA for AFRICA 「ウィ・アー・ザ・ワールド」','found: annual singles chart',None),
 ('c:JP:1985','Overnight Success'):('47位 テリー・デサリオ 「オーバーナイト・サクセス」','found: annual singles chart','Title and artist in katakana.'),
 ('c:JP:1985','The NeverEnding Story'):('42位 リマール 「THE NEVER ENDING STORY」','found: annual singles chart','Artist in katakana (リマール = Limahl); title spelled "THE NEVER ENDING STORY".'),
 ('c:JP:1986',"Papa Don't Preach"):('マドンナ 「リヴ・トゥ・テル」 「パパ・ドント・プリーチ」','found: list of foreign singles, not a chart','The 洋楽シングル table lists foreign singles of the year with no rank and no Japanese measure.'),
 ('c:JP:1987','Bad'):('マイケル・ジャクソン 「バッド」','found: list of foreign singles, not a chart','The 洋楽シングル table lists foreign singles of the year with no rank and no Japanese measure.'),
 ('c:JP:1989','Like a Prayer'):('マドンナ 「ライク・ア・プレイヤー」「エクスプレス・ユアセルフ」','found: list of foreign singles, not a chart','Also 25位 マドンナ 『ライク・ア・プレイヤー』 in the annual album chart (the album).'),
}
notfound={('c:JP:1986','Greatest Love of All'),('c:JP:1986','Part-Time Lover'),('c:JP:1987','Danger Zone'),('c:JP:1987','I Wanna Dance')}
src={}; outcomes=[]
for r in L:
    if 'JP' not in r['file']: continue
    l=r['link']; sc=l['scope']
    o=dict(scope=sc,song=l['song'],role=l['role'],site_rank=l.get('rank'),site_title=r['title'],site_artist=r['artists'],site_year=(r['released'] or {}).get('year'),evidence=[e['id'] for e in r['evidence']],url=None)
    if not l.get('evidence'):
        o.update(outcome='no source cited',detail='The decade link has no evidence id; nothing to check. Not researched further (the assignment says not to look for another source).'); outcomes.append(o); continue
    y=int(sc.split(':')[2]); url=r['evidence'][0]['url']; o['url']=url
    key=next((k for k in list(manual)+list(notfound) if k[0]==sc and r['title'].startswith(k[1])),None)
    if key in notfound:
        o.update(outcome='not found on the cited page',detail='Neither the title (in English or the usual katakana form) nor the song appears in any table or list on the page; the artist may be named for other works.'); outcomes.append(o); continue
    if key:
        q,cls,note=manual[key]
    else:
        x=M[(sc,l['song'])]; h=x['hits'][0]; q=h['text']; cls='found: annual singles chart'; note=None
    # verify the quote is a row/cell substring on our raw parse
    ok=any(norm(q) in norm(rr['text']) for rr in R[y])
    assert ok,(sc,q)
    m=re.match(r'(\d+)位',q); o['page_rank']=int(m.group(1)) if m and 'chart' in cls else None
    o.update(outcome=cls,quote=q,detail=note)
    outcomes.append(o)
    src.setdefault(sc,[]).append(dict(kind='link',song=l['song'],artist=art(r['artists'][0]),title=r['title'],url=url,quote=q,read=READ,**({'note':note} if note else {})))
json.dump(src,open(f'{OUT}/sources.jp.json','w'),ensure_ascii=False,indent=1)
json.dump(outcomes,open(f'{OUT}/jp-outcomes.json','w'),ensure_ascii=False,indent=1)
import collections; print(collections.Counter(o['outcome'] for o in outcomes))
