# Club Event Radar: handoff notes for Warren

## 1. What works now

**Website:** https://chloewestberg.github.io/BUS4498_InClass_Builds/event_radar/

- **The event list:** Visitors see published events, soonest first, with a Free food tag and flyer photos.
- **Posting:** A club officer pastes an announcement (and can add a flyer photo). The AI agent (the `submit-event` Edge Function, using Claude) turns it into an event card and checks the posting rules. It then publishes the post, holds it for a moderator, or turns it down.
- **Duplicates:** The database refuses a second live post with the same date, start time, and place.
- **Photos:** Flyers are saved in the `flyers` storage bucket. A post with a photo always waits for a moderator.
- **Not finished: moderator sign-in (Stage 8).** The sign-in section is on the website, and one moderator account exists (new sign-ups are off). But the database change that lets moderators see and approve waiting posts (`20261023000300_moderator_sign_in.sql`) **hasn't been applied yet**. Until it is, signing in shows an empty list, and Approve and Reject don't work.

## 2. Where things live

- **GitHub repository:** `chloewestberg/BUS4498_InClass_Builds` (https://github.com/chloewestberg/BUS4498_InClass_Builds). The website is the `event_radar/` folder. GitHub Pages serves it from `main`, `/ (root)`.
- **Supabase project:** "chloewestberg's Project", Project URL https://saswyujtccnojjusqfxo.supabase.co
- **Files that matter (in `event_radar/`):**
  - `index.html`, `app.js`, `style.css`: the website
  - `config.js`: the Project URL and the publishable key (both public)
  - `supabase/functions/submit-event/index.ts`: the AI agent
  - `supabase/migrations/`: the database changes, one file per stage
  - `context/posting-rules.md`, `context/campus-places.md`: the rules and place codes (also copied into the agent)
  - `test/sample-announcements.md`, `test/sample-flyer.png`: test posts
  - `AGENTS.md`: how the project is built, stage by stage

## 3. Secrets

- `ANTHROPIC_API_KEY` is set in Supabase → **Edge Functions → Secrets**. The agent reads it there.
- You don't need the value, and it never goes in any file or chat. Supabase gives the agent its own secret key automatically.

## 4. How to test

Paste these on the website (more in `test/sample-announcements.md`):

1. **Board Game Guild: Game Night! Thursday, October 29, 7 to 10 pm in the University Union, Room 220. Free entry and free pizza while it lasts.** It should be **Published**, with Free and 🍕 Free food tags. Post it again and it should say **Already posted**.
2. **Kickoff party at our house on Foothill Blvd this Saturday at 9 pm! $10 at the door, BYOB. Venmo @jake-r-2026 to RSVP.** It should be **Waiting for a moderator**, because it's off campus, mentions alcohol, and has a payment handle. The handle stays off the card.
3. **Selling my ECON 201 textbook, barely used, $40.** It should be **Not posted**, because it isn't an event.

## 5. What's next

- **Finish Stage 8:** Apply `20261023000300_moderator_sign_in.sql` (Supabase → SQL Editor → paste the file → Run). Then sign in on the website and approve the waiting flyer post. It should appear on the event list with its photo.
- **The optional nightly clean-up:** Archive past events automatically (see `AGENTS.md`).
- **Ideas:** a filter by place or club, an "add to calendar" link, and letting a club edit a post that's missing details instead of posting again.

## 6. How we take turns

1. **Tell each other before you start working**, so only one of us changes files at a time.
2. **Download before you start:** In GitHub Desktop, click **Fetch origin**, then **Pull origin**.
3. **Upload when you stop:** Commit your changes with a short message, then click **Push origin**.
