import { defineConfig } from 'vitepress'
import path from 'path'
import fs from 'fs'

const languages = [
  { code: 'en', label: 'English', lang: 'en-US', dir: 'ltr', path: '/', docsDir: '' },
  { code: 'cs', label: '简体中文', lang: 'zh-CN', dir: 'ltr', path: '/lang/cs/', docsDir: 'lang/cs' },
  { code: 'ct', label: '繁體中文', lang: 'zh-TW', dir: 'ltr', path: '/lang/ct/', docsDir: 'lang/ct' },
  { code: 'ja', label: '日本語', lang: 'ja-JP', dir: 'ltr', path: '/lang/ja/', docsDir: 'lang/ja' },
  { code: 'ko', label: '한국어', lang: 'ko-KR', dir: 'ltr', path: '/lang/ko/', docsDir: 'lang/ko' },
  { code: 'ru', label: 'Русский', lang: 'ru-RU', dir: 'ltr', path: '/lang/ru/', docsDir: 'lang/ru' },
  { code: 'es', label: 'Español', lang: 'es-ES', dir: 'ltr', path: '/lang/es/', docsDir: 'lang/es' },
  { code: 'pt', label: 'Português', lang: 'pt-BR', dir: 'ltr', path: '/lang/pt/', docsDir: 'lang/pt' },
  { code: 'de', label: 'Deutsch', lang: 'de-DE', dir: 'ltr', path: '/lang/de/', docsDir: 'lang/de' },
  { code: 'fr', label: 'Français', lang: 'fr-FR', dir: 'ltr', path: '/lang/fr/', docsDir: 'lang/fr' },
  { code: 'pl', label: 'Polski', lang: 'pl-PL', dir: 'ltr', path: '/lang/pl/', docsDir: 'lang/pl' },
  { code: 'tr', label: 'Türkçe', lang: 'tr-TR', dir: 'ltr', path: '/lang/tr/', docsDir: 'lang/tr' },
  { code: 'it', label: 'Italiano', lang: 'it-IT', dir: 'ltr', path: '/lang/it/', docsDir: 'lang/it' }
]

const languageConfigs = {
  en: {
    title: 'Documentation'
  },
  cs: {
    title: '文档中心'
  },
  ct: {
    title: '文檔中心'
  },
  ja: {
    title: 'ドキュメント'
  },
  ko: {
    title: '문서'
  },
  ru: {
    title: 'Документация'
  },
  es: {
    title: 'Documentación'
  },
  pt: {
    title: 'Documentação'
  },
  de: {
    title: 'Dokumentation'
  },
  fr: {
    title: 'Documentation'
  },
  pl: {
    title: 'Dokumentacja'
  },
  tr: {
    title: 'Dokümantasyon'
  },
  it: {
    title: 'Documentazione'
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
      cs: '页面概要',
      ct: '頁面概要',
      ja: 'ページ概要',
      ko: '페이지 요약',
      ru: 'Обзор страницы',
      es: 'Resumen de la página',
      pt: 'Resumo da página',
      de: 'Seitenübersicht',
      fr: 'Aperçu de la page',
      pl: 'Podsumowanie strony',
      tr: 'Sayfa özeti',
      it: 'Riepilogo della pagina'
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
      { icon: 'github', link: 'https://github.com/GongSunFangYun/TheMusketDocs' },
      { icon: 'bilibili', link: 'https://space.bilibili.com/1289389911' },
      { icon: 'youtube', link: 'https://www.youtube.com/@GongSunFangYun' },
      { icon: 'discord', link: 'https://discord.gg/SkAwxCg3v5'},
      { icon: 'qq', link: 'https://qm.qq.com/q/btHxAXxlbW' },
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
        '@lang': path.resolve(__dirname, '../docs/lang')
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