export default {
  // Установим базовый путь для GitHub Pages
  base: '/warframe', // ⚠️ Не забудьте заменить!

  // Язык по умолчанию для всего сайта (если не найдена локаль)
  lang: 'ru-RU',
  title: 'Warframe База Знаний',
  description: 'Двуязычная база данных по Warframe',

  // --------------------------------------------------------
  // КОНФИГУРАЦИЯ ЛОКАЛЕЙ (ДВУХ ЯЗЫКОВ)
  // --------------------------------------------------------
  locales: {
    // 1. Русский язык (будет основным, URL: /)
    root: {
      label: 'Русский',
      lang: 'ru-RU',
      title: 'Warframe База Знаний',
      description:
        'Неофициальная база данных и гайды по Warframe. От новичка до мастера.',
      themeConfig: {
        nav: [
          { text: 'Главная', link: '/ru/' }, // Ссылка на русскую главную
          { text: 'Гайды', link: '/ru/guide/getting-started' },
          { text: 'Warframe', link: '/ru/frames/index' },
        ],
        sidebar: [
          {
            text: 'Начало (База)',
            collapsed: false,
            items: [
              { text: 'Введение и Начало', link: '/ru/guide/getting-started' },
              { text: 'Основные Ресурсы', link: '/ru/guide/basic-resources' },
            ],
          },
          {
            text: 'Фреймы и Билды (Среднее)',
            collapsed: true,
            items: [
              { text: 'Каталог Warframe', link: '/ru/frames/index' },
              { text: 'Популярные Билды', link: '/ru/frames/popular-builds' },
            ],
          },
          // ... Добавьте другие русские разделы по аналогии
        ],
        footer: {
          message: 'Создано с помощью VitePress',
          copyright: 'Неофициальный фан-сайт Warframe',
        },
      },
    },

    // 2. Английский язык (URL: /en/)
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'Warframe Knowledge Base',
      description:
        'Unofficial Warframe database and guides. From beginner to master.',
      themeConfig: {
        // Заголовок для переключателя языка
        i18nRouting: true,

        nav: [
          { text: 'Home', link: '/en/' }, // Ссылка на английскую главную
          { text: 'Guides', link: '/en/guide/getting-started' },
          { text: 'Warframe', link: '/en/frames/index' },
        ],
        sidebar: [
          {
            text: 'Starting (Base)',
            collapsed: false,
            items: [
              {
                text: 'Introduction and Start',
                link: '/en/guide/getting-started',
              },
              { text: 'Basic Resources', link: '/en/guide/basic-resources' },
            ],
          },
          {
            text: 'Frames and Builds (Intermediate)',
            collapsed: true,
            items: [
              { text: 'Warframe Catalog', link: '/en/frames/index' },
              { text: 'Popular Builds', link: '/en/frames/popular-builds' },
            ],
          },
          // ... Добавьте другие английские разделы по аналогии
        ],
        footer: {
          message: 'Built with VitePress',
          copyright: 'Unofficial Warframe Fan Site',
        },
      },
    },
  },
};


