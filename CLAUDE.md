# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Obsidian plugin that adds custom website shortcuts to the ribbon sidebar, opening them in Obsidian's Web Viewer with smart tab reuse.

### Directory Structure

```
src/
  main.ts       # Main plugin code (363 lines)
  styles.css    # Minimal icon styling
dist/           # Build output (git-ignored)
  main.js       # Bundled plugin
  manifest.json # Copied from root
  styles.css    # Copied from src/
manifest.json   # Plugin metadata (source)
versions.json   # Version-Obsidian compatibility map
```

## Build Commands

```bash
# Install dependencies
pnpm install

# Development (watch mode)
pnpm run dev

# Production build (type checks + bundle)
pnpm run build

# Version bump (updates manifest.json and versions.json)
pnpm run version
```

## Architecture

### Core Components

- **RibbonUrlLinksPlugin** (src/main.ts:22-155): Main plugin class
  - `leafMap`: Tracks Web Viewer tabs by link ID for tab reuse
  - `ribbonIcons`: HTMLElement array of ribbon icons
  - `commandIds`: Set of registered command IDs
  - `refreshRibbonIcons()`: Removes and recreates all ribbon icons from settings
  - `refreshCommands()`: Registers commands for each link (command palette integration)
  - `openUrlInWebViewer()`: Opens URL in Web Viewer, reusing existing tab if present

- **LinkModal** (src/main.ts:133-266): Modal dialog for add/edit link
  - Dynamically shows/hides icon settings based on selected `iconType`
  - Three icon types: `favicon` (auto), `custom` (image URL), `lucide` (manual)

- **RibbonUrlLinksSettingTab** (src/main.ts:268-347): Settings UI
  - Lists all links with Edit/Delete buttons
  - Calls `refreshRibbonIcons()` after any change

### Data Structure

```typescript
interface RibbonLink {
  id: string; // Generated: `link-${Date.now()}`
  url: string;
  label: string; // Tooltip text
  icon: string; // Lucide icon name
  iconType: IconType; // 'favicon' | 'lucide' | 'custom'
  customIconUrl: string;
}
```

### Icon Rendering Logic (src/main.ts:50-98)

1. Always create ribbon with Lucide icon first (or 'globe' as fallback)
2. If `iconType === 'favicon'`, replace SVG with `<img>` from Google favicon service
3. If `iconType === 'custom'`, replace SVG with `<img>` from `customIconUrl`
4. On image load error, revert to original Lucide SVG

### Tab Reuse Mechanism (src/main.ts:100-122)

- Store `WorkspaceLeaf` reference in `leafMap` by link ID
- On ribbon click, check if leaf still exists in workspace
- If exists, focus it; if not, create new tab and update map

## Obsidian-Specific Notes

- Requires Obsidian 1.8.0+ and Web Viewer core plugin enabled
- Desktop only (`isDesktopOnly: true` in manifest.json)
- Uses `leaf.setViewState({ type: 'webviewer' })` to open Web Viewer
- Migration logic (src/main.ts:30-38) handles old links without `iconType`/`customIconUrl`

## Build Output

All build artifacts are output to `dist/`:
- **dist/main.js**: Bundled plugin code (esbuild)
- **dist/manifest.json**: Copied from root manifest.json
- **dist/styles.css**: Copied from src/styles.css

## Publishing to Obsidian Community Plugins

### Requirements

✅ Already satisfied:
- Public GitHub repository
- manifest.json with all required fields
- README.md (English + Japanese)
- LICENSE file (MIT)
- versions.json (version → minAppVersion mapping)

### Publishing Steps

1. **Create GitHub Release**
   ```bash
   pnpm run build
   # Tag: 1.0.0
   # Attach: dist/main.js, manifest.json, dist/styles.css
   ```

2. **Submit PR to obsidian-releases**
   - Repository: https://github.com/obsidianmd/obsidian-releases
   - File: `community-plugins.json`
   - Add entry (alphabetically):
     ```json
     {
       "id": "ribbon-web-launcher",
       "name": "Ribbon Web Launcher",
       "author": "suzutan",
       "description": "Pin websites to your Obsidian ribbon sidebar and open them in Web Viewer — with automatic favicons and smart tab management.",
       "repo": "suzutan/obsidian-ribbon-web-launcher"
     }
     ```

3. **Wait for Review**
   - Obsidian team reviews manifest.json, README, and release files
   - Review time: typically 3-7 days

4. **Auto-updates**
   - After approval, new GitHub releases auto-sync to Community Plugins store

## Anti-AI-Smell

文章を執筆する際は、初稿の段階から以下のAI臭パターンを回避する。別途スキャンは不要

- P1: 記号の残骸（`**太字**`残留、`──`emダッシュ、`「」`過剰使用、`／`並列、`→`因果）
- P2: リズムの単調さ（同一語尾3連、接続詞の羅列、not A but B構文の連打）
- P3: 説明書感（構造宣言「以下の3つの観点から」、メタ宣言「本記事では」）
- P4: 事なかれ主義（「一概には言えませんが」「状況によって異なります」等の保険表現）
- P5: 抽象語・万能語（「本質」「最適化」「変革」等の名詞偏重。動詞中心の具体表現に）
- P6: テンプレ比喩（羅針盤、エンジン、DNA、土台、架け橋、種を蒔く等は使用禁止）
