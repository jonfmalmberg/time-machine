-- 008_ideas_seed.sql
-- The lead's first list of features that could be built, for the owner to reorder on the admin page.
-- Adds rows to public.ideas only; an idea already there (same slug) is left as it is. Run after 007.

insert into public.ideas (slug, title, body, area, size, by, pos) values
  ('chart-lists', 'Chart songs for 38 countries, year by year', 'Released 24 Nov: national number ones, top tens and year-end charts read from Wikipedia. Next: artist origins for the rest, weeks at number one, release years.', 'Data', 'M', 'lead', 1),
  ('song-preview', 'Hear 30 seconds of a song without leaving the page', 'A short preview player on each song row. Apple offers preview clips through a public lookup with no account; terms and coverage to be checked first. Removes the jump to another app for a first listen.', 'Playlist', 'M', 'lead', 2),
  ('exact-track', 'Play opens the exact track, not a search', 'Store each song''s id on Spotify, YouTube and Apple Music so the play arrow lands on the recording. Needs a lookup per song and a check of each service''s terms.', 'Playlist', 'L', 'lead', 3),
  ('ready-playlists', 'Ready-made playlists you can open in one tap', 'A public playlist per place-and-decade and per genre on each service, linked from Listen. Follows from exact track ids.', 'Playlist', 'L', 'lead', 4),
  ('song-thumbs', 'Thumbs on each song: belongs here, or does not', 'One tap per song for signed-in people. The most direct signal for fixing lists. Needs song ids on the page (roadmap 10.3).', 'Feedback', 'M', 'lead', 5),
  ('local-check', 'Ask locals one question: is this what you remember?', 'When the place matches the visitor''s own country, one yes / partly / no question under the list. This is the founding test, asked of real people.', 'Feedback', 'S', 'lead', 6),
  ('music-course', 'A music course: chapters that walk through history', 'Version 1 released 24 Nov. Next: a sourced paragraph per chapter, thread chapters, a check at the end. See docs/proposals/2026-11-24-journeys-and-course.md.', 'Journey', 'L', 'lead', 7),
  ('life-journey', 'Your life in songs: birth year and country in, a journey out', 'What was on the radio when you were 5, 15, 25. The nostalgia test turned into a feature people share.', 'Journey', 'M', 'lead', 8),
  ('time-lapse', 'Press play on the map and watch music spread', 'A play button on the time control: decades tick by and genres appear where they started. A reason to stay on the map.', 'Map', 'M', 'lead', 9),
  ('daily-trip', 'Today''s destination on the landing page', 'One hand-checked place and decade a day, the same for everyone, with a streak for signed-in people. A reason to come back.', 'Landing', 'S', 'lead', 10),
  ('compare', 'Two places, same decade, side by side', 'Tokyo and Lagos in 1975. Shows what the site knows that a streaming service does not.', 'Explore', 'M', 'lead', 11),
  ('tree-path', 'How do you get from one genre to another?', 'Pick two genres; the tree lights the path between them and makes a playlist along it.', 'Tree', 'M', 'lead', 12),
  ('passport', 'A passport: stamps for countries and decades visited', 'The travel log as a picture: a world map and a decade strip that fill in. Shareable.', 'Account', 'M', 'lead', 13),
  ('share-card', 'A picture card when you share a trip', 'The link preview shows the place, the decade and the first songs instead of a generic image.', 'Share', 'M', 'lead', 14),
  ('search-songs', 'Search answers "is this artist or song here, and where"', 'Roadmap 5.6. Type an artist; see every list they are on and go there.', 'Search', 'M', 'lead', 15),
  ('genre-story', 'Each genre card tells a three-sentence story', 'Where it came from, what to listen for, what it led to. Written from the sourced definitions.', 'Explore', 'M', 'lead', 16),
  ('next-stop', '"If you liked this, travel to…" at the foot of every list', 'First version released 24 Nov (Where next). Next: better choices than tree neighbours.', 'Explore', 'S', 'lead', 17),
  ('what-happened', 'What was happening there that year', 'Two or three dated events beside the list (sourced), so the music has a setting.', 'Explore', 'M', 'lead', 18),
  ('quiz', 'Guess the decade: a small game from the lists', 'Five songs, guess the country or the decade. Uses data we have; good for sharing.', 'Play', 'M', 'lead', 19),
  ('radio', 'Radio: keep playing across whatever is filtered', 'A continuous shuffle of the current selection. Needs exact track ids or previews.', 'Playlist', 'L', 'lead', 20),
  ('request-board', 'Visitors vote on what to research next', 'The requests already collected, shown as a public board with votes. Tells us where demand is.', 'Growth', 'M', 'lead', 21),
  ('listener-panel', 'Locals certify a list', 'A named person from the place marks a list as right. Shown as a badge. The strongest form of verification we could have.', 'Data', 'L', 'lead', 22),
  ('why-this-song', 'Tap a song: why is it on this list?', 'The chart position, the source and its date, in one line. Makes the evidence work visible.', 'Data', 'S', 'lead', 23),
  ('whats-new', 'A "what is new" page', 'Places and genres added this week, from the data itself. Gives returning visitors somewhere to start.', 'Site', 'S', 'lead', 24),
  ('install', 'Install on the home screen, open offline', 'A web app manifest and a cached copy, so it opens like an app.', 'Site', 'S', 'lead', 25),
  ('languages', 'The site in other languages', 'Start with Japanese and Spanish. The data already carries original-script names.', 'Site', 'L', 'lead', 26),
  ('teacher', 'Teacher mode: a lesson from a course chapter', 'A printable page with the story, the songs and three questions.', 'Journey', 'M', 'lead', 27),
  ('embed', 'A small player others can embed', 'A place-and-decade list as a widget for blogs and classrooms, linking back.', 'Growth', 'M', 'lead', 28),
  ('desktop', 'A desktop layout with the playlist beside the map', 'On a wide screen the sheet becomes a side column so both are visible.', 'Site', 'M', 'lead', 29),
  ('friends', 'Follow a friend''s travels', 'See where friends have been and what they loved. Needs public handles and consent.', 'Account', 'L', 'lead', 30),
  ('lazy-data', 'Load a country''s lists only when it is opened', 'The page grew to 5.6 MB with the chart lists. Splitting the data per country keeps the first load small.', 'Site', 'M', 'lead', 31)
on conflict (slug) do nothing;
