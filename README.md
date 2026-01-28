# VitePress i18n Starter

A production-ready, multi-language documentation starter template built with VitePress. This template provides automatic sidebar generation, comprehensive internationalization support, and a scalable folder structure for managing documentation in multiple languages.

## Features

- **Automatic Sidebar Generation**: Dynamically generates sidebar navigation based on your folder structure
- **13 Built-in Languages**: Supports English, Simplified Chinese, Traditional Chinese, Japanese, Korean, Russian, Spanish, Portuguese, German, French, Polish, Turkish, and Italian
- **File-based Routing**: Automatic route generation from Markdown files
- **Ordered Navigation**: Customizable ordering of sidebar items
- **SEO Optimized**: Automatic hreflang tags and language alternates
- **Clean URLs**: No .html extensions in production
- **Dark/Light Mode**: Built-in theme switching
- **Local Search**: Full-text search for all languages

## Project Structure

```
docs/
├── index.md                    # English homepage
├── guide/                      # English guide directory
│   ├── getting-started.md
│   ├── configuration.md
│   └── .directory.json        # Directory configuration
├── api/                       # English API directory
│   ├── index.md
│   └── reference.md
└── localization/              # Translated documentation
    ├── chs/                   # Simplified Chinese
    │   ├── index.md
    │   ├── guide/
    │   └── api/
    ├── cht/                   # Traditional Chinese
    ├── ja/                    # Japanese
    ├── ko/                    # Korean
    └── ...                    # Other languages
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, yarn, or pnpm

### Installation

1. Clone this repository or use it as a template:

```bash
git clone https://github.com/GongSunFangYun/vitepress-i18n-starter.git
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:

```bash
npm run docs:dev
# or
yarn docs:dev
# or
pnpm docs:dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run docs:build
# or
yarn docs:build
# or
pnpm docs:build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run docs:preview
# or
yarn docs:preview
# or
pnpm docs:preview
```

## Configuration

### Adding More Languages

To add a new language, modify the `config.js` file:

```javascript
// Add to the languages array
const languages = [
  // ... existing languages
  {
    code: 'fr',                    // Language code
    label: 'Français',            // Display name
    lang: 'fr-FR',                // Language tag for HTML
    dir: 'ltr',                   // Text direction (ltr or rtl)
    path: '/localization/fr/',    // URL path
    docsDir: 'localization/fr'    // Docs directory
  }
]

// Add to the languageConfigs object
const languageConfigs = {
  // ... existing configurations
  fr: {
    title: 'Documentation',
    description: 'Documentation multilingue'
  }
}

// Update the getText function for the new language
function getText(key, langCode) {
  const texts = {
    outline: {
      // ... existing translations
      fr: 'Sur cette page'
    },
    prev: {
      // ... existing translations
      fr: 'Précédent'
    },
    next: {
      // ... existing translations
      fr: 'Suivant'
    },
    // ... other text keys
  }
  return texts[key]?.[langCode] || texts[key]?.en || key
}
```

Then create the corresponding directory structure:

```bash
mkdir -p docs/localization/fr
```

### Directory Configuration

Each directory can have a `.directory.json` file to configure its sidebar behavior:

```json
{
  "title": "Custom Directory Title",
  "order": 1
}
```

- `title`: Custom title for the directory in the sidebar (optional, defaults to generated title)
- `order`: Sorting order (lower numbers appear first, defaults to 9999)

### Frontmatter Format

Each Markdown file can include frontmatter for metadata:

```yaml
---
title: Custom Page Title
order: 2
---

# Page Content
```

- `title`: Custom title for the page (optional, defaults to filename)
- `order`: Sorting order within its directory (optional)

### Customizing Navigation

Edit the `themeConfig` section in `config.js`:

```javascript
themeConfig: {
  // Social links (GitHub, Discord, etc.)
  socialLinks: [
    { icon: 'github', link: 'https://github.com/your-username/your-repo' },
    // Add more social links as needed
  ],

  // Navigation bar items
  nav: [
    {
      text: 'Copyright © 2025 Your Company, All Rights Reserved.',
      link: '#',
    }
    // Add more navigation items
  ]
}
```

## Content Guidelines

### File Naming Convention

- Use lowercase with hyphens: `getting-started.md`
- Avoid spaces and special characters
- Index files should be named `index.md`

### Language Consistency Requirement

**Important**: All language directories must have identical structure:

- Same directory names
- Same file names
- Same relative paths

This ensures proper language switching and prevents 404 errors.

### Adding Content

1. Create the file in the English directory first: `docs/guide/new-topic.md`
2. Create corresponding files in all language directories: `docs/localization/[lang]/guide/new-topic.md`
3. Add frontmatter if needed
4. The sidebar will automatically update

## Customization

### Styling

Add custom CSS in `.vitepress/theme/custom.css`:

```css
:root {
  --vp-c-brand: #646cff;
  --vp-c-brand-light: #747bff;
  --vp-c-brand-dark: #535bf2;
}
```

Then import it in `.vitepress/theme/index.js`:

```javascript
import './custom.css'
```

### Layout Components

Override default components in `.vitepress/theme/`:

- `Layout.vue` - Main layout
- `Home.vue` - Homepage component
- Custom components in `components/` directory

## Deployment

### GitHub Pages

1. Update `base` in `config.js`:

```javascript
export default defineConfig({
  base: '/your-repo-name/', // Repository name
  // ...
})
```

2. Add deployment script to `package.json`:

```json
{
  "scripts": {
    "docs:deploy": "npm run docs:build && npx gh-pages -d dist"
  }
}
```

3. Run deployment:

```bash
npm run docs:deploy
```

### Netlify/Vercel

Deploy the `dist` directory directly. Both platforms support static site deployment with redirects for clean URLs.

## Troubleshooting

### Sidebar Not Updating

- Ensure Markdown files have correct extensions (`.md` or `.markdown`)
- Check that files are not hidden (don't start with `.`)
- Verify directory structure consistency across languages

### Language Switching Issues

- Confirm all language directories have identical file structure
- Check that language paths in `config.js` are correct
- Ensure hreflang tags are properly configured

### Build Errors

- Verify Node.js version (20+ required)
- Check for syntax errors in Markdown frontmatter
- Ensure all required dependencies are installed

## Contributing

When adding content:
1. Maintain identical directory structure across all languages
2. Use consistent frontmatter format
3. Test language switching functionality
4. Verify sidebar generation works correctly

## License

This project is open source and available under the Apache 2.0 License.

## Support

For issues and feature requests, please open an issue on the GitHub repository.