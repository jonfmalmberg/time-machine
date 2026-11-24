# Proposal: the first visit, and a playlist panel that shows the research

Dated 23 November 2026 (Pacific). Roadmap 1.5. For the owner's review before building. Vision: `docs/vision/2026-11-23-positioning.md`.

## The problem, as seen in the app today
The playlist panel opens with the label "Copy-ready Spotify prompt" and a text box. The songs the site found, their sources and the other ways to listen sit below it, partly folded away. So a newcomer sees a prompt and concludes the app writes prompts. Nothing on a first visit says what to do or what the app knows.

## 1. The playlist panel leads with the songs
Order of the panel, top to bottom:
1. **Where and when**, in words: "Japan, 1985".
2. **What people were listening to**: the songs themselves as a list (title, artist, year), the first five showing, each with a play button. Under the heading, one line saying where they come from: "From Japan's Oricon chart for 1985" with the source-check status.
3. **Sounds alive there then**: the genres as chips (already in the panel).
4. **Listen**: one row of choices of equal weight: YouTube, Spotify, Apple Music, Copy the list. Choosing Spotify shows two ways: an exact playlist of these songs (through TuneMyMusic, as now) or a prompt for Spotify's AI playlist. The prompt is described as what it is: "written from these songs and the sounds of this place and time".
5. Research status and requests, as now.

The prompt text box is no longer shown until Spotify's prompt option is chosen.

## 2. A first visit that ends in music
Shown once per device, skippable, and reachable again from the information button. Not a tour of the controls.
1. **One question:** "Where do you want to go?" with three one-tap answers and the search field: the visitor's own country in a decade with good data ("Canada, the 1980s"), one far place with a strong list ("Brazil, the 1970s"), and "Surprise me". The country comes from the browser's language setting; nothing is stored or sent.
2. **Arrive:** the app goes there (map and year move) and the panel opens on the songs, as in section 1. One line of plain words above it: "This is what was on the radio there. Tap a song to hear it."
3. **After the first song is opened:** one line offers the next step: "Try another year, or see where this sound came from", pointing at the time control and the genre chip. Then the walkthrough is over.

## 3. Words
- The site's one-line description everywhere (page description, share preview, About): "Explore the world's music by place and time, and find sounds you would never have heard." No mention of prompts or of one service.
- "Copy prompt" buttons on genre entries become "Listen", opening the same choices as the panel.

## How we know it worked
From the usage log already kept: of first visits, the share that open a song or copy a list within one minute; and the share that go on to a second place or year. Baseline is today's 10 anonymous visits, most of which opened one or two views and left.

## Not known
- Whether Apple Music and YouTube Music accept a search link that opens well on a phone; to be checked before those buttons are offered. YouTube search links are already used in the app.
- Whether guessing the country from the browser language is right often enough; the search field is beside it for when it is not.
- The best three suggestions. They should come from lists that pass the listener test, of which there are few today.

## Order of building
Section 1 first (it fixes the "just a prompt" impression for everyone, not only newcomers), then section 2, then section 3's wording.

## Owner's review, 23 November 2026 (evening)
- The plan is clear, with one disagreement: the most useful feature must not be hidden. The app should be agnostic about the service without tucking the playlist prompt away. Prompt generation is the current means, not the end; ready-made playlist links or playlist prompts keep a prominent place, with a control to choose options such as language and target service.
- Playing a song needs outside links; any service, or several, can be linked as is feasible.
- **So section 1 is changed:** the prompt is not hidden behind a choice. The panel now reads: the songs (five showing), then a section "Get the playlist" that is always open, with a row to pick the service (Spotify, YouTube, Apple Music, Song list). Spotify is the default and shows the prompt with its language and "heard there / made there" options, as before. The choice of service is remembered on the device.
- **Built on `review` the same evening:** section 1 as changed, and section 3's one-line description and preview image wording. Section 2 (the first-visit start) is not built.
- **Not done:** ready-made playlists (a real playlist on a service, linked per place and time). The data has no field for one yet.
- **Not checked:** that the Apple Music search link opens well on a phone.
