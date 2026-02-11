# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Obsidian plugin that adds custom website shortcuts to the ribbon sidebar, opening them in Obsidian's Web Viewer with smart tab reuse. Single-file plugin architecture (`main.ts`).

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

- **RibbonUrlLinksPlugin** (main.ts:22-131): Main plugin class
  - `leafMap`: Tracks Web Viewer tabs by link ID for tab reuse
  - `ribbonIcons`: HTMLElement array of ribbon icons
  - `refreshRibbonIcons()`: Removes and recreates all ribbon icons from settings
  - `openUrlInWebViewer()`: Opens URL in Web Viewer, reusing existing tab if present

- **LinkModal** (main.ts:133-266): Modal dialog for add/edit link
  - Dynamically shows/hides icon settings based on selected `iconType`
  - Three icon types: `favicon` (auto), `custom` (image URL), `lucide` (manual)

- **RibbonUrlLinksSettingTab** (main.ts:268-347): Settings UI
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

### Icon Rendering Logic (main.ts:50-98)

1. Always create ribbon with Lucide icon first (or 'globe' as fallback)
2. If `iconType === 'favicon'`, replace SVG with `<img>` from Google favicon service
3. If `iconType === 'custom'`, replace SVG with `<img>` from `customIconUrl`
4. On image load error, revert to original Lucide SVG

### Tab Reuse Mechanism (main.ts:100-122)

- Store `WorkspaceLeaf` reference in `leafMap` by link ID
- On ribbon click, check if leaf still exists in workspace
- If exists, focus it; if not, create new tab and update map

## Obsidian-Specific Notes

- Requires Obsidian 1.8.0+ and Web Viewer core plugin enabled
- Desktop only (`isDesktopOnly: true` in manifest.json)
- Uses `leaf.setViewState({ type: 'webviewer' })` to open Web Viewer
- Migration logic (main.ts:30-38) handles old links without `iconType`/`customIconUrl`

## Build Output

- **main.js**: Bundled plugin code (esbuild)
- **manifest.json**: Plugin metadata
- **styles.css**: Minimal CSS for favicon styling

## Anti-AI-Smell

文章を執筆する際は、初稿の段階から以下のAI臭パターンを回避する。別途スキャンは不要

- P1: 記号の残骸（`**太字**`残留、`──`emダッシュ、`「」`過剰使用、`／`並列、`→`因果）
- P2: リズムの単調さ（同一語尾3連、接続詞の羅列、not A but B構文の連打）
- P3: 説明書感（構造宣言「以下の3つの観点から」、メタ宣言「本記事では」）
- P4: 事なかれ主義（「一概には言えませんが」「状況によって異なります」等の保険表現）
- P5: 抽象語・万能語（「本質」「最適化」「変革」等の名詞偏重。動詞中心の具体表現に）
- P6: テンプレ比喩（羅針盤、エンジン、DNA、土台、架け橋、種を蒔く等は使用禁止）
