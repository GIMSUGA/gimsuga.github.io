# GIMSUGA Ebonyi State chapter website

The public website of the Ebonyi State chapter of GIMSUGA, the global association of Imo State University
graduates. It is a static site built with [Hugo](https://gohugo.io/) and published on GitHub Pages. Chapter
officers edit it from their phones with [Sveltia CMS](https://sveltiacms.app/).

The site is public and static. It has no sign-in for visitors, keeps no member data, sets no tracking cookies,
and never takes payments.

## Never put these in this repository

The repository is public and its history is kept forever, including anything later deleted.

- Payment details, bank details, or anything that takes payments.
- WhatsApp group invite links (`chat.whatsapp.com`). The chapter's own number goes in `data/chapter.yaml`.
- Personal phone numbers or email addresses, and secrets or `.env` files.
- Photographs of people without their recorded agreement.

The build checks for group invite links and Gmail addresses and refuses to publish if it finds one.

## Branches and addresses

| Branch | Address | What it is |
|---|---|---|
| `dev` | `https://gimsuga.github.io/preview/` | The preview. Every page says "Preview" at the top and asks search engines not to index it. |
| `main` | `https://gimsuga.github.io/` | The live site. Until launch it is a single "coming soon" page. |

One workflow, `.github/workflows/pages.yml`, runs on every push to either branch. It builds `main` at the root
and `dev` under `/preview/` and publishes both together. No secrets are needed.

**Launch.** The full site lives on `dev`; `main` holds only the coming-soon page. The site launches with one
pull request from `dev` into `main`, approved by a chapter officer. Merging it replaces the coming-soon page
with the full site.

## Publishing rule

- **Chapter officers** may publish directly: they edit in the CMS and their changes go straight out.
- **The maintainer's changes** (code, design, or content) go through a pull request into `main` that a chapter
  officer approves.

## Editing the site (chapter officers)

| Where | Edits | Changes appear on |
|---|---|---|
| `https://gimsuga.github.io/preview/admin/` | branch `dev` | the preview |
| `https://gimsuga.github.io/admin/` (after launch) | branch `main` | the live site |

`static/admin/config.yml` names branch `dev`; when the workflow builds the live site it switches the copy at
`/admin/` to `main`.

Officers need a GitHub account with write access to this repository. Sveltia offers two ways to sign in:

- **Sign in with GitHub.** Needs a small OAuth helper (for example Sveltia's
  [CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) on Cloudflare Workers) and a GitHub OAuth
  app. Not set up yet.
- **Sign in using access token.** Works with no helper. The officer creates a fine-grained personal access
  token on GitHub with *Contents: read and write* on this repository only, and pastes it in. Fine for testing.

What officers can edit: meetings, our work, officers, chapter details (name, area, meeting habit, WhatsApp
number, email) and the Join, Why belong and Privacy pages. Photos are resized and converted to WebP in the
browser before upload.

## Content

| File | Holds |
|---|---|
| `data/chapter.yaml` | Chapter facts, shown everywhere. The WhatsApp and email buttons on Join appear only if set. |
| `data/officers.yaml` | Officers, in display order. |
| `data/nav.yaml` | The menu (top bar and phone tab bar). |
| `content/meetings/*.md` | One file per meeting. Front matter: date, time, venue, agenda. The text below is the report. |
| `content/work/*.md` | One file per piece of work, with its photo and photo credit. |
| `content/join.md`, `why-belong.md`, `privacy.md` | Page text. |
| `static/images/uploads/` | Photos uploaded through the CMS. |

Meetings are sorted into upcoming and past when the site is built, and again in the visitor's browser, so the
lists stay right between builds.

## Run it locally (Docker, nothing to install)

From this folder, in Git Bash:

```sh
MSYS_NO_PATHCONV=1 docker run --rm -p 127.0.0.1:1313:1313 -v "$(pwd -W):/project" -w /project \
  ghcr.io/gohugoio/hugo:v0.166.0 server --bind 0.0.0.0 --poll 700ms
```

Open `http://localhost:1313/`. Add `--environment preview --baseURL http://localhost:1313/preview/` to see
the preview build with its banner. (On macOS or Linux use `$(pwd)` instead of `$(pwd -W)`.)

## Sveltia CMS version

`static/admin/index.html` loads Sveltia from unpkg, pinned to an exact version with an integrity hash. To
update it:

1. Find the latest version at <https://github.com/sveltia/sveltia-cms/releases> and read the release notes.
2. Change the version in the `<script>` URL in `static/admin/index.html` and in the `$schema` line of
   `static/admin/config.yml`.
3. Replace the `integrity` hash:
   `curl -sL https://unpkg.com/@sveltia/cms@VERSION/dist/sveltia-cms.js | openssl dgst -sha384 -binary | openssl base64 -A`
   (prefix the result with `sha384-`).
4. Check `/preview/admin/` still loads and can save before the change reaches `main`.

**Fallback:** [Decap CMS](https://decapcms.org/) reads the same `config.yml` format. If Sveltia ever has to be
replaced, swap the script for Decap's; the Sveltia-only options (`root: true` on the officers list and the
image transformations) would need adjusting.

## Built with

Built with AI-assisted development (Claude Code).
