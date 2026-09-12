# Activity Points Management System

A React front-end project for managing student activity points earned through technical, cultural, sports, social service, entrepreneurship, leadership, and professional activities.

## Features

- Student login using UID and password from JSON data
- Dashboard with total, required, approved, pending, and remaining points
- Activity list with filtering by status and category
- Activity details page
- Add activity form with local state updates
- Categories page
- Student profile and points summary
- JSON data source in `public/data`

## Sample Login

- UID: `STU2026001`
- Password: `student123`

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy To GitHub Pages

1. Create a GitHub repository.
2. Push this project to the repository.
3. Update `package.json` with:

```json
"homepage": "https://your-username.github.io/your-repo-name"
```

4. Run:

```bash
npm run deploy
```

5. Enable GitHub Pages from the `gh-pages` branch in repository settings.
