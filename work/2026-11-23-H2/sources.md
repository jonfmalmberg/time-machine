# Open music data sources (H2)

All pages read on 2026-11-23. Licences already established in `docs/research/2026-11-23-feasibility-checks.md` are referred to, not repeated. Every quote below was returned by the fetch tool as page text; formatting (bold, links, code marks) was stripped by the tool, and where a link sat inside a sentence the quote stops at the link and says so. The quotes were not checked against the raw HTML (direct download from this run was refused by its network proxy), so the lead's checking script is the first character-level check. See `REPORT.md`, "What fell short".

Each section has the same shape: what it holds; bulk; per item; limits; licence and attribution; identifiers; what it means for us.

---

## 1. MusicBrainz

**Holds.** The entity types the API serves: "area, artist, event, genre, instrument, label, place, recording, release, release-group, series, work, url" [MB-API]. The core dump is "the core MusicBrainz database, including the tables for Artist, Release, Recording, etc." [MB-DL].

**Bulk.** Full PostgreSQL exports: "MetaBrainz provides full database exports of the MusicBrainz database twice a week." [MBZ-PG]; table row "Twice a week, Wednesdays and Saturdays." and format "XZ compressed custom PostgreSQL table dumps" [MBZ-PG]. Hourly sync is possible: "which allows keeping a local mirror in sync with the main MusicBrainz database every hour" [MBZ-PG]. A JSON dump also exists, licence "Creative Commons Zero (CC0)", "Twice a week, Saturdays and Wednesdays." [MBZ-PG]. Download links lead to a sign-up page (https://metabrainz.org/datasets/signup) [MBZ-PG]. Size: not stated on the pages read.

**Derived bulk (canonical data).** "The MusicBrainz canonical data dump provides a mapping of all Releases and Recordings in the MusicBrainz database to a single “canonical” version." [MBZ-DER]; frequency "Twice a month, on the 1st and 15th."; licence "Creative Commons Zero (CC0)"; format "zstd compressed CSV files" [MBZ-DER]. This is the file that turns many pressings of one song into one recording, which matches our "one central song" idea.

**Per item.** "The API root URL is `https://musicbrainz.org/ws/2/`." (shown with code marks) [MB-API]. "in either XML or JSON. XML is the default format" [MB-API]. Lookups need an identifier: "You can perform a lookup of an entity when you have the MBID for that entity:" [MB-API]; search is the one call without one. No key: "Do I need an API key?" is answered "Currently, no. But you must have a meaningful" (link follows) [MB-API].

**Limits.** "All users of the API must ensure that each of their client applications never make more than ONE call per second." [MB-API]. "Currently that rate is (on average) 1 request per second." and when exceeded "the request is denied with a 503 Service Unavailable error" [MB-RL]. User-Agent: "Each request sent to MusicBrainz needs to include a User-Agent header" with "enough information in the User-Agent string for us to contact the maintainers" [MB-RL]. "We may change the blocking/throttling rules at any time in order to protect the overall site health." [MB-RL]. Commercial use of the web service: the API page says "Non-commercial use of this web service is free" (link on "Non-commercial") [MB-API]; what applies to commercial use was not read.

**Licence split, now precise.** The feasibility check left open which data is "supplementary". The download page lists the files: CC0 for `mbdump.tar.bz2` and `mbdump-cdstubs.tar.bz2`; CC BY-NC-SA 3.0 ("Attribution-NonCommercial-ShareAlike 3.0", a link) for `mbdump-cover-art-archive`, `mbdump-derived`, `mbdump-edit`, `mbdump-editor`, `mbdump-event-art-archive`, `mbdump-stats` [MB-DL]. "The derived data consists of annotations, user ratings, user tags, and search indexes." [MB-DL] and genres are attached "since the association of genres with entities is done via user tags" [MB-DL]. **So genre and tag assignments on recordings are in the non-commercial part.** The `About/Data_License` page itself could not be read this run to confirm in its own words.

**Identifiers.** MBID for recording, release, release group, artist, work and the other types above [MB-API]. The format of an MBID (the `MusicBrainz_Identifier` page) was not read; it is not stated here.

---

## 2. Wikidata

**Holds.** "Wikidata currently contains over 100 million Items and over 650,000 Lexemes" [WD-DA]. (Music coverage specifically was not measured.)

**Bulk.** "Wikidata dumps are complete exports of all the Entities in Wikidata:" [WD-DA]; "Use a dump when your result set is likely to be very large." and "Don't use a dump if you need current data: the dumps take a very long time to export and even longer to sync to your own query service." [WD-DA].

**Per item.** SPARQL: "The Wikidata Query Service (WDQS) is Wikidata's own SPARQL endpoint." but "WDQS is also not suitable when your desired data is likely to be large, a substantial percentage of all Wikidata's data. (Consider using a dump in such cases.)" [WD-DA]. Action API: "Getting all of the data of an entity in JSON format, in small groups of entities (up to 50 entities per request)." [WD-DA]. Linked Data per entity, formats ".json, .rdf, .ttl, .nt or .jsonld", "not suitable for requesting large quantities of data." [WD-DA]. Also a Wikibase REST API and an experimental Linked Data Fragments endpoint [WD-DA].

**Limits.** No numbers on the page read. Rules: "Follow the User-Agent policy – send a good User-Agent header.", "If you get a 429 Too Many Requests response, stop sending further requests for a while (see the Retry-After response header)" [WD-DA]. The Query Service manual (for its timeout) could not be read. "Data sources on this page are not guaranteed to be stable interfaces." [WD-DA].

**Licence and attribution.** CC0 (feasibility check [6]). New: attribution is not required but asked for: "We offer the data in Wikidata freely and with no requirement for attribution under CC-0. In return, we would greatly appreciate it if, in your project, you mention Wikidata as the origin of your data." [WD-DA].

**Identifiers.** Item ids (Q-numbers) for songs, artists, albums, genres, places. That Wikidata items carry MusicBrainz and Discogs ids as properties is known to the writer but was **not read in a source this run** (unverified).

---

## 3. Discogs

**Holds.** Releases, master releases, artists, labels (search types: release, master, artist, label) [DC-DEV]. Discogs data is split: "Some Discogs data is made available under the CC0 No Rights Reserved license, and some is restricted data, as defined in our API Terms of Use." [DC-DEV].

**Bulk.** "Our monthly data dumps are available under the the CC0 No Rights Reserved license." (doubled "the" as on the page) [DC-DEV]. The dump page itself (data.discogs.com) could not be read, so format and contents of the dump are **not confirmed** here.

**Per item.** REST API. Search: "Authentication (as any user) is required." [DC-DEV]. Images: "Image requests require authentication and are subject to rate limiting." and "The URLs returned are signed URLs, so trying to change one part of the URL (e.g., Release ID number) will generally not work." [DC-DEV].

**Limits.** "Requests are throttled by the server by source IP to 60 per minute for authenticated requests, and 25 per minute for unauthenticated requests, with some exceptions." [DC-DEV]; "Your application must provide a User-Agent string that identifies itself – preferably something that follows RFC 1945." [DC-DEV].

**Licence and attribution.** Dumps CC0. API use: "If you utilize the Discogs API, you are subject to the API Terms of Use." [DC-DEV]. The Terms of Use were not read, so what "restricted data" covers (likely marketplace, user data and images, **unverified**) is open.

**Identifiers.** Numeric ids: release id (example 249504, with "master_id": 96559), master id (example 1000, "main_release": 66785), artist id (example 108713), label id [DC-DEV]. Discogs has no per-song (recording) identifier in what was read: a track exists only inside a release.

---

## 4. ListenBrainz

**Holds.** Listening history: "This file contains all the listens submitted to ListenBrainz by its users." and a public dump with "information about ListenBrainz users and statistics derived from listens submitted to ListenBrainz calculated from users, artists, recordings etc." [LB-DUMPS]. Scale: "The data dumps are large, containing hundreds of millions of listens." [MBZ-PG].

**Bulk.** "Twice a month, on the 1st and 15th, with incremental dumps daily." and format "XZ compressed PostgreSQL table dumps" [MBZ-PG]. The ListenBrainz docs describe `.tar.zst` archives, "one JSON document per line", and a Spark dump of "Zstandard-compressed Parquet files" [LB-DUMPS]. The docs contradict themselves on incremental frequency ("twice a week" and "We create incremental data dumps daily.") [LB-DUMPS]; the MetaBrainz page says daily.

**Per item.** "API Root URL: `https://api.listenbrainz.org`" [LB-API]. User tokens: "ListenBrainz makes use of private API keys called user tokens to authenticate requests and ensure the proper access controls on user data." [LB-API]. Whether public reads need a token is not stated.

**Limits.** "All users of the API must ensure that each of their client applications never make more than ONE call per second." Over the limit: "the server will respond with error code `429: Too Many Requests`." Headers X-RateLimit-Limit, -Remaining, -Reset-In, -Reset [LB-API]. "We require that all requests to the ListenBrainz API include a valid User-Agent header" [LB-API].

**Licence.** ListenBrainz PostgreSQL dump: "Creative Commons Zero (CC0)" [MBZ-PG]. Commercial use: "Allowed, but financial support strongly urged, even for CC0 data." [MBZ-PG]. (This closes the "ListenBrainz licence" item the feasibility check left unchecked.)

**Not to be confused:** the MLHD+ dataset (listening logs "extracted from Last.fm") has licence "None. Non-commercial use only." [MBZ-DER].

**Identifiers.** Listens are linked to MusicBrainz recording MBIDs ("MBID Mapping" in the docs); the pages on mapping and MSIDs were not read, so the detail is **unverified**.

---

## 5. Cover Art Archive

Licence of images already checked (feasibility [8]): none given, "Use the images at your own risk". Not repeated.

**Holds.** "The Cover Art Archive is a joint project between the Internet Archive and MusicBrainz" (links stripped) [CAA-HOME]; images "curated by the MusicBrainz community"; "All images are copyrighted by their respective copyright owners." [CAA-HOME].

**Bulk.** None for images. MusicBrainz's `mbdump-cover-art-archive` dump holds the index metadata under CC BY-NC-SA 3.0 [MB-DL].

**Per item.** "Any requests to fetch cover art must go through the coverartarchive.org service." [CAA-API]. Paths: `/release/{mbid}/front`, `/release-group/{mbid}/front[-(250|500|1200)]`; "The current supported thumbnail sizes are 250px, 500px, and 1200px." [CAA-API]. A release group's front image can be loaded straight from the release-group MBID: "Fetches the image that is most suitable to be called the "front" of a release group (or one of its thumbnails)." [CAA-API].

**Limits.** "There are currently no rate limiting rules in place at" (then the address as a link) [CAA-API]; endpoints still list "503 if the user has exceeded their rate limit." A notice says thumbnail generation has a backlog (link inside; not exact) [CAA-API].

**Identifiers.** Uses MusicBrainz release and release-group MBIDs. Plus an image id per file.

---

## 6. AcousticBrainz

**Holds (ended).** Aims were "a list of musical characteristics of audio recordings, such as musical key and tempo (BPM)" and to "predict other musical characteristics such as instrumentation, genre, or mood" [AB-BLOG]. The project was ended: "we’ve taken the hard decision to end the project." and "In early 2023 we will shut down the AcousticBrainz site." [AB-BLOG]. Reason: "the data simply isn’t of high enough quality to be useful for much at all." [AB-BLOG].

**Bulk.** Final dumps: "Lowlevel dumps (589GB compressed): all low-level submissions", "Highlevel dumps (39GB compressed): all computed high-level submissions", a feature dump "(3G compressed)", and "These dumps include all 30 million submissions to AcousticBrainz over the last 5 or so years." [AB-DUMPS]. The download page (acousticbrainz.org/download) could not be read; whether the dumps are still served today is **not confirmed**. The MetaBrainz datasets page lists no AcousticBrainz dataset [MBZ-DS].

**Per item.** None (site shut down per [AB-BLOG]; current state not checked).

**Licence.** Only a staff reply in the blog comments: "The data is CC0" [AB-BLOG, comments, 1 March 2022]. Not a licence page.

**Identifiers.** Recording MBIDs ("one submission per recording MBID" [AB-DUMPS]).

**What it means for us.** By its makers' own judgement the mood and key data are unreliable. It is not a substitute for the closed Spotify audio features.

---

## 7. National chart archives under an open licence

**None found.** Two searches (2026-11-23) for an official chart company publishing chart data under an open licence returned Wikipedia articles, a Kaggle copy of Billboard, and fan archives, none first-party and none with a licence. This is a negative result from a short search, not proof that none exists. Not searched one by one: each country's chart body or statistics office. Wikidata holds some chart positions as statements (writer's recollection, **unverified**).

---

## Comparison

| | MusicBrainz | Wikidata | Discogs | ListenBrainz | Cover Art Archive | AcousticBrainz |
| :- | :- | :- | :- | :- | :- | :- |
| What | Recordings, releases, artists, works, links | General knowledge incl. music items | Releases, masters, artists, labels | Who listened to what, when | Cover images | Audio descriptors (key, BPM, mood) |
| Song-level id | Recording MBID (+ work MBID) | Q-id | None (track inside release) | Recording MBID | n/a | Recording MBID |
| Bulk | PostgreSQL twice a week; JSON; canonical CSV twice a month | Full dumps | Monthly dumps (page not read) | Twice a month + daily increments | None | Final dumps 2022 (current availability unchecked) |
| Per-item limit | 1 request/s, User-Agent with contact | No number read; User-Agent, back off on 429 | 60/min with auth, 25/min without; search needs auth | 1 request/s, 429 | "no rate limiting rules" | None (shut down) |
| Licence | Core CC0; tags, genres, ratings, CAA index CC BY-NC-SA 3.0 | CC0, attribution requested | Dumps CC0; API has restricted data under Terms (not read) | CC0 | No licence; images copyrighted | "CC0" per staff comment only |
| Useful to us for | The stable key for a song; canonical grouping | Linking ids, places, dates | Release years and labels, regional pressings | How widely known a song is today | Album art by release-group MBID, loaded by browser | Little: quality judged poor by its makers |

---

## References (all read 2026-11-23)

- [MB-API] MusicBrainz, *MusicBrainz API* (revision #79405): https://musicbrainz.org/doc/MusicBrainz_API
- [MB-RL] MusicBrainz, *MusicBrainz API / Rate Limiting* (revision #78895): https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting
- [MB-DL] MusicBrainz, *MusicBrainz Database / Download* (revision #77812): https://musicbrainz.org/doc/MusicBrainz_Database/Download
- [MBZ-PG] MetaBrainz, *Datasets: PostgreSQL dumps*: https://metabrainz.org/datasets/postgres-dumps
- [MBZ-DER] MetaBrainz, *Derived Dumps*: https://metabrainz.org/datasets/derived-dumps
- [MBZ-DS] MetaBrainz, *Datasets*: https://metabrainz.org/datasets
- [WD-DA] Wikidata, *Wikidata:Data access*: https://www.wikidata.org/wiki/Wikidata:Data_access
- [DC-DEV] Discogs, *API Documentation*: https://www.discogs.com/developers
- [LB-DUMPS] ListenBrainz docs, *Data Dumps*: https://listenbrainz.readthedocs.io/en/latest/users/listenbrainz-dumps.html
- [LB-API] ListenBrainz docs, *API*: https://listenbrainz.readthedocs.io/en/latest/users/api/index.html
- [CAA-API] MusicBrainz, *Cover Art Archive / API*: https://musicbrainz.org/doc/Cover_Art_Archive/API
- [CAA-HOME] *Cover Art Archive*: https://coverartarchive.org/
- [AB-BLOG] MetaBrainz blog, *AcousticBrainz: Making a hard decision to end the project*, 16 Feb 2022: https://blog.metabrainz.org/2022/02/16/acousticbrainz-making-a-hard-decision-to-end-the-project/
- [AB-DUMPS] MetaBrainz Community, *AcousticBrainz data dumps*, 6 Jul 2022: https://community.metabrainz.org/t/acousticbrainz-data-dumps/591961
