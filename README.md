# The Council — latest project backup

Packaged on October 13, 2026.

This ZIP contains the editable source code, the latest built website, server
functions, database schema, package lockfile, and regression tests.

The latest update separates personal discussions from shared councils, adds
host sharing of reviewed shared-conversation copies, clarifies speaking steps,
and improves keyboard access, mobile layouts, and Arabic labels.

## Save and use locally

1. Extract the ZIP. Keep the `source/` and `website/` folders together.
2. Install Node.js 24 or newer and Python 3.
3. Open a terminal in the extracted project:

   ```sh
   cd website
   npm ci
   npm run build
   npm test
   ```

4. To run the full website locally, prepare a PostgreSQL database using
   `website/db/schema.sql`, and configure `DATABASE_URL` privately in your shell
   or hosting environment. Configure your AI provider and its API key there too,
   such as `AI_PROVIDER=kimi` and `MOONSHOT_API_KEY`. Never commit their values.
5. Run `npm start`, then open `http://localhost:5000`.

The already-built website is `website/public/index.html`. Opening that HTML
file alone does not run the account, friends, sharing, rooms, or AI server APIs.
The separate `the-council.html` is the original Claude artifact variant, not a
replacement for hosting the full website.

## Save on GitHub

Unzip first and upload the files inside the `the-council/` folder to a new
repository. Upload the project files, not only the ZIP, if you want GitHub to
track changes.

Alternatively, from the extracted `the-council/` folder:

```sh
git init
git add .
git commit -m "Latest Council update"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Use a private repository if you want to keep the source code and server-side
persona prompts private. GitHub stores the project; GitHub Pages alone cannot
run this application's backend or account features.

## Hosting and data

See `website/README.md` for the existing Netlify setup. Replit runtime settings
are included in `.replit`, without account-specific environment values. For a
new Netlify project, link to your own site rather than copying the existing site
identifier from that guide.

Hosting secrets and account-specific settings must be configured separately,
including any `PREMIUM_ACCOUNT_EMAILS` grants you want to retain. This code ZIP
does not include accounts, passwords, database records, shared rooms, snapshots,
or browser-local discussion history. Moving hosting does not automatically
move that data.

Excluded: secrets and environment files, Git history, dependencies, caches,
test-storage records, agent notes, temporary files, and older ZIP archives.
