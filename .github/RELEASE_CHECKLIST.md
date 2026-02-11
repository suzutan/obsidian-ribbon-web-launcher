# Release Checklist

## Prerequisites

- [ ] All tests passing
- [ ] Version updated in `package.json`
- [ ] CHANGELOG or release notes prepared
- [ ] Security alerts resolved

## Release Steps

### 1. Version Bump

```bash
# Update package.json version (e.g., 1.0.0 → 1.0.1)
npm version patch  # or minor/major

# This will automatically:
# - Update manifest.json version
# - Update versions.json with new entry
# - Create a git commit
```

### 2. Create and Push Tag

```bash
# Create tag (format: v1.0.1)
git tag v1.0.1

# Push tag to trigger GitHub Actions release workflow
git push origin v1.0.1
```

### 3. Verify Release

- [ ] GitHub Actions workflow completes successfully
- [ ] Release appears at https://github.com/suzutan/obsidian-ribbon-web-launcher/releases
- [ ] Assets attached: `main.js`, `manifest.json`, `styles.css`

## Submit to Obsidian Community Plugins (First Release Only)

### 4. Fork obsidian-releases

```bash
# Fork https://github.com/obsidianmd/obsidian-releases
# Clone your fork
git clone https://github.com/YOUR_USERNAME/obsidian-releases.git
cd obsidian-releases
```

### 5. Add Plugin Entry

Edit `community-plugins.json` and add (in alphabetical order):

```json
{
  "id": "ribbon-web-launcher",
  "name": "Ribbon Web Launcher",
  "author": "suzutan",
  "description": "Pin websites to your Obsidian ribbon sidebar and open them in Web Viewer — with automatic favicons and smart tab management.",
  "repo": "suzutan/obsidian-ribbon-web-launcher"
}
```

### 6. Create Pull Request

```bash
git checkout -b add-ribbon-web-launcher
git add community-plugins.json
git commit -m "Add Ribbon Web Launcher plugin"
git push origin add-ribbon-web-launcher
```

Create PR with title: **"Add Ribbon Web Launcher plugin"**

### 7. Wait for Review

- Obsidian team reviews (typically 3-7 days)
- Address any feedback
- Once merged, plugin appears in Community Plugins browser

## Subsequent Releases

After initial approval, new releases are automatic:

1. Update version in `package.json`
2. Run `npm version patch/minor/major`
3. Push tag: `git push origin v1.x.x`
4. GitHub Actions creates release
5. Users see update in Obsidian

## Troubleshooting

**Workflow fails:**
- Check GitHub Actions logs
- Verify `pnpm run build` works locally
- Ensure tag format is `v*.*.*`

**Release missing files:**
- Check `dist/` directory exists after build
- Verify `esbuild.config.mjs` copies files correctly

**Obsidian PR rejected:**
- Ensure manifest.json has all required fields
- Verify README.md is comprehensive
- Check release files are valid
