// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import { glossary } from './src/data/glossary.js';

const BASE = '/edu';

/**
 * Rehype-плагин: оборачивает вхождения известных аббревиатур/терминов из словаря
 * (src/data/glossary.js) в <abbr class="glossary-term" data-term="...">, чтобы по
 * наведению/клику показывать всплывающую карточку «Что это?» (скрипт в Header.astro).
 * Пропускает код, ссылки, заголовки и страницы-глоссарии.
 */
function rehypeGlossary() {
	const escape = (/** @type {string} */ s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const terms = glossary.map((g) => g.term).sort((a, b) => b.length - a.length);
	const pattern = terms.map(escape).join('|');
	// Границы слова с поддержкой Unicode (чтобы корректно ловить и латиницу, и кириллицу).
	const re = new RegExp('(?<![\\p{L}\\p{N}-])(' + pattern + ')(?![\\p{L}\\p{N}-])', 'gu');
	const SKIP = new Set(['code', 'pre', 'a', 'abbr', 'script', 'style', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

	/** @param {string} value */
	function splitText(value) {
		re.lastIndex = 0;
		let m;
		let last = 0;
		let out = null;
		while ((m = re.exec(value)) !== null) {
			if (!out) out = [];
			if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) });
			out.push({
				type: 'element',
				tagName: 'abbr',
				properties: { className: ['glossary-term'], dataTerm: m[1], tabIndex: 0 },
				children: [{ type: 'text', value: m[1] }],
			});
			last = m.index + m[1].length;
		}
		if (out && last < value.length) out.push({ type: 'text', value: value.slice(last) });
		return out;
	}

	/** @param {any} node */
	function walk(node) {
		if (node.type === 'element' && SKIP.has(node.tagName)) return;
		const children = node.children;
		if (!Array.isArray(children)) return;
		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (child.type === 'text') {
				const replaced = splitText(child.value);
				if (replaced) {
					children.splice(i, 1, ...replaced);
					i += replaced.length - 1;
				}
			} else if (child.type === 'element') {
				walk(child);
			}
		}
	}

	return (/** @type {any} */ tree, /** @type {any} */ file) => {
		const p = (file && (file.path || (file.history && file.history[0]))) || '';
		if (typeof p === 'string' && p.includes('glossary')) return;
		walk(tree);
	};
}

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
		rehypePlugins: [[rehypeBasePrefix, { base: BASE }], rehypeGlossary],
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
			components: {
				// Шапка с кнопками сворачивания левой/правой панели
				Header: './src/components/Header.astro',
			},
			head: [
				{
					// Применяем сохранённое состояние панелей до отрисовки (без мигания)
					tag: 'script',
					content:
						"try{var d=document.documentElement;if(localStorage.getItem('edu:hide-left')==='1')d.setAttribute('data-user-hide-left','');if(localStorage.getItem('edu:hide-right')==='1')d.setAttribute('data-user-hide-right','');}catch(e){}",
				},
			],
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
					label: 'Контейнеризация',
					items: [
						{ label: 'Обзор курса', slug: 'containerization' },
						{ label: '1. Введение и история', slug: 'containerization/intro' },
						{ label: '2. Namespaces', slug: 'containerization/namespaces' },
						{ label: '3. Control groups (cgroups)', slug: 'containerization/cgroups' },
						{ label: '4. Образы и слои', slug: 'containerization/images' },
						{ label: '5. OCI и среды выполнения', slug: 'containerization/runtimes' },
						{ label: '6. Docker на практике', slug: 'containerization/docker' },
						{ label: '7. Сеть контейнеров', slug: 'containerization/networking' },
						{ label: '8. Хранение данных', slug: 'containerization/storage' },
						{ label: '9. Безопасность контейнеров', slug: 'containerization/security' },
						{ label: '10. Оркестрация и Kubernetes', slug: 'containerization/orchestration' },
						{ label: '11. Глоссарий и ссылки', slug: 'containerization/glossary' },
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
