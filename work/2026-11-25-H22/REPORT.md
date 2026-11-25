# H22: Records for six new genres
Date 2026-11-25, branch `helper/2026-11-25-h22`. The run was configured with model `claude-opus-5-5`; the serving model may differ. There were six sub-agents, one per genre, all on model `opus`, as the assignment asks. Each worked to `brief.md` in this folder.

The first open assignment was H23. A branch `helper/2026-11-25-h23` already exists for it, so this run skipped H23, took H22 and claimed it with an empty commit first.

## What was asked
Do as H14 did for six genres: copla / canción española, dōyō, música guajira / punto cubano, nanguan / nanyin, modern Amazigh band music, and batuku (with finaçon and tabanka as sub-genres). For each genre that means a genre record, a parent with the reason, presence (where and when), a definition with evidence and a first playlist with evidence.

## What is in this folder
- `brief.md`: the brief each sub-agent followed.
- `genres.add.json`: six genre records, shaped like H14's. Each has an `evidence` map pointing at `sources.json` (`<id>:<n>` is the claim's index).
- `parentage.add.json`: 16 lines. The two batuku lines to `finaçon` and `tabanka` are proposals, not mergeable: neither is an id (see below).
- `presence.add.json`: origin, peak and later lines, all `basis: first estimate`.
- `defs.add.json`, `playlists.add.json`, `sizes.json`: shaped like H13's.
- `sources.json`: 523 claims, each with an address, a string copied from the raw page and `read` 2026-11-25.
- `evidence-check.json`: the checker rerun on the merged `sources.json` by the run itself: **523 of 523 found**.
- `unverified.json`: per genre, title spellings (aliases) and what was dropped or left unchecked.
- `parts/<id>/`: each researcher's own files and `notes.md`. The notes cover confidence, sources, disagreements, neighbours with no id, what fell short and questions. Read them for the detail behind this summary.

## What was found
| id | Name | Parent (principal; others) | Began | Peak (judgement) | Playlist |
| :- | :- | :- | :- | :- | :- |
| `copla` | Copla (canción española) | `zarzuela`; `flamenco`, `pasodoble` | 1917, attested (El Relicario) | ES 1933–1960; MX later from 1955 | full: 24 songs, 4 albums |
| `doyo` | Dōyō (Japanese children's songs) | `shokaandgunka` | 1918, attested (Akai Tori) | JP 1919–1955 | full: 22 songs, 6 albums |
| `guajira` | Música guajira and punto cubano | `iberianpop`; children `twoubadou`, `flamenco` (other) | 1700, estimate | CU 1935–1965; ES later | full: 25 songs, 9 albums |
| `nanguan` | Nanguan / nanyin (Hokkien chamber music) | `yayue` | 1600, estimate (Ming songbooks) | CN 1980–2010, TW 1982–2010; SG, PH later | full: 24 songs, 11 albums |
| `amazighbands` | Amazigh band music (tazenzart and tagroupit) | `ghiwane`; `rways`, `amazighahwashandah` | 1972 | MA 1975–1995; FR later | full: 28 songs, 8 albums |
| `batuku` | Batuku (Cape Verdean batuque) | `wadrum` | 1772, marked attested (weak: see below) | CV 1995–2010; PT later | full: 23 songs, 6 albums |

Every principal parent is a judgement. No source states descent for any of them except guajira's Andalusian and Canary roots, and those come only through `iberianpop`, whose centre is Seville.

**Finaçon and tabanka.** The proposal is that finaçon becomes an alias and a marker of batuku, because it is the improvised verse sung inside a batuku session. A funaná band named Finaçon already exists as an artist in `data/`, so the alias has to match the genre word only. Tabanka is a separate Santiago procession tradition and should get its own record in a later round. It would sit beside batuku, not under it.

## Disagreements with our records
- **`iberianpop`'s name says "copla", but its dates are 1500–1800.** Copla, the 20th-century genre, only takes its name from the old verse form, so the copla researcher did not make it a child of `iberianpop`.
- **`pasodoble`'s playlist already holds sung coplas:** El relicario, Mi jaca, Francisco Alegre and Campanera. They were left out of copla's playlist so they are not duplicated.
- **La niña de fuego is already in the data** as Lola Flores with Manolo Caracol (1944). The copla playlist uses Caracol's solo track. One song or two?
- **Twoubadou has one more parent in the sources than in our data.** Our data ties it to son and bolero. English Wikipedia, citing Manuel, adds the guajiro traditions. It says "traditions", not "guitar style" as the research note had it.
- **`ghiwane` has `ended: 1990`,** but its Amazigh offshoot is still active.
- **Our families are mixed within one tradition:** `morna` is in family `folk`, while `funana` and `coladeira` are in `africa`. Batuku uses `africa`.

## Sources
The full list of titles and addresses for each genre is in `parts/<id>/notes.md`, section (b). In short:
- Wikipedia in Spanish, Japanese, Chinese, Portuguese, French and English.
- UNESCO's page on punto.
- The Tamazgha Studies Journal (Jones 2024), Yabiladi and other Moroccan press.
- The attambur.com PDF on Cape Verdean musical forms.
- The MusicBrainz web service and the iTunes lookup API for tracks.

## What fell short
- **Release years.** Most songs have none, because the tracks come from reissues and compilations. Copla has none at all. Dōyō's 1928–32 years assume the Victor reissues are the dated 78s.
- **Batuku's 1772.** It rests on one passage in Portuguese Wikipedia about a ban that names "zambunas", not batuku. English Wikipedia says written records exist only from the 19th century. Gláucia Nogueira's studies could not be fetched (one gave HTTP 503, the other host was unreachable). In my view `attested` should not stand for this date; it is the lead's call.
- **Spanish Wikipedia refused requests (HTTP 429)** for the Veloz, Coralia Fernández and Radeúnda Lima pages.
- **Missing recordings.** Nanguan has none by Han Tang Yuefu or Gang-a-Tsui, and its playlist leans on Taiwan. Dōyō has none by Motoori Midori. Amazigh band music has no verified Amarg Fusion song, and Ousmane has no catalogue page.
- **Weak ties.** Several songs are tied to their genre by an album or compilation title only, or through the artist only. Each `notes.md` lists them.
- **No scholarly monographs were read.** Manuel and Linares (guajira) and Schuyler (Amazigh) are among them.
- **Claim count.** It went over the brief's guide of about 60 per genre (76 to 97), because each song carries a track claim and a genre-tie claim.
- **English Wikipedia's Nanyin article** is flagged as containing language-model text, and it calls Quanzhou "廣州". It was used only alongside Chinese Wikipedia.

## Questions for the lead
1. **Parents (all judgements):**
   - copla: `zarzuela`, or a new cuplé record?
   - nanguan: `yayue`, or none until a Han–Tang court id exists?
   - batuku: `wadrum`, or none?
   - amazighbands: `ghiwane` or `rways` as principal?
2. **Should `iberianpop` be renamed** so that "copla" no longer points at 1500–1800?
3. **Should the four sung coplas in `pasodoble`'s playlist also be linked to `copla`?**
4. **Batuku's 1772:** keep it as `attested`, or make it an estimate?
5. **Finaçon as an alias of batuku:** is that acceptable, given the artist Finaçon? Should `tabanka` be queued as its own record?
6. **Guajira's scope:** one record covering punto, guajira and guajira-son, or should guajira-son stay under `son`? Should `guajira → twoubadou` rest on Wikipedia alone?
7. **New ids the researchers asked about:**
   - cuplé
   - Canary Islands folk
   - beiguan
   - Rif Amazigh song
   - Amazigh rock/fusion
   - shin-min'yō
   - and whether `doyo` should be a parent of `kayokyoku` or `anison`.
8. **Nanguan's peak:** the revival and recordings (1980–2010, used here), or the most associations (early 20th century)?
