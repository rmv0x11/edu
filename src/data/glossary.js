// Единый словарь аббревиатур и терминов для всплывающих подсказок «Что это?».
// Используется и на сборке (rehype-плагин в astro.config.mjs оборачивает вхождения
// в <abbr class="glossary-term" data-term="...">), и на клиенте (скрипт в Header.astro
// строит карточку по data-term). Один источник правды.
//
// term — точное написание, которое ищется в тексте (с учётом регистра и границ слова);
// def  — краткое определение (1–2 предложения).

export const glossary = [
	// --- Общее железо и ОС ---
	{ term: 'CPU', def: 'Центральный процессор — устройство, выполняющее инструкции программ.' },
	{ term: 'RAM', def: 'Оперативная память — быстрая энергозависимая память для кода и данных работающих программ.' },
	{ term: 'SSD', def: 'Твердотельный накопитель — энергонезависимое хранилище на флеш-памяти.' },
	{ term: 'NIC', def: 'Сетевая карта (Network Interface Card) — устройство для подключения к сети.' },
	{ term: 'DMA', def: 'Прямой доступ к памяти — обмен данными между устройством и памятью без участия CPU.' },
	{ term: 'MMIO', def: 'Memory-Mapped I/O — доступ к регистрам устройств через адресное пространство памяти.' },
	{ term: 'NUMA', def: 'Неоднородный доступ к памяти — архитектура, где время доступа к памяти зависит от того, к какому узлу она относится.' },
	{ term: 'ОС', def: 'Операционная система — ПО, управляющее ресурсами компьютера и выполнением программ.' },
	{ term: 'BIOS', def: 'Базовая система ввода-вывода — прошивка для инициализации оборудования при старте.' },
	{ term: 'UEFI', def: 'Современная замена BIOS — прошивка инициализации и загрузки системы.' },

	// --- Виртуализация ---
	{ term: 'ВМ', def: 'Виртуальная машина — изолированное окружение с собственной гостевой ОС, работающее под управлением гипервизора.' },
	{ term: 'VMM', def: 'Virtual Machine Monitor (монитор виртуальных машин) — другое название гипервизора.' },
	{ term: 'VDI', def: 'Virtual Desktop Infrastructure — десктопная виртуализация: рабочие столы выполняются на сервере.' },
	{ term: 'VT-x', def: 'Аппаратное расширение виртуализации Intel (режимы VMX root и non-root).' },
	{ term: 'AMD-V', def: 'Аппаратное расширение виртуализации AMD (технология SVM).' },
	{ term: 'VMX', def: 'Virtual Machine Extensions — набор инструкций и режимов Intel для виртуализации.' },
	{ term: 'SVM', def: 'Secure Virtual Machine — набор инструкций аппаратной виртуализации AMD.' },
	{ term: 'VMCS', def: 'Virtual Machine Control Structure — структура в памяти с состоянием гостя/хоста и настройками перехватов (Intel).' },
	{ term: 'VMCB', def: 'Virtual Machine Control Block — структура управления виртуальной машиной в AMD-V (аналог VMCS).' },
	{ term: 'EPT', def: 'Extended Page Tables — аппаратная вложенная трансляция памяти у Intel.' },
	{ term: 'NPT', def: 'Nested Page Tables — аппаратная вложенная трансляция памяти у AMD (также RVI).' },
	{ term: 'TLB', def: 'Translation Lookaside Buffer — кэш недавних трансляций виртуальных адресов в физические.' },
	{ term: 'VPID', def: 'Virtual Processor ID — тег записей TLB по виртуальному процессору (Intel), позволяет не сбрасывать TLB при переключении ВМ.' },
	{ term: 'ASID', def: 'Address Space ID — тег записей TLB по адресному пространству (AMD).' },
	{ term: 'KSM', def: 'Kernel Same-page Merging — дедупликация одинаковых страниц памяти в Linux.' },
	{ term: 'IOMMU', def: 'Input-Output Memory Management Unit — блок трансляции адресов и изоляции DMA для устройств.' },
	{ term: 'VT-d', def: 'Реализация IOMMU у Intel — безопасный проброс устройств в ВМ.' },
	{ term: 'SR-IOV', def: 'Single Root I/O Virtualization — аппаратное разделение одного PCIe-устройства на множество виртуальных функций.' },
	{ term: 'PF', def: 'Physical Function — управляющая функция устройства SR-IOV, видит всё устройство целиком.' },
	{ term: 'VF', def: 'Virtual Function — облегчённая виртуальная функция устройства SR-IOV, пробрасывается в ВМ.' },
	{ term: 'KVM', def: 'Kernel-based Virtual Machine — модуль ядра Linux, превращающий его в гипервизор на базе VT-x/AMD-V.' },
	{ term: 'QEMU', def: 'Эмулятор машин и устройств; в паре с KVM обеспечивает полноценную виртуализацию.' },
	{ term: 'virtio', def: 'Стандарт паравиртуальных устройств (virtio-net, virtio-blk и др.) с моделью frontend/backend.' },
	{ term: 'ESXi', def: 'Гипервизор Type-1 от VMware, основа платформы vSphere.' },
	{ term: 'DPDK', def: 'Data Plane Development Kit — набор библиотек для быстрой сетевой обработки в пространстве пользователя.' },
	{ term: 'GVA', def: 'Guest Virtual Address — гостевой виртуальный адрес.' },
	{ term: 'GPA', def: 'Guest Physical Address — гостевой физический адрес.' },
	{ term: 'HPA', def: 'Host Physical Address — машинный (хостовый) физический адрес.' },
	{ term: 'vCPU', def: 'Виртуальный процессор, выделяемый виртуальной машине; планируется гипервизором на физические ядра.' },

	// --- Хранилище и сеть ---
	{ term: 'RAID', def: 'Объединение нескольких дисков в массив ради надёжности и/или производительности.' },
	{ term: 'LVM', def: 'Logical Volume Manager — менеджер логических томов в Linux.' },
	{ term: 'SAN', def: 'Storage Area Network — выделенная сеть блочного хранилища.' },
	{ term: 'SDN', def: 'Software-Defined Networking — программно-определяемые сети.' },
	{ term: 'VLAN', def: 'Virtual LAN — логическое разделение одной физической сети на изолированные сегменты.' },
	{ term: 'VXLAN', def: 'Туннелирование кадров L2 поверх сети L3 — основа overlay-сетей между узлами.' },
	{ term: 'NAT', def: 'Network Address Translation — трансляция сетевых адресов (например, выход контейнеров в интернет через адрес хоста).' },
	{ term: 'DNS', def: 'Domain Name System — система разрешения имён в IP-адреса.' },
	{ term: 'TLS', def: 'Transport Layer Security — протокол шифрования и аутентификации соединений.' },
	{ term: 'veth', def: 'Virtual Ethernet — пара виртуальных интерфейсов-«кабель», соединяющая сетевой namespace контейнера с хостом.' },

	// --- Контейнеры и оркестрация ---
	{ term: 'OCI', def: 'Open Container Initiative — стандарты формата образов, среды выполнения и реестра контейнеров.' },
	{ term: 'CRI', def: 'Container Runtime Interface — интерфейс, через который Kubernetes общается со средой выполнения.' },
	{ term: 'CNI', def: 'Container Network Interface — стандарт сетевых плагинов для контейнеров и Kubernetes.' },
	{ term: 'CSI', def: 'Container Storage Interface — стандарт плагинов хранения для Kubernetes.' },
	{ term: 'cgroups', def: 'Control groups — механизм ядра Linux для ограничения и учёта ресурсов групп процессов.' },
	{ term: 'OverlayFS', def: 'Объединённая (overlay) файловая система: слои lowerdir/upperdir/merged с copy-on-write.' },
	{ term: 'CoW', def: 'Copy-on-write — копирование данных только при записи; основа слоёв образов и снапшотов.' },
	{ term: 'LXC', def: 'Linux Containers — ранняя система контейнеров на namespaces и cgroups.' },
	{ term: 'runc', def: 'Эталонная низкоуровневая среда выполнения OCI: создаёт namespaces/cgroups и запускает процесс контейнера.' },
	{ term: 'containerd', def: 'Высокоуровневая среда выполнения контейнеров: управляет образами и жизненным циклом, вызывает runc.' },
	{ term: 'OOM', def: 'Out Of Memory — нехватка памяти; OOM killer завершает процессы при её исчерпании.' },
	{ term: 'PID', def: 'Process ID — числовой идентификатор процесса в системе.' },
	{ term: 'UTS', def: 'Unix Timesharing System — namespace, изолирующий hostname и domainname.' },
	{ term: 'IPC', def: 'Inter-Process Communication — межпроцессное взаимодействие (очереди, семафоры, разделяемая память).' },

	// --- Общая разработка ---
	{ term: 'API', def: 'Application Programming Interface — программный интерфейс взаимодействия с системой или сервисом.' },
	{ term: 'CLI', def: 'Command-Line Interface — интерфейс командной строки.' },
	{ term: 'YAML', def: 'Человекочитаемый формат сериализации данных, широко используемый в конфигурации (например, в Kubernetes).' },
	{ term: 'HA', def: 'High Availability — высокая доступность: устойчивость сервиса к отказам.' },
];
