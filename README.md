# Trello Clone

A Trello-style task management app built with React, TypeScript, Vite, Tailwind CSS, Firebase Authentication, and Cloud Firestore.

## Features

- Google sign-in with Firebase Authentication
- User-specific boards stored in Cloud Firestore
- Create, rename, and delete boards
- Create, rename, and delete lists
- Create and reorder lists and cards with drag and drop
- Move cards between lists
- Edit card titles and descriptions
- Add tags and deadlines to cards
- Persist board changes across refreshes and sessions
- Responsive horizontal and vertical scrolling for large boards

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- `@dnd-kit` for drag and drop
- `devstract` for generated visual backgrounds

## Requirements

- Node.js 20 or newer
- npm
- A Firebase project

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will print the local URL, usually `http://localhost:5173`.

## Firebase Setup

The application uses the Firebase project configured in `src/firebase.ts`.

In Firebase Console:

1. Enable **Authentication**.
2. Enable the **Google** sign-in provider.
3. Create a **Cloud Firestore** database.
4. Deploy or copy the rules from `firestore.rules`.

The Firestore rules restrict each signed-in user to their own data:

```text
users/{userId}/boards/{boardId}
```

The current client configuration is committed in `src/firebase.ts`. Firebase web configuration values are safe to include in a client application, but access control must be enforced through Authentication and Firestore Security Rules.

## Data Model

Boards are stored per user:

```text
users/{uid}/boards/{boardId}
```

Each board document contains board metadata and arrays for its lists and content cards. Cards can include:

- `title`
- `description`
- `tags`
- `deadline`
- `listId`

## Available Scripts

```bash
npm run dev       # Start the Vite development server
npm run build     # Type-check and create a production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build locally
```

## Project Structure

```text
src/
  components/       Reusable UI components and drag-and-drop elements
  context/          Firebase authentication context
  pages/            Login, boards, and individual board views
  assets/           Static imported assets
  firebase.ts       Firebase app, Auth, and Firestore initialization
  App.tsx           Application routes
  main.tsx          React application entry point
firestore.rules     Firestore access-control rules
```

## Production Build

Create a production build with:

```bash
npm run build
```

The generated files are placed in `dist/` and can be deployed to Firebase Hosting or another static hosting provider. Make sure the Firebase Authentication authorized domains include the production domain.

## Troubleshooting

### Firestore permission denied

Confirm that:

- The user is signed in.
- Firestore has been created for the configured Firebase project.
- `firestore.rules` has been deployed.
- The current domain is listed under Firebase Authentication authorized domains.

### Login redirects unexpectedly

The application waits for Firebase Auth to finish loading. Authenticated users are redirected from `/login` to `/boards`, while unauthenticated users are redirected to `/login` from protected routes.
