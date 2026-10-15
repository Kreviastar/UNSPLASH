# UnsplashBox

A responsive React app inspired by the supplied desktop/mobile designs. Search Unsplash, view photo details, download photos, and organize saved photos into local collections.

## Run locally

1. Install Node.js 18+.
2. Run `npm install`.
3. Create `.env` from `.env.example`.
4. Add an Unsplash **Access Key** as `VITE_UNSPLASH_ACCESS_KEY`.
5. Run `npm run dev`.

Get a key from https://unsplash.com/developers. The app uses the Unsplash API and should follow its current API guidelines and hotlinking requirements.

## Features

- Responsive home/search experience and results grid
- Search with Enter or the search icon; blank searches are ignored
- Separate photo details route with author, publication date, and collections
- Add/remove photos from collections
- Search existing collections while adding; collections that already contain the photo are excluded
- Create collections from the collections page
- Collection detail view
- Download action using Unsplash's download endpoint when an API key is configured
- Local collection persistence using `localStorage`

## Notes

Collections are stored in the current browser, not in an account or database. This makes the demo usable without a backend but does not sync collections across devices. For a production multi-user product, add authentication and a server-side database. The Unsplash API access key is exposed in a browser app by design; use an appropriately scoped public key and follow Unsplash's current rules. Never put a secret key in client code.

## Deploy

### Netlify
1. Push this folder to a GitHub repository.
2. Import the repository into Netlify.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add `VITE_UNSPLASH_ACCESS_KEY` under Site configuration → Environment variables.
6. Deploy.

### Vercel
Import the GitHub repository, use the Vite preset, and add the same environment variable.

The repository and live demo URLs must be created by you in GitHub and Netlify/Vercel; this project bundle does not claim to have been deployed.
