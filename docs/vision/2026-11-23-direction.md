# Direction of the project, 23 November 2026

**This file is a dated record. Its text is not rewritten.** Where something in it has since been checked and found wrong or incomplete, a dated correction is added inline, marked as such, so that no error is left standing. It writes down a long spoken conversation between Jon (the owner) and Claude on the night of 22 to 23 November 2026, the day the first release went live. It is not a transcript: Jon asked for his meaning to be captured cleanly, in his voice, not word for word. When the direction changes, a new dated file is added beside this one saying what changed and why. This one stays as it is, so that the original intent can always be read again.

It is written as reasoning, not rules. The project succeeds only if the app feels good to use, and feel does not reduce to instructions. When a rule elsewhere in the repository is unclear or does not cover a case, come back here and ask what Jon was trying to achieve.

## What the app is for

Pick a place and a time and hear what people there were actually listening to. The people it speaks to are immigrants missing home, older people revisiting their youth, travellers, and listeners looking for something new. Jon's original test still stands: a playlist should be good enough to impress a local or an old person from that place, to the point of nostalgia. If it cannot do that, what the time machine shows is a fake version of the past.

The thing people will pass to each other is a single moment, "Tokyo, 1985" or "Lagos, 1975", or a single genre. The app should make that moment fast to reach, accurate, and easy to send. The tree, the globe and the tunnel are the rich layer underneath for people who want to explore.

The long-range ambition is larger than playlists for places and decades. Jon wants this to become, in the end, a database of all music.

## How it should feel

**Familiar but new.** Jon has used the app for about a month, and his main irritation is that it sends him "out into the desert of sound" too often: obscure genres, prehistory, the time before recording. That was interesting the first few times and tiresome afterwards. Most of the time the app should land on something that feels familiar yet fresh, with an occasional strange trip. People enjoy novelty, but from a footing they recognise.

**Understandable without help.** Jon shared the site with friends and immediately wondered what they would make of it. There is no walkthrough. The information button helps only the few who press it, and a non-technical visitor may never notice it. A newcomer should be able to get from opening the site to having music in about ten seconds, and should understand what the app is without being told.

**Like a native iPhone app.** Not a website, and not a generic or older-Android mobile page. Jon has had to say "it doesn't feel iOS" many times, about the Admin page, Journey, the Data tab and the travel log. His specific complaints about the travel log: the segmented toggle does not line up with anything else on the site, buttons are rounded squares where iOS would use capsules or plain text, the icons feel Android-like, and the type and shapes do not read as one design. The model he named for layering detail is the iOS dictionary app **Shirabe Jisho**: a clean list, tap into a full-screen entry, drill further, and come straight back to where you were. His request is that the look be decided once, as a style guide with examples he approves, so that he does not have to keep repeating himself.

**One place for each function.** If a control already exists, reuse it; do not add a second one that does nearly the same thing. A filter box in the List view that duplicates the search at the top is the kind of thing he means. So is the journey setup asking people to type place names and do arithmetic on years when the app already has a globe and a time slider.

**The main action first.** If the point of a genre page is to get a playlist, the playlist action should not be at the bottom of the page. Order information by how people actually use it.

## Playlists: lean on Spotify's AI for now

Today a person copies a prompt and pastes it into Spotify's AI playlist feature. That is friction most people will not push through, and Jon agrees it must become more seamless.

He does not want that to be solved by simply generating playlists ourselves. In his experience the playlists Spotify's AI builds from our prompts are somewhat better than lists made directly from our own data. His reasoning: Spotify's system knows how songs sound, it can blend and fill in tracks we do not have, and it draws on a library far larger than ours.

> **Correction, 23 Nov 2026.** One thing to add to that reasoning. Spotify states that a prompted playlist uses the listener's whole listening history. The playlist Jon gets from a prompt is shaped by his own taste, and is not what another person, or a local of that place, would get from the same prompt. Comparisons have to allow for this. See [`../research/2026-11-23-feasibility-checks.md`](../research/2026-11-23-feasibility-checks.md). The number of users will follow the quality of the result, so a smoother path to a worse playlist would be a step backwards.

So the order is: first find out what the music services allow and remove friction wherever that is just a link or a simple connection. Do not switch to our own generated playlists until a real comparison says ours are at least as good. That comparison is impossible today because we only see our side. We need a way to get the song list of a Spotify-made playlist back to us, so that synthetic listeners, Jon's own judgement, beta testers and usage data can all compare the two.

> **Correction, 23 Nov 2026.** Checked. Spotify does not allow this for a small public app: a new app may have five named users and its owner needs Premium, nothing reaches the Prompted Playlist feature, and a playlist's contents can only be read by its owner. So creating playlists in Spotify for the public is not available; reading a playlist back works for at most five named testers. The Prompted Playlist feature itself is limited to Premium subscribers in seven countries, in English, so for most people our own song list is the only playlist the app can offer. See [`../research/2026-11-23-feasibility-checks.md`](../research/2026-11-23-feasibility-checks.md). The rest of the order stands: no switch to our own playlists without a comparison.

## Data: decide what we collect before collecting more

Coverage is thin: a handful of country-decades have proper year-by-year lists, and everywhere else falls back on genre examples. Jon agrees that coverage and accuracy are the product. Because the job is very large, he wants the design settled first: exactly what is collected, with which properties, and why, so that a second round of research continues cleanly from the first.

- It must be a real database, not one flat list. A song has a unique identity. Artists and albums are things in their own right.
- Regions are decided at the start: which ones matter for music and how fine-grained to go. Two questions apply to each: can we expect to make a good playlist for it, and what does it feel like in the interface when a place has nothing? A whole stretch of the globe with no cities, such as North Korea or the middle of a desert, is a user-experience question as much as a data question.
- **Completeness, not only hits.** Jon listened to the Indonesia 2020 and Canada playlists for his own era and they did not feel authentic or familiar. His test is no longer "are the defining songs there" but "are the artists I actually listened to there, and filed in the right place". He named Taylor Swift, Beyoncé, Kanye West, Jay-Z, Kygo, Swedish House Mafia, The Weeknd and J. Cole. A related frustration: he knows songs and artists he loves and cannot tell whether they are in the app or where to find them.
- That means more than one kind of research and more than one kind of test, each covering a different way of being wrong. Chart research finds the hits; other methods are needed for breadth.
- **Feel.** People also choose music by mood. Jon wants to be able to avoid sad music, or ask for upbeat. Tempo, key, or a described vibe are candidates; a first set of feelings to tag songs with has to be chosen.

  > **Correction, 23 Nov 2026.** Spotify closed its tempo, key and mood measures to new apps in November 2024, so these cannot come from Spotify. See [`../research/2026-11-23-feasibility-checks.md`](../research/2026-11-23-feasibility-checks.md).
- Open sources should be surveyed before more hand research, with their licences checked: is there existing, freely usable music data we can build on.

The order of research he set: genres first (many have a name and nothing else), then places and periods, then the general song database. Research that did not pass its tests, such as Nigeria in the 1970s and Malaysia in the 1960s, is flagged clearly and left; it is not retried now. "I don't think we should get stuck in the past." The broad song search will probably fix those gaps along the way. A practical check for the song database: are the songs Jon has liked on Spotify in our data, and if not, where can they be found.

Freshness is the reason full coverage matters. After a while someone tires of the same Motown and funk playlist. The app should remember which songs it has already recommended to a person and offer a new playlist for the same genre with none of them, one that still feels rewarding.

## Weighting: nothing here is purely objective

Jon noticed that in the tunnel an Arabic devotional chant is the largest and most prominent thing for half of history, which is not what most people would recognise as the most influential music. He does not know how prominence is currently calculated and suspects the scoring.

His point goes beyond that one case. Measures that look objective carry hidden judgements. Counting how many descendants a genre has in the family tree treats every genre as worth one; a genre with a single descendant that everybody listens to may matter more than one with a hundred that nobody does. Listener numbers and song counts are closer to objective. Historical influence is partly judgement. What the owner and the users like is wholly subjective.

Users' stated preferences and their observed behaviour also differ, and optimising for either alone goes wrong. Behaviour reflects what people already know as well as what they like; they would probably enjoy something a little further out than their habits suggest, in the direction of what they say they want.

So the weights must be chosen deliberately and be tunable, the way a social platform decides what a like or a share is worth. The working loop is: collect data, build playlists, evaluate them, then adjust either the weights or the way the data is collected.

## Feedback from real people

Testers are unpaid. They will not do detailed reviews and should not be expected to. Most of what we learn should come from watching cheaply: how many times someone shuffles before settling, what they look at compared with what they actually take, which prompts they copy and in which language, which features they use.

When someone does want to tell us something, it has to be nearly effortless for them and easy for Jon or an agent to act on. They should be able to point at a specific filter or a specific song and say what is wrong from a short set of claims: the song I think of first is missing from the playlist or from the data; the family tree is wrong; a genre's origin is wrong; this genre was not present in this place and time.

Human ratings and synthetic-listener ratings stay as two separate scores. Jon's reasoning: the machine is probably better at recalling everything from an era, people are probably better at what was memorable. Fixing one blend ourselves would take a cheap and useful choice away from the listener, who may want a "memorable" playlist one day and an "archival, new to me" playlist another.

## Testing is judgement, not a checklist

The synthetic listener has been one of the best ideas in the project: fast, and its results have been strong. It currently asks one question, whether a playlist sounds like its time and place. Jon wants a second kind of reviewer that asks whether the data feels complete: are my artists there, are the countries there. It does not need to run every time, only once a data set has been validated.

He was emphatic that a test is not passed for its own sake. It is easy, for a person or an AI that does not care, to say the tests are done. A test is worth something only if it tells us how the app feels to use. Claude is expected to look at the data that comes in, look for patterns without being asked, come back with what it shows and what should change, and to build each feature so that the cheap measurement that answers its question is already in place. If a measure turns out not to reflect real experience, change it and record why. "It's kind of like an art more than a science."

There must also be a trail. Which tests were run on which data, with which version of the test, and what remains untested. Prompts for synthetic listeners must be kept as versions; Jon asked whether the prompts used for past results had already been lost, and Claude could not promise they had not.

> **Correction, 23 Nov 2026.** They were not lost. The briefs, the inputs and the results of the earlier rounds were found and are saved in `tests/listener/archive/`. The old scores are still provisional, because the runs were not tied to a version of the data or of the brief. Progress on tests is tracked alongside progress on data, and the bookkeeping should be automated, not done by hand.

## How Jon and Claude work together

Jon has carried the direction and Claude most of the building. Jon experiences the product as an end user and says how it feels; he has deliberately not dictated data structures or implementation. Claude is expected to treat the project as its own: think like someone trying to ship a product people want, turn Jon's impressions into design, measurement and decisions, and hold a plan at all times that is allowed to change.

What has been missing is anything written down that both can point at. Jon cannot say "keep working on this, here are my comments", and Claude cannot say "these are ready for your review, here". Claude has also been relying on its memory of the conversation. A project this size needs what a person would use: a to-do list, a journal, a statement of the goal, kept outside anyone's head.

So: a tracker that shows the whole scope from start to finish and how much is done, simple enough not to become clutter. Work is broken into pieces Claude can finish in one run. GitHub's own issues and milestones are the starting point; a page in the Admin panel can come later if that proves too thin.

For testing: Jon's account on the live site is real data. He uses the app as himself and reports what bothers him. For a specific check, Claude tests first on its own and on dev; when a real person is needed, Claude gives Jon exact steps to perform on the dev site with his Google account and confirms the result in the dev database.

## Specific things Jon raised

These are observations, recorded so they are not lost. The roadmap decides when each is handled.

- **Map:** in Israel, Hebrew chant shows three dots side by side. Either duplicate rows or a drawing fault. Selecting a country, a city and a genre on the map is cumbersome.
- **Tunnel:** the chant that dominates half of history (see Weighting).
- **Time:** Jon was not sure a specific date range can be chosen. It can ("From a year of my choosing" under Stay), which means it is too well hidden.
- **Random:** the menu closes after every pick, so finding something takes three or four rounds of open-and-tap. His target: something worth hearing on the first try most of the time, within two tries usually, and almost never more than five. Before real usage data exists, a blind synthetic test of how familiar each genre feels can supply the starting weights.
- **List view:** tapping a row should open a full-screen card and return to the same scroll position. The text filter duplicates search. Arriving from the tree or map jumps to the playlist section, which made sense once and no longer does; it should land on the genre's heading. The main actions belong at the top.
- **Data tab:** its filters are plain dropdowns that do not fit a phone or match the three main filter buttons, which Jon likes.
- **Genres and filters are treated as two different worlds.** A genre playlist is built from characteristic "golden era" songs; a place-and-time playlist is built another way. Once there is enough data, compare them. If they are close, a genre is just a named filter. If they differ, "characteristic songs" becomes a switch on the same filter, on when arriving from a genre and off when arriving from the map. Shareable links must cover genres as well as places and times.
- **Journeys.** Entry comes first: if setting one up is annoying, nobody will use it, and the Japan-to-Canada life was annoying to enter. A life journey has two possible aims, the most historically accurate or the most nostalgic, perhaps offered as a choice. The traveller journey gives no way to say what your travelling looks like. The music history course is a flat list where a course would have a teacher's narrative; its entries should open the genre's card and not offer copy buttons; it currently feels Arab-centred, and different traditions teach music history from their own standpoint, so perspectives should be selectable. The discovery walk has to earn its place and currently does not; Jon's idea is sliders ("right now I want something really strange") over real, reviewed scores, giving a ranked list.
- **Trip review:** a slider for the rating, not ten buttons. The emoji reactions were added at Jon's request, but neither the user nor Jon can see what they are for or how they lead to better recommendations. There should be a place to paste a Spotify playlist link back in. Underneath is an undesigned question: if someone loves Japanese city pop, or a happy mood, what exactly does that change about what they are offered next?
- **Travel log:** saving works on the live site. The look does not meet the standard (see How it should feel).
- **Album art:** switched off because it was too slow. Jon agrees with keeping our own copies only if the licence allows it; the images must not live in the code repository; the size must be estimated for the finished database, not today's; songs should share their album's cover; and the question of where to keep them without risking a bill has to be answered first.

  > **Correction, 23 Nov 2026.** Checked. The Cover Art Archive gives no licence for its images ("Use the images at your own risk"), so we should not keep copies. We do not need to: the slow part was looking up which image belongs to a song. Storing that identifier with the song during research (it is free data) lets the browser load the image directly, with nothing stored on our side. See [`../research/2026-11-23-feasibility-checks.md`](../research/2026-11-23-feasibility-checks.md).
- **Tree, globe and tunnel:** occasionally glitchy, usually fixed by a reload, good enough for now. Polish belongs to a later redesign stage, done as sit-down sessions where Jon tries things and says what works.

## Stated in the conversation but not checked

Claude said several things from memory that must be verified before anything is built on them: what Spotify, Apple Music and YouTube allow outside developers to do, and whether Spotify's AI playlist feature can be reached at all; the licences of MusicBrainz, Wikidata, Discogs, ListenBrainz, Wikipedia and the Cover Art Archive; the storage allowances of the services in use; the size estimates for album art; and whether the prompts behind past synthetic-listener results still exist.

> **Correction, 23 Nov 2026.** The ones that could change the direction were checked the same day. See [`../research/2026-11-23-feasibility-checks.md`](../research/2026-11-23-feasibility-checks.md).

> - **Spotify:** closed to a small public app (five users, owner needs Premium, no access to Prompted Playlist). During the conversation Claude said reading back a playlist you own "is the kind of thing their interface normally allows": true, but only for those five users.
> - **Licences:** MusicBrainz core data, Wikidata and Discogs data are CC0 and free to build on, as Claude said. MusicBrainz's supplementary data is non-commercial only. The Cover Art Archive has no licence for its images; Claude's guess that the images "stay copyrighted by their owners" was right in effect.
> - **Storage:** Supabase's free plan gives 500 MB of database and 1 GB of files, as Claude said. A music catalogue cannot live there; growing data has to be served as files from Cloudflare.
> - **Album art size estimates:** no longer needed, since no images are to be stored.
> - **Past listener prompts:** they exist and are archived.
> - **Not checked, because the direction does not depend on them:** Apple Music, YouTube, ListenBrainz, Wikipedia's licence.
