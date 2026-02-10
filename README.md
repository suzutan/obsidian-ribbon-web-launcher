# Ribbon Web Launcher

Pin websites to your Obsidian ribbon sidebar and open them in Web Viewer — with automatic favicons and smart tab management.

## Features

- **Ribbon shortcuts** — Add custom website links as icons in the left ribbon sidebar
- **Web Viewer integration** — Open links directly in Obsidian's built-in Web Viewer (no external browser needed)
- **Smart tab reuse** — Clicking a ribbon icon focuses the existing tab instead of opening a duplicate
- **Flexible icons** — Choose from three icon types:
  - **Favicon (auto)** — Automatically fetched from the website's domain
  - **Custom image URL** — Specify any image URL directly (useful for services like Gmail, Google Calendar, etc.)
  - **Lucide icon** — Manually select from [Lucide Icons](https://lucide.dev)

## Requirements

- Obsidian **1.8.0** or later (desktop only)
- **Web Viewer** core plugin must be enabled (Settings → Core plugins → Web Viewer)

## Installation

### From Community Plugins (coming soon)

1. Open Settings → Community plugins → Browse
2. Search for "Ribbon Web Launcher"
3. Click Install, then Enable

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/suzutan/obsidian-ribbon-web-launcher/releases/latest)
2. Create a folder `ribbon-web-launcher` in your vault's `.obsidian/plugins/` directory
3. Place the downloaded files into the folder
4. Reload Obsidian and enable the plugin in Settings → Community plugins

## Usage

1. Go to Settings → Community plugins → Ribbon Web Launcher
2. Click **Add Link**
3. Configure:
   - **Label** — Tooltip text shown when hovering over the icon
   - **URL** — The web page to open
   - **Icon type** — Favicon (auto), Custom image URL, or Lucide icon
4. Save — the icon appears in your ribbon immediately

### Custom Icon URLs

For services with dynamic favicons (e.g., Google apps), use "Custom image URL" with a direct icon link:

| Service | Example URL |
|---|---|
| Gmail | `https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico` |
| Google Calendar | `https://calendar.google.com/googlecalendar/images/favicons_2020q4/calendar_31.ico` |
| Google Drive | `https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png` |

## Development

```bash
# Install dependencies
npm install

# Development mode (watch for changes)
npm run dev

# Production build
npm run build
```

## License

[MIT](LICENSE)
