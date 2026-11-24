# Proposal: what is validated, field by field

Dated 23 November 2026 (Pacific). Asked for by the owner: "song exists" is a low bar; a wrong year or country breaks the filters. This sets how much each field matters and how it is checked while data is collected. Not built.

## What each field is worth
Importance is how much a wrong value damages what the user sees. High = it drives a filter or the identity of the song. The right-hand columns say what is checked today and what should be.

| Record | Field | Importance | Why | Checked today | Check to add |
| :- | :- | :- | :- | :- | :- |
| Song | title, credited artists | High | Identity; the playlist prompt is built from them | Words found on the cited page | Match to a MusicBrainz recording; store its id |
| Song | released year | **High** | Drives the time filter | Nothing. Often a reissue or digital-release year | Earliest release year from MusicBrainz; must agree with the source within one year, else flagged |
| Song | duplicate of another song | **High** | Doubles a song in lists and counts | Exact artist and title at ingest only | Same title, main artists and year = one song, enforced by `tests/data.py` |
| Song | language | Medium | Home-grown share in the listener test | Nothing | From the source or MusicBrainz where given; else empty, not guessed |
| Song | written year | Low | Shown only | Nothing | None for now |
| Place link | country | **High** | Drives the place filter | The page is cited, but nothing says the page is that country's chart | Validate the source once: "this page is country X's chart for year Y"; its rows inherit that |
| Place link | year | **High** | Drives the time filter | Nothing separate from the page | Same source-level check; a song's link year may not be before its release year |
| Place link | home or foreign | Medium | Listener test, "made here" filter | Nothing | Derived from the artist's country, not typed in |
| Place link | chart position | Medium | Order of the list (D8) | Not stored | Copied from the chart row |
| Genre link | that the song belongs to the genre | **High** | It is the genre playlist | Words found on a page; the tie is often only an album title | Store the kind of tie: the page says the song is this genre / the artist is / only a title says so. Title-only ties are shown as weak and do not count toward "full" |
| Genre link | role (intro, peak) | Low | Order in the playlist | Nothing | Listener test only |
| Artist | name | High | Identity | Words found | MusicBrainz artist id |
| Artist | country (scene) | **High** | "Made here" and home or foreign | Nothing | MusicBrainz area; conflict flagged |
| Genre | start, end, peak | Medium | Time filter on genres, the tunnel | Start sometimes sourced | Stored as sourced or as estimate, and shown so |
| Genre | origin place | Medium | Map | Sometimes sourced | As above |
| Genre | definition, parents | Judgement | Reading and the tree | Definition claims found on pages | None: the lead decides (D9) |

## How the checks stay robust during collection
1. **Evidence per field, not per song.** Each high-importance field records which evidence supports it and one of three states: checked, estimate, conflict. A song with a checked title and an unchecked year is not "verified".
2. **A second, independent source for high fields.** MusicBrainz is open (CC0) and has a script interface. A script looks up each song and artist and compares year and country. Agreement = checked. Disagreement = conflict, kept and marked, with both values. No lookup match = stays unchecked.
3. **Rules a script can run over all data** (`tests/data.py`): link year not before release year; release year inside the genre's window, or flagged; home or foreign agrees with the artist's country; no two songs with the same title, main artists and year.
4. **Sources are validated once.** A chart page is checked as a source (which country, which year, ranked or not) and recorded. This is also where "heard there" (D7) is decided.
5. **The checker is tested against pages a person has seen** (`tests/evidence.py`), as now.
6. **The app shows the state.** Checked, estimate and conflict are marked on the fact, by colour or mark, so a wrong value is visible instead of silently trusted.

## Order of work
1. Duplicate songs (rule 3) and the Data tab showing each song once.
2. Release year and artist country from MusicBrainz (rule 2), starting with the place-and-time lists, because they drive the two main filters.
3. Source records for charts (rule 4) with chart position (D8).
4. Kind of genre tie.

## Not known
- How many songs MusicBrainz will match by script. Old and non-Western recordings are thinly covered there; for those the year will stay an estimate.
- Whether one request a second (MusicBrainz's limit) is fast enough for 11,000 songs in one run: about three hours, acceptable as a one-off.
