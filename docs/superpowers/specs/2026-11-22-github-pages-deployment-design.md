# GitHub Pages Deployment Design

## Goal

Make the static website open successfully when GitHub Pages serves the repository root, without changing the existing `admin/` and `client/` directories.

## Design

- Add a root `index.html` that redirects to the public site at `client/index.html`.
- Include a normal link to `client/index.html` as a fallback if automatic redirect is unavailable.
- Add an empty root `.nojekyll` file so GitHub Pages publishes the static directory tree without Jekyll processing.
- Keep all existing pages, assets, and relative links in `admin/` and `client/`.
- Configure GitHub Pages to deploy branch `main` from `/(root)`. This is a repository setting and cannot be enabled by the files alone.

## Alternatives considered

1. Move the public site's files to the repository root. This makes the root URL serve the full page directly but requires changing existing relative links and assets.
2. Add a GitHub Actions Pages workflow. This requires selecting GitHub Actions as the Pages source and adds deployment configuration that is unnecessary for this static site.
3. Keep the current folders and add a root redirect. This is the recommended option because it is the smallest change and preserves existing page paths.

## Validation

- Confirm the root entry point targets an existing `client/index.html`.
- Confirm relative client/admin links and asset paths still resolve.
- Check the new HTML and deployment markers are present at repository root.

## Constraints

This project is static HTML, CSS, and JavaScript. The entry point does not add a backend or make demo form submissions persistent.
