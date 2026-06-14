# edu — учебная база знаний

Открытая база знаний по инженерным темам. Каждая тема оформлена как самостоятельный курс из
последовательных разделов: от понятийной базы до низкоуровневых механизмов и практики.

🔗 **Сайт:** https://rmv0x11.github.io/edu/

Первый курс — **[Виртуализация](https://rmv0x11.github.io/edu/virtualization/)** (10 разделов).

## Стек

- [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/) — генератор
  документации с поиском, тёмной темой и навигацией из коробки.
- [astro-mermaid](https://www.npmjs.com/package/astro-mermaid) — диаграммы
  [Mermaid](https://mermaid.js.org/) с клиентским рендером и переключением темы.
- Деплой на **GitHub Pages** через GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

## Локальная разработка

```bash
npm install        # установка зависимостей
npm run dev        # http://localhost:4321/edu
npm run build      # сборка в ./dist
npm run preview    # предпросмотр собранного сайта
```

> Сайт собирается с `base: '/edu'`, поэтому локально он доступен по адресу
> `http://localhost:4321/edu`.

## Структура

```
src/content/docs/
├─ index.mdx              # лендинг
├─ roadmap.md             # дорожная карта тем
└─ virtualization/        # курс «Виртуализация»
   ├─ index.md            # обзор курса
   ├─ intro.md            # 1. Введение и история
   ├─ hypervisors.md      # 2. Гипервизоры Type-1/2
   ├─ cpu.md              # 3. Виртуализация CPU
   ├─ memory.md           # 4. Виртуализация памяти
   ├─ io.md               # 5. Виртуализация ввода-вывода
   ├─ paravirtualization.md  # 6. Паравиртуализация
   ├─ containers-vs-vm.md    # 7. Контейнеры vs VM
   ├─ kvm-qemu.md         # 8. KVM/QEMU на практике
   ├─ platforms.md        # 9. Обзор платформ
   └─ glossary.md         # 10. Глоссарий и ссылки
```

## Как добавить тему

1. Создайте папку в `src/content/docs/<тема>/`.
2. Добавьте Markdown-файлы с frontmatter (`title`, `description`, `sidebar.order`).
3. Пропишите раздел в `sidebar` в [`astro.config.mjs`](astro.config.mjs).
4. Запушьте в `main` — GitHub Actions соберёт и опубликует сайт.

## Лицензия

Учебные материалы — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Код сборки — MIT.
