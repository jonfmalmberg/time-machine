# Feasibility checks, 23 November 2026

Several things were said from memory in the direction conversation. Jon asked for the ones that could change the direction of the roadmap to be checked before the plan is trusted. This is that check: first-party sources only, with the quoted evidence. Things that do not affect the direction are listed at the end as not checked and will be researched when their milestone is reached.

## Can the app connect to Spotify for everyone?

No. Spotify's interface for outside developers is closed to a small public app.

A new app runs in "Development Mode". Since February 2026 that mode is limited to five named users, and the owner of the app must have Spotify Premium **[1][2]**. Spotify describes the mode as for "learning, experimentation, and personal projects" **[2]**. Serving more people needs Spotify's extended access, whose criteria were not checked today; they are aimed at established businesses.

Within those five users, an app can read the contents of a playlist only if that user owns it or collaborates on it **[1]**. Nothing in the developer documentation reaches the Prompted Playlist feature.

What this means:
- "One tap" playlist creation inside Spotify, for the public, is not available to us. The copy-and-paste step stays, and the work is in making it as short as possible.
- Bringing a Spotify-made playlist back for comparison is possible, but only for up to five named people (Jon and four testers), each reading their own playlist. For everyone else it would have to be a pasted list.

## What is Spotify's prompt feature, and who can use it?

It is called Prompted Playlist, it is in beta, and it is for Premium subscribers in a small number of countries: New Zealand from December 2025, the United States and Canada from 22 January 2026, and Australia, Ireland, Sweden and the United Kingdom from 23 February 2026, in English only **[3]**.

It is personalised: "Your entire listening history from when you first joined Spotify is factored in" **[3]**.

What this means:
- The app's main action only works for Premium subscribers in seven countries. Everyone else needs another way to hear the music, so our own song lists matter as the fallback, not only as seeds.
- A playlist Spotify makes from our prompt reflects the listener's own taste as well as the prompt. Two people get different playlists. Any comparison of "Spotify's playlist against ours" has to allow for that, and a playlist Jon gets is not what a local of that place would get.

## Can mood, tempo and key come from Spotify?

No. Spotify removed Audio Features and Audio Analysis (tempo, key, and its mood-like measures), Recommendations and Related Artists for new apps on 27 November 2024 **[4]**. Tags for how a song feels have to come from another source or from our own research.

## Which open music data can be built on?

| Source | Licence | Evidence |
| :- | :- | :- |
| MusicBrainz, core data (artists, releases, recordings and their links) | CC0, public domain | **[5]** |
| MusicBrainz, supplementary data | CC BY-NC-SA 3.0: non-commercial, credit required, same licence for derivatives | **[5]** |
| Wikidata, structured data | CC0 | **[6]** |
| Discogs monthly data (releases, artists, labels, master releases) | CC0 | **[7]** |

What this means: the three largest open sources can be used freely, including copying facts into our own data. MusicBrainz's supplementary part (which includes things like tags and ratings; the exact split was not checked) is non-commercial only, which matters if the project ever earns money.

## Can cover images be kept?

Not safely. MusicBrainz holds no cover art; it comes from the Cover Art Archive **[5]**. The archive names no licence for the images and says "Use the images at your own risk" **[8]**.

What this means: we should not keep our own copies. The slow part of album art was never the image, it was looking up which image belongs to a song, one lookup a second in the visitor's browser. That lookup result is a MusicBrainz identifier, which is CC0 data. If the identifier is found once during research and stored with the song, the visitor's browser can load the image straight from the archive with no lookup, no storage on our side, and no copies. That matches the rule that we store pointers, not the things themselves.

## Is there room for a much larger body of data?

Not in the way the site is built today, and not in the database.

- The site currently carries all its data inside one page of about 2.5 MB. That cannot grow by a factor of ten or a hundred.
- The Supabase free plan allows 500 MB of database and 1 GB of file storage per project, with 5 GB of data transfer **[9]**. That is room for user data, not for a music catalogue.
- Cloudflare serves static files free and without a request limit **[10]**, up to 20,000 files of at most 25 MiB each on the free plan **[11]**.

What this means: as the data grows it has to be split into files that the page loads when needed, served by Cloudflare. How the data is stored and delivered is part of the data design, and has to be decided before large-scale collection. For "a database of all music", the practical form is our own records for what we have researched, plus identifiers that point into MusicBrainz for everything else, not a copy of the world's catalogue.

## Do the prompts behind the earlier listener results still exist?

Yes. The briefs given to the synthetic listeners and to the research agents, the inputs of each round, and the results were all still in Claude's working files. They are now saved in the repository under `tests/listener/archive/`. The old scores remain provisional because the runs were not tied to a version of the data or of the brief.

## Effect on the roadmap

1. **Milestone 6 (playlist services) changes shape.** No public Spotify connection. It becomes: shorten the hand-off; a tester-only way to read back a playlist (five people) with a paste option for others; a comparison method that allows for personalisation; and a proper path for people who cannot use Prompted Playlist at all.
2. **Our own song lists matter more than assumed**, because for most of the world they are the only playlist the app can offer.
3. **Milestone 2 (data design) gains two items:** how data is stored and delivered as it grows, and where feel tags come from now that Spotify's are closed.
4. **Album art becomes cheap and moves out of "later":** store the MusicBrainz identifier during research, load the image from the archive.
5. The order of the milestones does not change.

## Not checked, because it does not change the direction

- What Apple Music and YouTube allow. To be researched in milestone 6.
- Spotify's criteria for extended access.
- Whether any link opens Spotify's Prompted Playlist with text already filled in.
- The licences of ListenBrainz and of Wikipedia's text.
- Exactly which MusicBrainz tables are "supplementary".
- How large MusicBrainz and Discogs are.

## References

**[1]** Spotify for Developers, *February 2026 Web API Dev Mode Changes - Migration Guide*: "All Development Mode apps require the app owner to have an active Spotify Premium subscription." … "Playlist contents (`items`) are only returned for playlists the user owns or collaborates on." [new apps limited to 5 users, per the same page] (https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide)
**[2]** Spotify for Developers, *Update on Developer Access and Platform Security*, 6 Feb 2026: "Each Client ID will be limited to up to five authorized users." … "learning, experimentation, and personal projects for non-commercial use by individual developers." (https://developer.spotify.com/blog/2026-02-06-update-on-developer-access-and-platform-security)
**[3]** Spotify Newsroom, *Prompted Playlist in Beta Coming to Premium Listeners in More Markets*, 22 Jan 2026: "Your entire listening history from when you first joined Spotify is factored in." [markets and dates as listed on the page] (https://newsroom.spotify.com/2026-01-22/prompted-playlists-expansion/)
**[4]** Spotify for Developers, *Introducing some changes to our Web API*, 27 Nov 2024: "new Web API use cases will no longer be able to access or use the following endpoints and functionality" [the list includes Audio Features, Audio Analysis, Recommendations, Related Artists] (https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api)
**[5]** MusicBrainz, *About / Data License*: "anyone can download and use the core data in any way they see fit." … "The MusicBrainz dataset does not contain cover art. Cover art is provided by the Cover Art Archive." (https://musicbrainz.org/doc/About/Data_License)
**[6]** Wikidata, *Wikidata:Licensing*: "All structured data in the main, property and lexeme namespaces is made available under the Creative Commons CC0 License." (https://www.wikidata.org/wiki/Wikidata:Licensing)
**[7]** Discogs, *Discogs Data*: "This data is made available under the CC0 No Rights Reserved license:" (https://data.discogs.com/)
**[8]** MusicBrainz, *Cover Art Archive*: "Use the images at your own risk." (https://musicbrainz.org/doc/Cover_Art_Archive)
**[9]** Supabase, *Pricing*, Free plan: "500 MB database size per project included" [file storage "1 GB included"; egress "5 GB included."] (https://supabase.com/pricing)
**[10]** Cloudflare Workers docs, *Static Assets: Billing and limitations*: "Requests to static assets are free and unlimited." (https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
**[11]** Cloudflare Workers docs, *Limits*, § Account plan limits: Number of Static Asset files per Worker version, 20,000 on Workers Free; Individual Static Asset file size, 25 MiB. [table values, not a sentence] (https://developers.cloudflare.com/workers/platform/limits/)
