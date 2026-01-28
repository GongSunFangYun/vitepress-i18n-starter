import { defineConfig } from 'vitepress'
import path from 'path'
import fs from 'fs'

const languages = [
  { code: 'en', label: 'English', lang: 'en-US', dir: 'ltr', path: '/', docsDir: '' },
  { code: 'cs', label: '简体中文', lang: 'zh-CN', dir: 'ltr', path: '/localization/cs/', docsDir: 'localization/cs' },
  { code: 'ct', label: '繁體中文', lang: 'zh-TW', dir: 'ltr', path: '/localization/ct/', docsDir: 'localization/ct' },
  { code: 'ja', label: '日本語', lang: 'ja-JP', dir: 'ltr', path: '/localization/ja/', docsDir: 'localization/ja' },
  { code: 'ko', label: '한국어', lang: 'ko-KR', dir: 'ltr', path: '/localization/ko/', docsDir: 'localization/ko' },
  { code: 'ru', label: 'Русский', lang: 'ru-RU', dir: 'ltr', path: '/localization/ru/', docsDir: 'localization/ru' },
  { code: 'es', label: 'Español', lang: 'es-ES', dir: 'ltr', path: '/localization/es/', docsDir: 'localization/es' },
  { code: 'pt', label: 'Português', lang: 'pt-BR', dir: 'ltr', path: '/localization/pt/', docsDir: 'localization/pt' },
  { code: 'de', label: 'Deutsch', lang: 'de-DE', dir: 'ltr', path: '/localization/de/', docsDir: 'localization/de' },
  { code: 'fr', label: 'Français', lang: 'fr-FR', dir: 'ltr', path: '/localization/fr/', docsDir: 'localization/fr' },
  { code: 'pl', label: 'Polski', lang: 'pl-PL', dir: 'ltr', path: '/localization/pl/', docsDir: 'localization/pl' },
  { code: 'tr', label: 'Türkçe', lang: 'tr-TR', dir: 'ltr', path: '/localization/tr/', docsDir: 'localization/tr' },
  { code: 'it', label: 'Italiano', lang: 'it-IT', dir: 'ltr', path: '/localization/it/', docsDir: 'localization/it' }
]

const languageConfigs = {
  en: {
    title: 'Documentation',
    description: 'Multi-language documentation'
  },
  cs: {
    title: '文档中心',
    description: '多语言文档中心'
  },
  ct: {
    title: '文件中心',
    description: '多語言文檔中心'
  },
  ja: {
    title: 'ドキュメント',
    description: '多言語ドキュメント'
  },
  ko: {
    title: '문서',
    description: '多言語文書'
  },
  ru: {
    title: 'Документация',
    description: 'Многоязычная документация'
  },
  es: {
    title: 'Documentación',
    description: 'Documentación multilingüe'
  },
  pt: {
    title: 'Documentação',
    description: 'Documentação multilíngue'
  },
  de: {
    title: 'Dokumentation',
    description: 'Mehrsprachige Dokumentation'
  },
  fr: {
    title: 'Documentation',
    description: 'Documentation multilingue'
  },
  pl: {
    title: 'Dokumentacja',
    description: 'Dokumentacja wielojęzyczna'
  },
  tr: {
    title: 'Dokümantasyon',
    description: 'Çok dilli dokümantasyon'
  },
  it: {
    title: 'Documentazione',
    description: 'Documentazione multilingue'
  }
}

function generateTitleFromFilename(filename) {
  return filename
      .replace('.md', '')
      .replace('.markdown', '')
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
}

function readFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const frontmatter = {}
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
    const match = content.match(frontmatterRegex)

    if (match) {
      const yamlContent = match[1]
      const lines = yamlContent.split('\n')
      lines.forEach(line => {
        line = line.trim()
        if (line && !line.startsWith('#')) {
          const colonIndex = line.indexOf(':')
          if (colonIndex > -1) {
            let key = line.slice(0, colonIndex).trim()
            let value = line.slice(colonIndex + 1).trim()

            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1)
            }

            if (key === 'title' || key === 'order') {
              if (key === 'order') {
                const numValue = parseInt(value, 10)
                frontmatter[key] = isNaN(numValue) ? 9999 : numValue
              } else {
                frontmatter[key] = value
              }
            }
          }
        }
      })
    }

    return frontmatter
  } catch (error) {
    return {}
  }
}

function readDirectoryConfig(dirPath) {
  const configPath = path.join(dirPath, '.directory.json')

  if (!fs.existsSync(configPath)) {
    return {
      title: generateTitleFromFilename(path.basename(dirPath)),
      order: 9999
    }
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf8')
    const config = JSON.parse(configContent)
    return {
      title: config.title || generateTitleFromFilename(path.basename(dirPath)),
      order: config.order !== undefined ? config.order : 9999
    }
  } catch (error) {
    return {
      title: generateTitleFromFilename(path.basename(dirPath)),
      order: 9999
    }
  }
}

function generateDirectorySidebar(dirPath, baseLink, langCode) {
  const items = getDirectoryItems(dirPath)
  const sidebarItems = []

  const nonIndexFiles = items.files.filter(file =>
      !['index.md', 'README.md'].includes(file.name)
  )

  nonIndexFiles.forEach(file => {
    const frontmatter = readFrontmatter(file.path)
    const link = file.name.replace(/\.(md|markdown)$/, '')

    sidebarItems.push({
      text: frontmatter.title || generateTitleFromFilename(file.name),
      link: baseLink + link,
      order: frontmatter.order
    })
  })

  items.dirs.forEach(dir => {
    const dirConfig = readDirectoryConfig(dir.path)
    const dirLink = baseLink + dir.name + '/'

    const hasIndex = ['index.md', 'README.md'].some(indexFile =>
        fs.existsSync(path.join(dir.path, indexFile))
    )

    const dirChildren = generateDirectorySidebar(dir.path, dirLink, langCode)

    if (dirChildren.length > 0) {
      const sortedChildren = dirChildren.sort((a, b) => {
        const orderA = a.order !== undefined ? a.order : 9999
        const orderB = b.order !== undefined ? b.order : 9999

        if (orderA !== orderB) {
          return orderA - orderB
        }

        return (a.text || '').localeCompare(b.text || '')
      })

      sidebarItems.push({
        text: dirConfig.title,
        order: dirConfig.order,
        items: hasIndex ? [
          {
            text: dirConfig.title,
            link: dirLink,
            order: dirConfig.order
          },
          ...sortedChildren
        ] : sortedChildren
      })
    }
  })

  return sidebarItems.sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 9999
    const orderB = b.order !== undefined ? b.order : 9999

    if (orderA !== orderB) {
      return orderA - orderB
    }

    return (a.text || '').localeCompare(b.text || '')
  })
}

function getDirectoryItems(dirPath) {
  const items = {
    files: [],
    dirs: []
  }

  if (!fs.existsSync(dirPath)) {
    return items
  }

  try {
    const entries = fs.readdirSync(dirPath)

    entries.forEach(entry => {
      if (entry.startsWith('.') || entry === '.directory.json' || entry === 'node_modules') {
        return
      }

      const entryPath = path.join(dirPath, entry)
      const stat = fs.statSync(entryPath)

      if (stat.isDirectory()) {
        items.dirs.push({
          name: entry,
          path: entryPath
        })
      } else if (entry.endsWith('.md') || entry.endsWith('.markdown')) {
        items.files.push({
          name: entry,
          path: entryPath
        })
      }
    })
  } catch (error) {
    console.warn(`Error reading directory ${dirPath}:`, error.message)
  }

  return items
}

function generateSidebarForLanguage(langCode) {
  const lang = languages.find(l => l.code === langCode)
  const docsBasePath = path.join(process.cwd(), 'docs', lang.docsDir)

  if (!fs.existsSync(docsBasePath)) {
    return []
  }

  const rootConfig = readDirectoryConfig(docsBasePath)
  const sidebarItems = []
  const indexFiles = ['index.md', 'README.md']
  let hasIndex = false

  for (const indexFile of indexFiles) {
    const indexPath = path.join(docsBasePath, indexFile)
    if (fs.existsSync(indexPath)) {
      const frontmatter = readFrontmatter(indexPath)
      sidebarItems.push({
        text: frontmatter.title || rootConfig.title || 'Home',
        link: lang.path,
        order: frontmatter.order || 0
      })
      hasIndex = true
      break
    }
  }

  if (!hasIndex) {
    sidebarItems.push({
      text: rootConfig.title || 'Home',
      link: lang.path,
      order: rootConfig.order
    })
  }

  const directoryItems = generateDirectorySidebar(docsBasePath, lang.path, langCode)
  sidebarItems.push(...directoryItems)

  return sidebarItems.sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : 9999
    const orderB = b.order !== undefined ? b.order : 9999

    if (orderA !== orderB) {
      return orderA - orderB
    }

    return (a.text || '').localeCompare(b.text || '')
  })
}

function getText(key, langCode) {
  const texts = {
    outline: {
      en: 'On this page',
      cs: '目录',
      ct: '目錄',
      ja: '目次',
      ko: '목차',
      ru: 'Содержание',
      es: 'En esta página',
      pt: 'Nesta página',
      de: 'Auf dieser Seite',
      fr: 'Sur cette página',
      pl: 'Na tej stronie',
      tr: 'Bu sayfada',
      it: 'In questa pagina'
    },
    prev: {
      en: 'Previous',
      cs: '上一页',
      ct: '上一頁',
      ja: '前へ',
      ko: '이전',
      ru: 'Назад',
      es: 'Anterior',
      pt: 'Anterior',
      de: 'Zurück',
      fr: 'Précédent',
      pl: 'Poprzedni',
      tr: 'Önceki',
      it: 'Precedente'
    },
    next: {
      en: 'Next',
      cs: '下一页',
      ct: '下一頁',
      ja: '次へ',
      ko: '다음',
      ru: 'Вперёд',
      es: 'Siguiente',
      pt: 'Próximo',
      de: 'Weiter',
      fr: 'Suivant',
      pl: 'Następny',
      tr: 'Sonraki',
      it: 'Successivo'
    },
    appearance: {
      en: 'Appearance',
      cs: '外观',
      ct: '外觀',
      ja: '外観',
      ko: '모양',
      ru: 'Внешний вид',
      es: 'Apariencia',
      pt: 'Aparência',
      de: 'Erscheinungsbild',
      fr: 'Apparence',
      pl: 'Wygląd',
      tr: 'Görünüm',
      it: 'Aspetto'
    },
    menu: {
      en: 'Menu',
      cs: '菜单',
      ct: '選單',
      ja: 'メニュー',
      ko: '메뉴',
      ru: 'Меню',
      es: 'Menú',
      pt: 'Menu',
      de: 'Menü',
      fr: 'Menu',
      pl: 'Menu',
      tr: 'Menü',
      it: 'Menu'
    },
    last_updated: {
      en: 'Last updated',
      cs: '最后更新',
      ct: '最後更新',
      ja: '最終更新',
      ko: '마지막 업데이트',
      ru: 'Последнее обновление',
      es: 'Última actualización',
      pt: 'Última atualização',
      de: 'Letzte Aktualisierung',
      fr: 'Dernière mise à jour',
      pl: 'Ostatnia aktualizacja',
      tr: 'Son güncelleme',
      it: 'Ultimo aggiornamento'
    },
    edit_page: {
      en: 'Edit this page',
      cs: '编辑此页面',
      ct: '編輯此頁面',
      ja: 'このページを編集',
      ko: '이页面编辑',
      ru: 'Редактировать эту страницу',
      es: 'Editar esta página',
      pt: 'Editar esta página',
      de: 'Diese Seite bearbeiten',
      fr: 'Modifier cette page',
      pl: 'Edytuj tę stronę',
      tr: 'Bu sayfayı düzenle',
      it: 'Modifica questa pagina'
    },
    search_placeholder: {
      en: 'Search documentation...',
      cs: '搜索文档...',
      ct: '搜尋文件...',
      ja: 'ドキュメントを検索...',
      ko: '문서 검색...',
      ru: 'Поиск по документации...',
      es: 'Buscar documentación...',
      pt: 'Pesquisar documentação...',
      de: 'Dokumentation durchsuchen...',
      fr: 'Rechercher dans la documentation...',
      pl: 'Szukaj w dokumentacji...',
      tr: 'Belgelerde ara...',
      it: 'Cerca nella documentazione...'
    }
  }

  return texts[key]?.[langCode] || texts[key]?.en || key
}

function generateLocalesConfig() {
  const locales = {}

  languages.forEach(lang => {
    const config = languageConfigs[lang.code]

    const sidebarForLang = generateSidebarForLanguage(lang.code)

    if (lang.code === 'en') {
      locales.root = {
        label: lang.label,
        lang: lang.lang,
        dir: lang.dir,
        title: config.title,
        description: config.description,
        themeConfig: {
          nav: [],
          sidebar: sidebarForLang,
          outline: {
            label: getText('outline', lang.code)
          },
          docFooter: {
            prev: getText('prev', lang.code),
            next: getText('next', lang.code)
          },
          darkModeSwitchLabel: getText('appearance', lang.code),
          sidebarMenuLabel: getText('menu', lang.code),
          lastUpdatedText: getText('last_updated', lang.code),
          editLink: {
            pattern: 'https://github.com/GongSunFangYun/TheMusket_Docs/edit/main/docs/:path',
            text: getText('edit_page', lang.code)
          }
        }
      }
    } else {
      const localeKey = lang.path.slice(1, -1)

      locales[localeKey] = {
        label: lang.label,
        lang: lang.lang,
        dir: lang.dir,
        title: config.title,
        description: config.description,
        themeConfig: {
          nav: [],
          sidebar: sidebarForLang,
          outline: {
            label: getText('outline', lang.code)
          },
          docFooter: {
            prev: getText('prev', lang.code),
            next: getText('next', lang.code)
          },
          darkModeSwitchLabel: getText('appearance', lang.code),
          sidebarMenuLabel: getText('menu', lang.code),
          lastUpdatedText: getText('last_updated', lang.code),
          editLink: {
            pattern: 'https://github.com/GongSunFangYun/TheMusket_Docs/edit/main/docs/:path',
            text: getText('edit_page', lang.code)
          }
        }
      }
    }
  })

  return locales
}

export default defineConfig({
  base: '/',
  title: 'Documentation',
  description: 'Multi-language documentation',
  lang: 'en-US',

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,
  i18nRouting: true,

  locales: generateLocalesConfig(),

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: false,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/username/reponame' },
    ],

    search: {
      provider: 'local',
      options: {
        locales: languages.reduce((acc, lang) => {
          const localeKey = lang.code === 'en' ? '/' : lang.path.slice(1, -1)
          acc[localeKey] = {
            placeholder: getText('search_placeholder', lang.code)
          }
          return acc
        }, {})
      },
    },

    localeLinks: {
      items: languages.map(lang => ({
        text: lang.label,
        link: lang.path
      }))
    }
  },

  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },

  build: {
    outDir: '../dist',
    emptyOutDir: true
  },

  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../../'),
        '@localization': path.resolve(__dirname, '../docs/localization')
      }
    },
    base: './'
  },

  head: [
    ['meta', { charset: 'utf-8' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['link', { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }],
    ...languages.map(lang => [
      'link',
      {
        rel: 'alternate',
        hreflang: lang.lang,
        href: lang.path
      }
    ])
  ]
})