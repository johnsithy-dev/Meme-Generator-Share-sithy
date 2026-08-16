# Meme Generator + Share

A full-stack meme creation and sharing platform. Upload an image or pick a
built-in template, add draggable text layers and stickers, then post it to
a public gallery where people can like, comment, download, and share.

## Live site

[https://your-site-name.web.app](https://your-site-name.web.app)

## Pages

- **Home** — intro, live stats, and a preview of recently posted memes
- **Create** — upload an image or choose a template (Funny, School, Gaming,
  Relationship), add draggable text layers, stickers/emojis, adjust font and
  color, download or post
- **Gallery** — public wall of every posted meme, with search (title/author/
  caption) and sort (newest, oldest, most liked)
- **About** — what the site is and how it works
- **Services** — a rotating showcase of everything the site offers
- **Contact** — a form that saves messages to Firestore for admins to read
- **Profile** — edit your display name, bio, and picture; manage your own
  posts (edit title, delete)
- **Public profile pages** (`/u/:uid`) — view any user's posts, stats, and bio
- **Admin dashboard** — Memes tab (edit/delete any post) and Messages tab
  (read/delete contact submissions), visible only to admin accounts

## Features

- Email/password authentication: register, log in, forgot/reset password,
  email verification required before posting or commenting
- Role-based access: regular users vs. admin accounts
- Full CRUD on memes: create, read, update (title), delete
- Likes on both memes and comments
- Threaded comments with replies
- Responsive navigation with a sticky nav bar and mobile hamburger menu
- Scroll-to-top button and "back" navigation that preserves scroll position
- Custom background image and photo carousels on Home/About/Contact

## Tech stack

- React 18 + Vite + React Router
- Firebase Authentication (email/password)
- Firebase Firestore (memes, comments, users, messages)
- **No Firebase Storage** — Storage now requires the paid Blaze plan, so
  images are stored as compressed base64 data URLs directly inside
  Firestore documents instead, keeping the whole project on the free
  Spark plan.

## Setup

1. **Install dependencies**
```bash
   npm install
```

2. **Firebase project setup** (in the Firebase console)
   - Build → Authentication → Sign-in method → enable **Email/Password**
   - Build → Firestore Database → Create database (test mode to start)
   - Project settings → Your apps → register a Web app to get your config
   - Apply the security rules from `firestore.rules` (see below) for a
     production-ready setup instead of open test mode

3. **Environment variables**
```bash
   cp .env.example .env
```
   Paste your Firebase config values into `.env`. This file is gitignored —
   anyone cloning this repo needs to create their own `.env`.

4. **Run it**
```bash
   npm run dev
```

5. **Make yourself an admin** (optional)
   - Register an account in the running app
   - In Firebase console → Firestore Database → `users` collection, find
     your account's document and change `role` from `"user"` to `"admin"`
   - Refresh — an "Admin" link appears in the nav

## Deploying

```bash
npm run build
firebase deploy --only hosting:main
```

## Notes for grading

- CRUD is implemented on the `memes` collection (create/read/update/delete),
  the `comments` subcollection (create/read/delete, with reply support),
  and the `messages` collection (create/read/delete).
- Firestore security rules enforce: only signed-in + email-verified users
  can post memes/comments, users can only edit/delete their own content
  (admins can moderate anything), and contact messages are readable only
  by admins.