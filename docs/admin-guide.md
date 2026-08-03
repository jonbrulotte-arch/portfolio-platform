# Admin Guide

Access the admin dashboard at `/admin`. Log in with your email and password.

---

## Dashboard

The dashboard shows at-a-glance stats (total projects, published, drafts, media files) and a list of recently updated projects with quick links to edit or view them live.

---

## Projects

### Creating a project

1. **Admin → Projects → + New Project**
2. Fill in the **Title** — the slug is auto-generated but can be edited
3. Add a **Short Description** (shown on project cards in the public site)
4. Use the tabbed editor to fill in each section

### Editor tabs

| Tab | Contents |
|---|---|
| **Content** | Full Markdown description with toolbar and Write/Preview toggle |
| **Media** | Screenshots / cover image — upload directly, pick from library, or enter a URL |
| **Links** | External links (GitHub, live demo, docs) with icon selection |
| **Embed** | Raw HTML embed code for live demos (iframes, CodeSandbox, etc.) with preview |
| **SEO** | SEO title, description, and OG image override |

### Sidebar controls

- **Publish Status** — Draft / Published / Archived / Scheduled (with date picker)
- **Dev Status** — Active / Maintained / Experimental / Deprecated / Completed / WIP
- **Featured** — appears in the Featured Projects section on the homepage
- **Sort Order** — controls ordering within the featured/category views
- **Category** — assign to one category
- **Tags** — toggle any number of tags
- **Tech Stack** — add technologies shown as badges on the project page
- **Repository URL / Live URL** — shown in the project sidebar

### Media tab — adding screenshots

Three ways to add a screenshot:
1. **Upload** — click "Upload" to select image files directly from your computer; they're saved to the media library and immediately linked
2. **Browse Library** — opens the media picker to select an existing uploaded file
3. **+ URL** — manually type or paste an image URL

The **first screenshot** is used as the project cover image on cards.

Each screenshot has **Alt text** (required for accessibility) and an optional **Caption** shown in the gallery.

### Versions

Click **Save Version** to snapshot the current project state with an optional note. Versions are stored but the UI for browsing/restoring them is accessible via the API (`GET /api/projects/:id/versions`).

### Publishing workflow

| Status | Behaviour |
|---|---|
| Draft | Not visible on the public site |
| Published | Live immediately |
| Scheduled | Published automatically at the chosen date/time (requires a cron job or server restart to trigger — Next.js does not auto-publish on schedule without an external trigger) |
| Archived | Hidden from public listings but URL still accessible if known |

---

## Pages

Static content pages (About, Contact, etc.) that appear in the site navigation.

1. **Admin → Pages → + New Page**
2. Write content in Markdown using the toolbar editor
3. Toggle **Show in navigation** to add the page to the nav bar; set **Nav order** to control position
4. Publish when ready

Pages support the same SEO fields as projects (title, description, OG image).

---

## Categories

Categories group projects. Each category has:
- **Name** and URL **Slug**
- **Icon** — an emoji displayed beside the category name
- **Color** — a hex color used for visual accents
- **Description**

Projects can belong to one category. Categories appear as filter chips on the projects index and the homepage categories bar.

---

## Tags

Tags are freeform labels for cross-cutting concerns (e.g. "open-source", "cli", "side-project"). A project can have any number of tags. Tags appear as filter options in the projects sidebar.

---

## Media

The media library stores all uploaded files.

- **Images** are shown as thumbnails in a grid
- **PDFs**, **Word documents**, **videos**, and other file types show a colour-coded type icon
- Hover any tile to reveal **Copy URL** and **Delete** actions
- The **search bar** filters by filename or alt text

### Uploading files

Click **Upload Files** or drag and drop onto the dashed zone. Multiple files can be selected at once.

### Using media in projects

From the project editor → **Media tab** → click **Upload** or **Browse Library**. Selecting an image from the library pre-fills the URL and alt text fields automatically.

---

## Settings

### Site Identity

| Field | Description |
|---|---|
| Site Name | Shown in the browser tab and nav if no logo is set |
| Tagline | Sub-heading shown in the hero section |
| Description | Used as the default meta description for SEO |
| Site Logo | Image shown in the nav bar instead of the site name text |
| Logo Alt Text | Alt text for the logo image (required for accessibility) |

Upload a logo with **Upload Logo** or pick one from **Browse Library**. The logo is displayed at 32px height; SVG or PNG with transparent background works best.

### Owner / Author

Fields used in the hero section and meta tags: name, email, bio, avatar URL.

### Social Links

GitHub, LinkedIn, and Twitter URLs. These appear in the site footer. The GitHub link also shows as a button in the hero section.

### Appearance

- **Accent Color** — controls the nav logo text color and button highlights (hex value with color picker)
- **Footer Text** — the copyright/credit line in the site footer

### SEO & Analytics

- **Default OG Image** — fallback Open Graph image used when a project doesn't specify one
- **Analytics ID** — Google Analytics 4 measurement ID (e.g. `G-XXXXXXXXXX`)

### Homepage Sections

Toggle each homepage section on or off:

| Toggle | Controls |
|---|---|
| Show Hero Section | Large name/tagline/bio block at the top |
| Show Categories Bar | Scrollable row of category filter chips |
| Show Featured Projects | Grid of projects marked as "Featured" |
| Show Recent Projects | Grid of the 6 most recently published projects |

Disabling a section also skips its database query, so there's no performance cost.

---

## Backup & Restore

See the dedicated [Backup & Restore guide](./backup-restore.md).
