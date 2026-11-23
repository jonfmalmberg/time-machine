# jiangnansizhu: notes

## (a) Confidence

**`jiangnansizhu`.** I am fairly sure of the definition and the songs, and unsure of the size. All 72 claims are `found`. The definition rests on English Wikipedia's Jiangnan sizhu page (the region, Shanghai clubs, the core instruments erhu, dizi or xiao, pipa and yangqin, the unfixed line-up of two to ten players, the Eight Great Pieces, amateurs in teahouses) and Chinese Wikipedia's 江南丝竹 (in vogue from 1860, the name fixed in the 1950s, heterophony and the "你繁我簡" technique, the long qudi). Every track was read from MusicBrainz or iTunes lookup JSON. The genre ties are:
- **A performer page.** This covers six songs: English Wikipedia names the quartet of Lu Chunling, Ma Shenglong, Zhou Hui and Zhou Hao as players of the Jiangnan sizhu repertoire. Their 1983 China Record cassette is itself titled 三六（江南丝竹）.
- **The album title names the genre.** This covers 14 songs: 江南絲竹八大曲精編, 江南丝竹(上)/(下), Si-Zhu: Jiangnan Classics, Jiangnan Sizhu: Beautiful Traditional Music…, Yue Luo (… Jiangnan Sizhu Music), 江南絲竹, and 范临风's 江南丝竹音乐专辑. Rhymoi's track title says "(Jiangnan Si Zhu)".
- **Title only.** The Huxing Ting Teahouse Ensemble's "Zhonghua Liuban" (PAN, 1994) is tied only because the piece is one of the Eight Great Pieces and the album is called Sizhu. No page read describes the ensemble. Its name suggests Shanghai's Huxinting teahouse, but no page says so.

**Weak ties and gaps:**
- Release years are those of the edition read. The Naxos tracks carry 1992–93 dates but are given as 2002. The 2001 "中国地方音乐大系" ℗ may not be the recording year.
- The quartet's 怀古 has a null year, because its only page is a 2026 digital release.
- iTunes dates the quartet's album to 1970, while MusicBrainz gives the cassette as 1983. I used 1983.
- No pre-1949 recording was found.
- The guoyue near-miss matches the "China Broadcast National Orchestra" to Wikipedia's Central Broadcasting Station Orchestra by name only, and its year is null.

The size is a judgement, not a count.

**Parentage.** `data/parentage.json` has kunqu → jiangnansizhu as principal and guqin → jiangnansizhu as other. Chinese Wikipedia says the genre has some relation to kunqu, so that some think it grew from kunqu. It also says the Eight Great Pieces share no tunes (曲牌) with kunqu, and that the genre is closer to shifan luogu (十番锣鼓). The kunqu line is therefore disputed. No page read supports the guqin line. There is also a missing child line. English Wikipedia's Chinese orchestra page says the modern Chinese orchestra "first developed out of Jiangnan sizhu ensemble in the 1920s", and its Jiangnan sizhu page says the Shanghai sizhu "became the basis of the modern Chinese orchestra". That supports a jiangnansizhu → guoyue line, which the file does not have. The lead may want to add it.

## (b) Sources
- Jiangnan sizhu (English Wikipedia). <https://en.wikipedia.org/wiki/Jiangnan_sizhu>
- 江南丝竹 (Chinese Wikipedia). <https://zh.wikipedia.org/wiki/%E6%B1%9F%E5%8D%97%E4%B8%9D%E7%AB%B9>
- Chinese orchestra (English Wikipedia). <https://en.wikipedia.org/wiki/Chinese_orchestra>
- Nie Er (English Wikipedia). <https://en.wikipedia.org/wiki/Nie_Er>
- Guangdong music (genre) (English Wikipedia). <https://en.wikipedia.org/wiki/Guangdong_music_(genre)>
- 三六（江南丝竹）San Liu Silk-and-Bamboo Music of East China (MusicBrainz). <https://musicbrainz.org/release/50fa0fbb-b5da-43de-acf5-7def06f04ff0>
- Sizhu (Silk Bamboo): Chamber Music of South China (MusicBrainz). <https://musicbrainz.org/release/07ab419f-dbec-43a8-80a6-9462ea77a1b5>
- Jiangnan Sizhu: Beautiful Traditional Music from Southeastern China (MusicBrainz). <https://musicbrainz.org/release/190ec23c-59dc-41b4-9c0d-df02f9920769>
- China Si-Zhu: Jiangnan Classics (iTunes). <https://itunes.apple.com/lookup?id=362730662&entity=song>
- 江南絲竹八大曲精編 (iTunes). <https://itunes.apple.com/lookup?id=1804462468&entity=song>
- 江南丝竹(上) (中国地方音乐大系1) (iTunes). <https://itunes.apple.com/lookup?id=1417371955&entity=song>
- 江南丝竹(下) (中国地方音乐大系2) (iTunes). <https://itunes.apple.com/lookup?id=1417348863&entity=song>
- Yue Luo (Chinese Classic Music / Jiangnan Sizhu Music) (iTunes). <https://itunes.apple.com/lookup?id=465687004&entity=song>
- 丝竹生生——范临风江南丝竹音乐专辑 (iTunes). <https://itunes.apple.com/lookup?id=1767855692&entity=song>
- 江南絲竹, 華韻樂府 (iTunes). <https://itunes.apple.com/lookup?id=1089459347&entity=song>
- Musical Map of China – Classical Jiangnan Si Zhu (iTunes). <https://itunes.apple.com/lookup?id=1594141769&entity=song>
- 江南丝竹·欢乐歌 (iTunes). <https://itunes.apple.com/lookup?id=6789017059&entity=song>
- Dance of the Golden Snake, China Broadcast National Orchestra (iTunes). <https://itunes.apple.com/lookup?id=211825050&entity=song>

The following pages were read and gave nothing usable: Huxinting Teahouse (English and Chinese Wikipedia), and Cantonese music and Guangdong music (English Wikipedia; both are disambiguation pages).

## (c) Neighbours with no id in the tree
- **Shifan luogu (十番锣鼓).** It is the closest relative on Chinese Wikipedia: its suite 锣鼓四合 resembles 四合如意. It has no id.
- **Shanghai opera (沪剧).** English Wikipedia says its accompaniment is closely related to Jiangnan sizhu. It has no id.
- **Other regional sizhu.** These are Fujian nanguan and Chaozhou/Hakka string music, as on the PAN Sizhu album (Rao Ningxin, Su family ensemble, Xiamen Nanyue Tuan). None has an id. I did not stretch `guangdongmusic` to cover them; it is used only for a true Cantonese piece.

## (d) What fell short
- There are no historical recordings: nothing from the 78 rpm era or the 1950s–60s Shanghai clubs was found on a readable page.
- No liner notes were read. Ensemble ties beyond the quartet rest on album titles.
- The Seven Seas (Japan) set of all eight pieces lists its performer as [unknown], so it was not used.
- The Huxing Ting Teahouse Ensemble is tied by title only.
- The size is a judgement made before collecting, with low confidence.
- Playability on streaming services was not checked.
