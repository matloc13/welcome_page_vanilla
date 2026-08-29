# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A vanilla HTML/CSS/JS personal portfolio site for Matthew Lockdall. No build system, no dependencies, no package.json. The compiled CSS (`css/main.css`) is committed alongside the Sass source.

## Styling workflow

Styles are authored in `sass/` and must be compiled to `css/main.css` before changes take effect in the browser. The entry point is `sass/main.scss`, which imports all partials in order:

```
variable → reset → header → bio → archive → contact → footer → animations
```

To compile Sass (requires `sass` CLI):
```bash
sass sass/main.scss css/main.css
```

To watch during development:
```bash
sass --watch sass/main.scss:css/main.css
```

The `css/main.css.map` source map is committed alongside the compiled CSS.

## Key design tokens (`sass/variable.scss`)

- Fonts: Federo, IM Fell DW Pica (serif/display), Hind Madurai (body)
- Colors: `$white`, `$red` (accent), `$lightblue`, `$lightgrey`, `$darkgrey`, `$darkblue`
- Link placeholder: `%a-link` — red, no underline

## JavaScript (`app.js`)

Uses the Intersection Observer API for scroll-triggered animations. Three observers:
- `cardObserver` — triggers `anim1` (slide up + fade in) on `.anim` elements; uses `data-delay` attribute for stagger
- `titleObserver` — triggers `anim2` (slide in from left + fade in) on `.tit` elements; also uses `data-delay`
- `backgroundObserver` — hooks onto `#archive` for a background animation (currently a no-op keyframe)

On `window.load`, the script fires warm-up fetches to Heroku-hosted portfolio projects to reduce cold-start latency (those apps may no longer be live).

`showForm()` is called inline from HTML (`onclick="showForm()"`) to toggle the contact email reveal.

## Deployment

Hosted on GitHub Pages. The `CNAME` file maps the custom domain. Pushing to `master` deploys the site.


## Run Locally 

CLI: python3 -m http.server 8080 --directory /Users/mattlockdall/Documents/pdev/welcome_page_vanilla