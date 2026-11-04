# Movie Night

Pick tonight's film together.

**Live app:** https://seppedb.github.io/movie-night/

## About the project

Choosing a film for a movie night usually means twenty minutes of scrolling and "I don't mind, you pick".
**Movie Night** turns that into a quick, fair game:

1. Create a group for your friends, roommates or family, and share its invite code.
2. Everyone suggests a film, searched from a movie database so posters and details come along.
3. Everyone swipes through the suggestions: right for yes, left for no.
4. The app ranks the films by votes, and the winner is tonight's movie.

It is a Progressive Web App (PWA) built for Android: open it in Chrome and install it on your home screen. It then runs full screen like a native app.

## Live app and demo login

**Public link:** https://seppedb.github.io/movie-night/

Log in with this demo account. It is already a member of a group, so there is something to see:

| | |
|---|---|
| Email | `<DEMO EMAIL>` |
| Password | `<DEMO PASSWORD>` |

You can also create your own account with **Create an account** on the login screen.

**Install it as an app (Android, Chrome):** open the link, tap the menu ⋮ → **Install app**.

### Screens

| Screen | URL | What you can do |
|---|---|---|
| Login | `/login` | Log in or create an account |
| Your nights | `/` | See your groups, start a new group, or join one with an invite code |
| Group | `/group/<id>` | See the group's invite code and members, or leave the group. Open it by tapping a group on *Your nights*. |

The data is stored in a hosted [Supabase](https://supabase.com) database (PostgreSQL). Row Level Security makes sure you only see the groups you are a member of.

## The idea

### Target audience

- **Friend groups and roommates** who watch films together and can never agree on one.
- **Couples and families** who want a fair way to decide, without one person always picking.
- **Film clubs and student houses** that hold a regular movie night and want a quick way to choose.

Typical user: 18–35, watches through several streaming services, and plans the evening in a group chat. They want the decision to take two minutes, not twenty.

### Roadmap

- [x] Login and sign-up (Supabase Auth)
- [x] Installable PWA: manifest, icons, service worker with offline fallback
- [x] Automatic deployment to GitHub Pages
- [x] Groups: create a group, join it with an invite code, see the members, leave
- [ ] Movie search through the TMDB API, via a Supabase Edge Function so the API key stays secret
- [ ] Movie nights: each group runs one night at a time (suggesting → voting → results)
- [ ] Suggest films for the current night, with poster, year and synopsis
- [ ] Swipe voting: one card per film, swipe right for yes and left for no
- [ ] Results: films ranked by votes, the winner highlighted, then start a new night
- [ ] Live updates with Supabase Realtime, e.g. "waiting for 2 others"
- [ ] Extras: history of past nights, a movie details page, a share link to join a group

### Competitors

| App | What it does | How Movie Night differs |
|---|---|---|
| Group chat polls (WhatsApp, Messenger) | A quick poll in the chat | No film info or posters, someone has to type every option, and the result gets lost in the chat |
| Letterboxd | Film diary, ratings and lists | Built for logging and reviewing films, not for deciding what a group watches tonight |
| JustWatch | Shows where a film is streaming, plus watchlists | A personal watchlist; it doesn't help a group decide |
| Teleparty | Watch Netflix and others in sync with friends | Helps you watch together *after* you've picked; Movie Night is about the picking |

Movie Night fills the gap between these: a small, focused tool for the **decision** itself, made fair by letting everyone suggest and vote.

## Built with

- [Expo](https://expo.dev) and [React Native](https://reactnative.dev), exported to the web with React Native Web
- [Expo Router](https://docs.expo.dev/router/introduction/): file-based routing with statically rendered pages
- [Supabase](https://supabase.com): authentication and a PostgreSQL database
- [Zustand](https://zustand.docs.pmnd.rs): state management
- [TypeScript](https://www.typescriptlang.org)
- GitHub Actions and GitHub Pages: build and hosting

## Getting started

### Prerequisites

- Node.js 24 (LTS)
- A free [Supabase](https://supabase.com) project

### Installation

1. Clone the repository and install the dependencies:
   ```sh
   git clone https://github.com/SeppeDB/movie-night.git
   cd movie-night
   npm install
   ```
2. Create a `.env` file in the project root with your Supabase project URL and publishable (anon) key:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
   ```
3. In the Supabase dashboard, open the **SQL Editor** and run [`supabase/001_groups.sql`](supabase/001_groups.sql). It creates the tables, security rules and functions.
4. Start the app in the browser:
   ```sh
   npx expo start --web
   ```

### Deployment

Every push to `main` builds the web version (`npx expo export --platform web`) and publishes it to GitHub Pages. See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
The two Supabase values are stored as repository variables under **Settings → Secrets and variables → Actions**.

## Project structure

```
app/                  Screens (Expo Router: every file is a route)
  login.tsx           Login and sign-up
  (app)/              Screens that need a logged-in user
    index.tsx         Your nights: list, create and join groups
    group/[id].tsx    One group: invite code and members
  +html.tsx           HTML template: PWA manifest, icons, service worker
src/
  components/         Reusable UI (buttons, inputs, text, …)
  services/           Supabase calls (auth, groups)
  state/              Zustand store for the logged-in user
  theme.ts            Colours, fonts and spacing
public/
  manifest.json       PWA manifest
  sw.js               Service worker (offline caching)
supabase/             SQL to set up the database
```
