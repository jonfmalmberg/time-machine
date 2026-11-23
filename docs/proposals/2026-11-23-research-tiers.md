# Proposal: research in tiers, with weights and acceptance tests

**Status:** proposal by Claude, 23 November 2026, from the owner's direction of the same day. Not agreed. Nothing here is built. Numbers marked *(set)* are choices to be confirmed or changed; numbers marked *(measure)* are unknown until the first pass has run.

## The problem

Today every list is one size. A genre has 12 to 18 songs because that fills a Spotify prompt. A country-year is "researched" at 6 home-grown songs whether it is Malaysia 1962 or the United States 2026, where a real chart has 100. Every song counts the same. Research goes wherever the last request pointed. None of that fits the goal: playlists that are accurate, long enough to live in, and made of what the listener has not heard yet.

Four things are needed, and each depends on the one before:

1. **Scopes with tiers.** A fixed unit of research with named depths, so "done" means something.
2. **An order.** Breadth first, weighted by how much each unit matters to listeners.
3. **Weights on songs.** How characteristic a song is of its scope, kept as separate parts so they can be tuned.
4. **Acceptance tests per scope and pass.** Like a factory acceptance test: a unit is tested against its own specification before it ships, and only then tested as part of the whole.

## 1. Scopes and tiers

There are two kinds of scope. A **genre**. And a **country-year**, researched in blocks of one **country-decade**.

### Genre tiers

The target is listening time, with a song count as the usual equivalent. Genres of long pieces (raga, opera, gamelan) reach the time with fewer recordings.

| Tier | Name | Songs | Listening time | What it is for |
| :- | :- | -: | -: | :- |
| G0 | Named | 0 | | On the tree and map only. 132 genres today |
| G1 | Defined | 12 to 18 | about 1 hour | Definition, reference tracks, seeds for a prompt. The 290 "full" playlists today |
| G2 | Good | 25 | 90 minutes *(set)* | A playlist that stands on its own |
| G3 | Deep | 50 | 3 hours *(set)* | Enough to offer "a new one" several times without repeats |

Each genre also gets a **ceiling**, found during its first pass: the highest tier its recorded output can honestly fill. Kalevala runosong may stop at G1; swing can reach G3. A genre at its ceiling is complete, not thin.

### Country-year tiers

| Tier | Name | Songs per year | What it is for |
| :- | :- | -: | :- |
| Y0 | Nothing | 0 | The page falls back to genres alive there |
| Y1 | Decade list | 12 or more per decade | Today's 324 decade lists |
| Y2 | Year basics | 6 home-grown, plus the big foreign hits | Today's "researched" bar. 164 years in 11 countries |
| Y3 | Year solid | 20 | A year you can stay in |
| Y4 | Year full | 50 | Close to a year-end chart |
| Y5 | Chart-complete | 100 | The published year-end chart, whole |

Each country gets a **target tier** from its class (below). The United States is aimed at Y5; a country with no national chart may be aimed at Y2 and be complete there.

## 2. The order: weighted breadth first

### How much a scope matters

A country's weight is a blend of three numbers, each scaled 0 to 1:

| Part | What it measures | Source |
| :- | :- | :- |
| Reach | How familiar that country's music is to listeners elsewhere | A synthetic familiarity test per country and era (roadmap 1.3 extended), recorded under the registry |
| People | How many people it is "home" for | Population in that decade (United Nations figures, open data) |
| Demand | What people using the app have asked for | The request list's weight column, and logged trips |

Proposed blend *(set)*: **reach 0.45, people 0.35, demand 0.20**. Reach leads because the first users are Western listeners and the owner's example is that the United States should be complete before Nigeria. People keeps India, China, Brazil and Indonesia from being left to the end. Demand lets real use correct both.

A decade's weight inside a country follows who is alive to remember it: decades in which today's listeners were 8 to 25 count most, tapering before 1950.

Countries fall into four classes by weight, which set the target tier:

| Class | Target | Roughly |
| :- | :- | :- |
| A | Y5 (100 a year) | The handful of largest music markets |
| B | Y4 (50) | Large national industries with charts |
| C | Y3 (20) | Countries with partial chart history |
| D | Y2 (6) | No chart of record; press and radio sources |

Which countries land in which class is the output of a helper assignment that computes the table, not something to guess here.

Genres are weighted the same way with reach (familiarity of the genre), people (population of its home regions at its peak) and demand.

### Breadth first, but not blindly

Pure breadth first would bring every country to 6 songs before any reaches 20. That spends a third of the effort on places few will visit. Pure depth first finishes the United States while the rest of the map is empty.

The rule instead: always do the unit with the highest **weight × gain**, where gain falls as the tier rises.

| Step | Gain *(set)* |
| :- | -: |
| To Y1 or G1 (from nothing) | 1.0 |
| To Y2 or G2 | 0.6 |
| To Y3 or G3 | 0.35 |
| To Y4 | 0.2 |
| To Y5 | 0.1 |

Worked example. Say the United States weighs 1.0 and Nigeria 0.25. Nigeria's first step scores 0.25 × 1.0 = 0.25. The United States going to Y3 scores 1.0 × 0.35 = 0.35, so it goes first; the United States going to Y4 scores 0.20, so Nigeria's first pass comes before that. The map fills outward and the important places deepen in step, and one table of weights and gains decides it, in one adjustable place.

### Passes

A **pass** takes one scope up one tier. It is the unit a helper is given.

| Pass | Unit | Yields |
| :- | :- | :- |
| Country, pass 1 | One country, all decades | Decade lists (Y1) |
| Country, pass 2 | One country-decade | 6 a year for ten years: about 60 songs (Y2) |
| Country, pass 3 | One country-decade | Up to 20 a year: about 140 more |
| Country, pass 4 and 5 | One country, five years | Up to 50, then 100 a year |
| Genre, pass 1 | Eight genres | Definition, ceiling, 12 to 18 songs each |
| Genre, pass 2 | Four genres | Up to 25 songs each |
| Genre, pass 3 | Two genres | Up to 50 songs each |

How long a pass takes and what it costs is *(measure)*: the first of each kind is timed, and the unit sizes above are adjusted to fit one helper run.

Each pass adds to the previous one. It never replaces it: songs keep their identity, their sources and the pass that found them.

## 3. Weights on songs

A song is not in a list or out of it. Its link to a scope carries a weight from 0 to 1: how characteristic it is of that genre, or of that country and year. The weight is kept as three separate parts so they can be compared and blended (principles 16 and 20).

| Part | Country-year | Genre | Available |
| :- | :- | :- | :- |
| Evidence | Year-end chart position, weeks at number one, number of independent sources listing it | Number of independent sources naming it as defining; by a founding or defining artist; inside the genre's years | From research, at once |
| Synthetic | Share of synthetic listeners who "knew" it, from the listener test's per-song answers | Share of synthetic genre listeners who name it unprompted or confirm it | From the acceptance tests |
| Human | Kept, skipped, reported by real listeners | The same | Later (milestone 8) |

Rank within a scope is by the blended weight. The top of the list is what a prompt or a first playlist uses; the rest is depth.

A second number belongs to the song itself, not to the link: **fame**, how widely known it is anywhere. The goal of a new playlist of things not yet heard needs both: choose songs with a high characteristic weight (accurate) and, for a listener who wants discovery, lower fame (new to them), minus what they have already been given. Without the two numbers kept apart, "accurate" and "new" pull against each other and cannot be traded off.

This requires what the data lacks today: one record per song with a stable identity, and a separate record for each song-in-scope link holding rank, the weight parts, sources and pass number. That is the core of the schema proposal (roadmap 2.3).

## 4. Tests

### Scope acceptance: one scope, one pass, against its own specification

Run when a pass is handed back, before it is merged. All four must pass; a failure names what to redo.

| Test | Kind | Passes when |
| :- | :- | :- |
| **Specification** | Script | Count and listening time meet the tier; every song has a source; dates inside the scope; no repeats; at most 2 per artist at Y2 and G1, 4 above; home-grown share as the mode requires |
| **Evidence audit** | Fresh agent | A random 10% of songs (at least 5) are re-fetched from their sources and say what the data claims: 90% or more *(set)* |
| **Recall** | Synthetic, blind | Before seeing the list, the listener names the songs they would expect: 10 for a country-year, 15 for a genre. The share found in the list meets the tier: 30% at Y2 and G1, 50% at Y3 and G2, 70% at Y4 and G3, 85% at Y5 *(set)* |
| **Feel and order** | Synthetic | The existing listener test on the top of the list scores 8 or more; and of the listener's own top six, at least four are in the list's top third |

Recall is the direct measure of a scope: it asks whether the research covered what it set out to cover, and it rises with the tier. The existing listener test only ever saw the first few songs.

For genres the listener is a person inside the scene (a dancer, a DJ, a player, a collector of that music), not a general listener, and there is one more check: the listener marks songs that do not belong to the genre, and no more than 10% may be marked. No genre has been tested at all so far; this brief has to be written and registered first.

### Cross-scope: the parts together

Run after scopes pass, on the whole data set.

| Test | Asks |
| :- | :- |
| Identity | The same song in a genre list and a country-year list is one record, with one date and one spelling |
| Agreement | If the genre data says a genre peaked in Japan in 1985, Japan's 1985 list has songs of it |
| Continuity | No cliff between neighbouring years or across a decade boundary (1979 to 1980) in size or style |
| Journeys | A life journey across scopes still reads as one life: the existing journey tests |
| Freshness | A second playlist for the same request shares no songs with the first, and still passes feel |

### What gets recorded

Every test run is recorded as now (brief version, data commit, cases, model). The coverage table gains a tier column per scope: target tier, tier reached, tier accepted, and which test stopped it.

## What this costs

Rough sizes, to see the shape:

| | Scopes | At basics | At target |
| :- | -: | -: | -: |
| Genres | 593 | 593 × 15 ≈ 9,000 songs | mixed G2 and G3 ≈ 20,000 |
| Countries, 1940 to 2026 | 36 with data today, 226 in all | 36 × 87 years × 6 ≈ 19,000 | one class A country alone is 87 × 100 = 8,700 |

Today the page holds about 12,000 song rows in one file of 2.5 MB. The target is several times that, so this plan depends on roadmap 2.10: data delivered as files loaded on demand, not one page.

## Decisions for the owner

1. **Tier sizes:** G2 = 25 songs or 90 minutes, G3 = 50 or 3 hours; years at 6, 20, 50, 100.
2. **The blend:** reach 0.45, people 0.35, demand 0.20. Raising reach favours what Western listeners know; raising people favours the largest countries.
3. **The gain table:** how fast depth loses to breadth.
4. **Pass thresholds:** recall 30, 50, 70, 85%; evidence audit 90%.

## Order of work if accepted

1. Schema with song identity and song-in-scope links (2.3), since weights and passes cannot be stored without it.
2. Helper assignment: compute the weight table for countries and genres (population data, familiarity test), giving classes and the first ordered queue.
3. Write and register the briefs: recall, genre listener, evidence audit.
4. One pilot of each pass kind, timed, with its acceptance test: the United States 1980s to Y3, one class D country-decade to Y2, four genres to G2. Adjust unit sizes and thresholds from what they show.
5. Then the queue runs from the weight table.
