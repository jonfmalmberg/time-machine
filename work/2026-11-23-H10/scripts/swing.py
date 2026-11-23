import json,re,sys,html,unicodedata
SP='/tmp/claude-0/-home-claude-time-machine/837b263a-f5e3-5c59-9d53-c92e67050de0/scratchpad'
OUT=sys.argv[1]
W='https://en.wikipedia.org/wiki/'
F={'Dippermouth_Blues':'Dippermouth_Blues','Moten_Swing':'Moten_Swing',"It_Don%27t_Mean_a_Thing_(If_It_Ain%27t_Got_That_Swing)":'It_Don_t_Mean_a_Thing__If_It_Ain_t_Got_That_Swing_','King_Porter_Stomp':'King_Porter_Stomp','Sing,_Sing,_Sing_(With_a_Swing)':'Sing__Sing__Sing__With_a_Swing_',"One_O%27Clock_Jump":'One_O_Clock_Jump','Song_of_India_(song)':'Song_of_India__song_','Begin_the_Beguine':'Begin_the_Beguine','A-Tisket,_A-Tasket':'A_Tisket__A_Tasket',"Jumpin%27_at_the_Woodside":'Jumpin__at_the_Woodside','Moonlight_Serenade':'Moonlight_Serenade','In_the_Mood':'In_the_Mood','Body_and_Soul_(1930_song)':'Body_and_Soul__1930_song_','Tuxedo_Junction':'Tuxedo_Junction','Boogie_Woogie_Bugle_Boy':'Boogie_Woogie_Bugle_Boy','Take_the_%22A%22_Train':'Take_the__A__Train','Chattanooga_Choo_Choo':'Chattanooga_Choo_Choo'}
FITT='https://fittcollection.macewan.ca/node/46554'
C={ # title -> list of (url, quote)
'Sugar Foot Stomp':[('Dippermouth_Blues',"During Armstrong's tenure in the Fletcher Henderson Orchestra, the song was recorded on May 29, 1925 in a new arrangement by Don Redman under the title Sugarfoot Stomp.")],
'Moten Swing':[('Moten_Swing','"Moten Swing" (originally "Moten\'s Swing") is a 1932 jazz standard by Bennie Moten and his Kansas City Orchestra.'),('Moten_Swing','The 1932 "Moten Swing", written by Bennie and Buster Moten, recorded at Camden, New Jersey, on December 13, 1932')],
"It Don't Mean a Thing":[("It_Don%27t_Mean_a_Thing_(If_It_Ain%27t_Got_That_Swing)",'The song was first recorded by Ellington and his orchestra for Brunswick Records on February 2, 1932.')],
'King Porter Stomp':[('King_Porter_Stomp','On July 1, 1935, Benny Goodman and his orchestra recorded')],
'Sing, Sing, Sing':[('Sing,_Sing,_Sing_(With_a_Swing)','On July 6, 1937, "Sing, Sing, Sing" was recorded in Hollywood with Benny Goodman on clarinet')],
"One O'Clock Jump":[("One_O%27Clock_Jump",'Basie recorded "One O\'Clock Jump" several times after the original performance for Decca in June 1937.')],
'For Dancers Only':[(FITT,'For Dancers Only Performer/Group Jimmie Lunceford and his Orchestra Place of Recording New York, US Date of Recording 15 JUN 1937')],
'Song of India':[('Song_of_India_(song)','In January 1937, Tommy Dorsey recorded an instrumental jazz arrangement featuring Bunny Berigan on trumpet, which became a jazz standard.')],
'Begin the Beguine':[('Begin_the_Beguine','version by Artie Shaw and His Orchestra in 1938.')],
'A-Tisket, A-Tasket':[('A-Tisket,_A-Tasket','Ella Fitzgerald and Al Feldman (later known as Van Alexander), extended and embellished the rhyme into a jazz piece that was her breakthrough hit with the Chick Webb Orchestra in 1938.')],
"Jumpin' at the Woodside":[("Jumpin%27_at_the_Woodside",'"Jumpin\' at the Woodside" is a song first recorded in 1938 by the Count Basie Orchestra, and considered one of the band\'s signature tunes.')],
'Moonlight Serenade':[('Moonlight_Serenade',"It was an immediate phenomenon when released in May 1939 as an instrumental arrangement, though it had been adopted and performed as Miller's signature tune as early as 1938"),('Moonlight_Serenade','The song was recorded on April 4, 1939 at the RCA Victor Studios in New York City and released on the RCA Bluebird label.')],
'In the Mood':[('In_the_Mood','In 1983, the Glenn Miller recording from 1939 was inducted into the Grammy Hall of Fame.')],
'Body and Soul':[('Body_and_Soul_(1930_song)','One of the most famous and influential takes was recorded by Coleman Hawkins and His Orchestra on October 11, 1939, at their only recording session for Bluebird, a subsidiary of RCA Victor.')],
'Tuxedo Junction':[('Tuxedo_Junction','The song was introduced by Erskine Hawkins and His Orchestra, a college dance band previously known as the Bama State Collegians.'),('Tuxedo_Junction','RCA released it in 1939 and it climbed to #7 on the American pop charts.')],
'Boogie Woogie Bugle Boy':[('Boogie_Woogie_Bugle_Boy',"The Andrews Sisters' Decca recording reached number six on the U.S. pop singles chart in the spring of 1941 when the film was in release.")],
"Take the 'A' Train":[('Take_the_%22A%22_Train','In 1976, the 1941 recording by Duke Ellington on Victor Records was inducted into the Grammy Hall of Fame.')],
'Chattanooga Choo Choo':[('Chattanooga_Choo_Choo','In 1996, the 1941 recording of "Chattanooga Choo Choo" by Glenn Miller and His Orchestra was inducted into the Grammy Hall of Fame.')],
}
NOTE={'King Porter Stomp':'The sentence goes on "Fletcher Henderson\'s arrangement of the number"; the quote stops before it because the apostrophe follows a link and the check script would split the word.',
 'Sugar Foot Stomp':'The page spells it "Sugarfoot Stomp" (one word); it is Fletcher Henderson\'s 1925 recording of "Dippermouth Blues".',
 'Begin the Beguine':'Quote is the end of a sentence that has a citation mark ([6]) inside it; the part after the mark is quoted. The page gives the session as July 24, 1938.',
 'Tuxedo Junction':'The first quote names Erskine Hawkins and His Orchestra as introducing the song; the second (the next sentence) gives the 1939 RCA release.',
 'Moonlight Serenade':'The second quote gives the recording date but does not repeat Miller\'s name; the first names Miller and the May 1939 release.',
 'For Dancers Only':'Library catalogue record (Fitt Jazz Collection, MacEwan University) of the LP For dancers only (1936-1937), MCA 1307; the quote runs across the record\'s fields.'}
def norm(s):
    s=unicodedata.normalize('NFKD',s); s=''.join(c for c in s if not unicodedata.combining(c)).casefold()
    s=re.sub(r"[‘’“”'\"`´]",'',s); return re.sub(r'[^\w]+',' ',s).strip()
def pagetext(f):
    p=open(f,encoding='utf-8',errors='replace').read(); p=re.sub(r'(?is)<(script|style|noscript)\b.*?</\1>',' ',p)
    return norm(html.unescape(re.sub(r'(?s)<[^>]+>',' ',p)))
L=json.load(open(f'{SP}/links.json'))
src={'g:swing':[]}; out=[]
for r in L:
    if 'swing' not in r['file']: continue
    l=r['link']
    o=dict(scope='g:swing',song=l['song'],role=l['role'],site_title=r['title'],site_artist=r['artists'],site_year=(r['released'] or {}).get('year'))
    if l['role']=='near miss': continue
    cl=C.get(r['title'])
    if not cl:
        o.update(outcome='no readable source',detail='Three searches (Wikipedia article for the song, a web search, the MusicBrainz recording search) found no script-readable page giving a Goodman recording of "Let\'s Dance" in 1935. The Wikipedia article says the theme took its name from the 1934-1935 radio programme and gives no recording date; MusicBrainz lists only reissues (earliest 1958).'); out.append(o); continue
    o['claims']=[]
    for u,q in cl:
        url=u if u.startswith('http') else W+u
        f=f'{SP}/sw/'+('e77d8211' if u==FITT else F[u])+'.html'
        
        if norm(q) not in pagetext(f): print('FAIL',r['title'],q)
        c=dict(kind='recording',song=l['song'],role=l['role'],artist=r['artists'][0],title=r['title'],url=url,quote=q,read='2026-11-23')
        if r['title'] in NOTE: c['note']=NOTE[r['title']]
        src['g:swing'].append(c); o['claims'].append(dict(url=url,quote=q))
    o['outcome']='source found'; o['detail']=NOTE.get(r['title'])
    out.append(o)
json.dump(src,open(f'{OUT}/sources.swing.json','w'),ensure_ascii=False,indent=1)
json.dump(out,open(f'{OUT}/swing-outcomes.json','w'),ensure_ascii=False,indent=1)
print(len(out),sum(o['outcome']=='source found' for o in out))
