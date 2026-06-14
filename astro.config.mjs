// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

const BASE = '/edu';

/**
 * Rehype-плагин: добавляет префикс base ко всем корневым ссылкам (`/...`) в
 * контенте. Astro/Starlight НЕ префиксует ссылки, написанные руками в Markdown
 * (в отличие от слагов в sidebar), поэтому на GitHub Pages под `/edu/` они бы
 * вели в корень и ломались. Плагин чинит это автоматически, чтобы в материалах
 * можно было писать естественные ссылки вида `/virtualization/cpu/`.
 * @param {{ base: string }} options
 */
function rehypeBasePrefix({ base }) {
	const prefix = base.endsWith('/') ? base.slice(0, -1) : base;
	/** @param {any} node */
	function walk(node) {
		if (!node || typeof node !== 'object') return;
		if (node.type === 'element' && node.properties) {
			for (const attr of ['href', 'src']) {
				const val = node.properties[attr];
				if (
					typeof val === 'string' &&
					val.startsWith('/') &&
					!val.startsWith('//') &&
					val !== prefix &&
					!val.startsWith(prefix + '/')
				) {
					node.properties[attr] = prefix + val;
				}
			}
		}
		if (Array.isArray(node.children)) for (const child of node.children) walk(child);
	}
	return (/** @type {any} */ tree) => walk(tree);
}

// Сайт публикуется на GitHub Pages: https://rmv0x11.github.io/edu/
// site + base обязательны, чтобы корректно строились абсолютные ссылки и ассеты.
// https://astro.build/config
export default defineConfig({
	site: 'https://rmv0x11.github.io',
	base: BASE,
	markdown: {
		rehypePlugins: [[rehypeBasePrefix, { base: BASE }]],
	},
	integrations: [
		// astro-mermaid ОБЯЗАТЕЛЬНО до starlight() — иначе Starlight перехватит
		// обработку markdown и mermaid-блоки не преобразуются.
		mermaid({
			theme: 'default',
			autoTheme: true, // переключение default/dark вслед за темой Starlight
			mermaidConfig: {
				flowchart: { curve: 'basis' },
			},
		}),
		starlight({
			title: 'edu — база знаний',
			description:
				'Учебная база знаний по инженерным темам: глубоко, с диаграммами и практикой. Первый курс — виртуализация.',
			defaultLocale: 'root',
			locales: {
				root: { label: 'Русский', lang: 'ru' },
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/rmv0x11/edu',
				},
			],
			editLink: {
				baseUrl: 'https://github.com/rmv0x11/edu/edit/main/',
			},
			lastUpdated: true,
			customCss: ['./src/styles/custom.css'],
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			sidebar: [
				{
					label: 'Виртуализация',
					items: [
						{ label: 'Обзор курса', slug: 'virtualization' },
						{ label: '1. Введение и история', slug: 'virtualization/intro' },
						{ label: '2. Гипервизоры: Type-1 и Type-2', slug: 'virtualization/hypervisors' },
						{ label: '3. Виртуализация CPU', slug: 'virtualization/cpu' },
						{ label: '4. Виртуализация памяти', slug: 'virtualization/memory' },
						{ label: '5. Виртуализация ввода-вывода', slug: 'virtualization/io' },
						{ label: '6. Паравиртуализация', slug: 'virtualization/paravirtualization' },
						{ label: '7. Контейнеры vs виртуальные машины', slug: 'virtualization/containers-vs-vm' },
						{ label: '8. KVM/QEMU на практике', slug: 'virtualization/kvm-qemu' },
						{ label: '9. Обзор платформ', slug: 'virtualization/platforms' },
						{ label: '10. Глоссарий и ссылки', slug: 'virtualization/glossary' },
					],
				},
				{
					label: 'О проекте',
					items: [{ label: 'Дорожная карта тем', slug: 'roadmap' }],
				},
			],
		}),
	],
});
