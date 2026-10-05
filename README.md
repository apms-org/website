# APM website

The APM homepage and documentation, built with Next.js.

```sh
npm install
npm run dev        # http://localhost:3000 and http://localhost:3000/docs
npm run build      # production build; every docs page is prerendered
npm start          # serve the build
```

Node 20.9 or newer.

## Layout

```
app/
  (home)/            the homepage, its own root layout
  home-css/          homepage styles, one file per area
  (docs)/            the docs, their own root layout and docs.css
    docs/page.jsx            /docs
    docs/[...slug]/page.jsx  /docs/<section>/<page>
    docs/search.json/        the search index, generated at build time
components/
  home/              the homepage sections (React, reads the design system from window.APM)
  docs/              docs UI: sidebar, search, table of contents, MDX components
content/docs/        every docs page, as MDX; see content/docs/AUTHORING.md
lib/                 docs loading and MDX rendering
vendor/design-system tokens, component bundle and fonts from ../design-system
```

The homepage and the docs have separate root layouts, so their styles never mix; moving between them is a full page load.

## Design system

`vendor/design-system` is a copy of `../design-system`, so the site builds on its own. After changing a token or component there, run `npm run ds:sync` here and commit the vendor folder.

## Writing docs

Add or edit an `.mdx` file under `content/docs/<section>/`. The sidebar, previous and next links, the docs home and search all update from the files; there is no nav file to edit. Frontmatter, components and voice are described in `content/docs/AUTHORING.md`.
