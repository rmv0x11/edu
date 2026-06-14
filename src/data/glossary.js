// Единый словарь аббревиатур и терминов для всплывающих подсказок «Что это?».
// Используется и на сборке (rehype-плагин в astro.config.mjs оборачивает ПЕРВОЕ вхождение
// термина на странице в <abbr class="glossary-term" data-term="...">), и на клиенте
// (скрипт в Header.astro строит карточку по data-term). Один источник правды.
//
// Поля:
//   term — точное написание, которое ищется в тексте (с учётом регистра и границ слова);
//   full — полная расшифровка букв аббревиатуры на языке оригинала (или развёрнутое имя);
//          пустая строка, если расшифровывать нечего (собственное имя);
//   def  — перевод на русский и краткое пояснение, что это такое.

export const glossary = [
	// --- Общее железо и ОС ---
	{ term: 'CPU', full: 'Central Processing Unit', def: 'центральный процессор; выполняет инструкции программ.' },
	{ term: 'RAM', full: 'Random Access Memory', def: 'оперативная память; быстрая энергозависимая память для кода и данных работающих программ.' },
	{ term: 'SSD', full: 'Solid-State Drive', def: 'твердотельный накопитель; энергонезависимое хранилище на флеш-памяти.' },
	{ term: 'NIC', full: 'Network Interface Card', def: 'сетевая карта; устройство для подключения к сети.' },
	{ term: 'DMA', full: 'Direct Memory Access', def: 'прямой доступ к памяти; обмен данными между устройством и памятью без участия CPU.' },
	{ term: 'MMIO', full: 'Memory-Mapped I/O', def: 'память-отображённый ввод-вывод; доступ к регистрам устройств через адресное пространство памяти.' },
	{ term: 'NUMA', full: 'Non-Uniform Memory Access', def: 'неоднородный доступ к памяти; время доступа зависит от узла, которому принадлежит память.' },
	{ term: 'ОС', full: 'операционная система', def: 'управляет ресурсами компьютера и выполнением программ.' },
	{ term: 'BIOS', full: 'Basic Input/Output System', def: 'базовая система ввода-вывода; прошивка инициализации оборудования при старте.' },
	{ term: 'UEFI', full: 'Unified Extensible Firmware Interface', def: 'современная замена BIOS; прошивка инициализации и загрузки системы.' },

	// --- Виртуализация ---
	{ term: 'ВМ', full: 'виртуальная машина', def: 'изолированное окружение с собственной гостевой ОС под управлением гипервизора.' },
	{ term: 'VMM', full: 'Virtual Machine Monitor', def: 'монитор виртуальных машин; другое название гипервизора.' },
	{ term: 'VDI', full: 'Virtual Desktop Infrastructure', def: 'инфраструктура виртуальных рабочих столов; рабочие столы выполняются на сервере.' },
	{ term: 'VT-x', full: 'Intel Virtualization Technology', def: 'аппаратное расширение виртуализации Intel; режимы VMX root и non-root.' },
	{ term: 'AMD-V', full: 'AMD Virtualization', def: 'аппаратное расширение виртуализации AMD (технология SVM).' },
	{ term: 'VMX', full: 'Virtual Machine Extensions', def: 'набор инструкций и режимов Intel для виртуализации.' },
	{ term: 'SVM', full: 'Secure Virtual Machine (AMD) / Support Vector Machine (ML)', def: 'в контексте процессоров — аппаратная виртуализация AMD; в машинном обучении — метод опорных векторов.' },
	{ term: 'VMCS', full: 'Virtual Machine Control Structure', def: 'структура в памяти с состоянием гостя и хоста и настройками перехватов (Intel).' },
	{ term: 'VMCB', full: 'Virtual Machine Control Block', def: 'структура управления виртуальной машиной в AMD-V (аналог VMCS).' },
	{ term: 'EPT', full: 'Extended Page Tables', def: 'расширенные таблицы страниц; аппаратная вложенная трансляция памяти у Intel.' },
	{ term: 'NPT', full: 'Nested Page Tables', def: 'вложенные таблицы страниц; аппаратная трансляция памяти у AMD (также RVI).' },
	{ term: 'TLB', full: 'Translation Lookaside Buffer', def: 'буфер трансляции; кэш недавних переводов виртуальных адресов в физические.' },
	{ term: 'VPID', full: 'Virtual Processor Identifier', def: 'тег записей TLB по виртуальному процессору (Intel); позволяет не сбрасывать TLB при переключении ВМ.' },
	{ term: 'ASID', full: 'Address Space Identifier', def: 'тег записей TLB по адресному пространству (AMD).' },
	{ term: 'KSM', full: 'Kernel Same-page Merging', def: 'дедупликация одинаковых страниц памяти в ядре Linux.' },
	{ term: 'IOMMU', full: 'Input/Output Memory Management Unit', def: 'блок трансляции адресов и изоляции DMA для устройств.' },
	{ term: 'VT-d', full: 'Intel Virtualization Technology for Directed I/O', def: 'реализация IOMMU у Intel; безопасный проброс устройств в ВМ.' },
	{ term: 'SR-IOV', full: 'Single Root I/O Virtualization', def: 'аппаратное разделение одного PCIe-устройства на множество виртуальных функций.' },
	{ term: 'PF', full: 'Physical Function', def: 'управляющая функция устройства SR-IOV; видит всё устройство целиком.' },
	{ term: 'VF', full: 'Virtual Function', def: 'облегчённая виртуальная функция устройства SR-IOV; пробрасывается в ВМ.' },
	{ term: 'KVM', full: 'Kernel-based Virtual Machine', def: 'модуль ядра Linux, превращающий его в гипервизор на базе VT-x/AMD-V.' },
	{ term: 'QEMU', full: 'Quick Emulator', def: 'эмулятор машин и устройств; в паре с KVM даёт полноценную виртуализацию.' },
	{ term: 'virtio', full: 'virtual I/O', def: 'стандарт паравиртуальных устройств с моделью frontend и backend.' },
	{ term: 'ESXi', full: '', def: 'гипервизор Type-1 от VMware, основа платформы vSphere.' },
	{ term: 'DPDK', full: 'Data Plane Development Kit', def: 'библиотеки для быстрой сетевой обработки в пространстве пользователя.' },
	{ term: 'GVA', full: 'Guest Virtual Address', def: 'гостевой виртуальный адрес.' },
	{ term: 'GPA', full: 'Guest Physical Address', def: 'гостевой физический адрес.' },
	{ term: 'HPA', full: 'Host Physical Address', def: 'машинный (хостовый) физический адрес.' },
	{ term: 'vCPU', full: 'virtual CPU', def: 'виртуальный процессор ВМ; планируется гипервизором на физические ядра.' },

	// --- Хранилище и сеть ---
	{ term: 'RAID', full: 'Redundant Array of Independent Disks', def: 'избыточный массив независимых дисков; объединяет диски ради надёжности и/или производительности.' },
	{ term: 'LVM', full: 'Logical Volume Manager', def: 'менеджер логических томов в Linux.' },
	{ term: 'SAN', full: 'Storage Area Network', def: 'выделенная сеть блочного хранилища.' },
	{ term: 'SDN', full: 'Software-Defined Networking', def: 'программно-определяемые сети.' },
	{ term: 'VLAN', full: 'Virtual Local Area Network', def: 'логическое разделение одной физической сети на изолированные сегменты.' },
	{ term: 'VXLAN', full: 'Virtual Extensible LAN', def: 'туннелирование кадров L2 поверх сети L3; основа overlay-сетей между узлами.' },
	{ term: 'NAT', full: 'Network Address Translation', def: 'трансляция сетевых адресов; например, выход контейнеров наружу через адрес хоста.' },
	{ term: 'DNS', full: 'Domain Name System', def: 'система разрешения имён в IP-адреса.' },
	{ term: 'TLS', full: 'Transport Layer Security', def: 'протокол шифрования и аутентификации соединений.' },
	{ term: 'veth', full: 'virtual Ethernet', def: 'пара виртуальных интерфейсов-«кабель» между сетевым namespace контейнера и хостом.' },

	// --- Контейнеры и оркестрация ---
	{ term: 'OCI', full: 'Open Container Initiative', def: 'стандарты формата образов, среды выполнения и реестра контейнеров.' },
	{ term: 'CRI', full: 'Container Runtime Interface', def: 'интерфейс, через который Kubernetes общается со средой выполнения.' },
	{ term: 'CNI', full: 'Container Network Interface', def: 'стандарт сетевых плагинов для контейнеров и Kubernetes.' },
	{ term: 'CSI', full: 'Container Storage Interface', def: 'стандарт плагинов хранения для Kubernetes.' },
	{ term: 'cgroups', full: 'control groups', def: 'механизм ядра Linux для ограничения и учёта ресурсов групп процессов.' },
	{ term: 'OverlayFS', full: 'overlay filesystem', def: 'объединённая файловая система слоёв (lowerdir/upperdir/merged) с copy-on-write.' },
	{ term: 'CoW', full: 'copy-on-write', def: 'копирование при записи; данные копируются только при изменении — основа слоёв образов и снапшотов.' },
	{ term: 'LXC', full: 'Linux Containers', def: 'ранняя система контейнеров на namespaces и cgroups.' },
	{ term: 'runc', full: '', def: 'эталонная низкоуровневая среда выполнения OCI; создаёт namespaces и cgroups и запускает процесс контейнера.' },
	{ term: 'containerd', full: '', def: 'высокоуровневая среда выполнения контейнеров; управляет образами и жизненным циклом, вызывает runc.' },
	{ term: 'OOM', full: 'Out Of Memory', def: 'нехватка памяти; OOM killer завершает процессы при её исчерпании.' },
	{ term: 'PID', full: 'Process Identifier', def: 'числовой идентификатор процесса в системе.' },
	{ term: 'UTS', full: 'Unix Timesharing System', def: 'namespace, изолирующий hostname и domainname.' },
	{ term: 'IPC', full: 'Inter-Process Communication', def: 'межпроцессное взаимодействие: очереди, семафоры, разделяемая память.' },

	// --- Общая разработка ---
	{ term: 'API', full: 'Application Programming Interface', def: 'программный интерфейс взаимодействия с системой или сервисом.' },
	{ term: 'CLI', full: 'Command-Line Interface', def: 'интерфейс командной строки.' },
	{ term: 'YAML', full: "YAML Ain't Markup Language", def: 'человекочитаемый формат сериализации данных, широко используемый в конфигурации (например, в Kubernetes).' },
	{ term: 'HA', full: 'High Availability', def: 'высокая доступность; устойчивость сервиса к отказам.' },
	{ term: 'GPU', full: 'Graphics Processing Unit', def: 'графический процессор; за счёт массового параллелизма ускоряет обучение нейросетей.' },

	// --- Машинное обучение ---
	{ term: 'ML', full: 'Machine Learning', def: 'машинное обучение; построение моделей, которые выводят закономерности из данных.' },
	{ term: 'AI', full: 'Artificial Intelligence', def: 'искусственный интеллект; широкая область, частью которой является ML.' },
	{ term: 'ИИ', full: 'искусственный интеллект', def: 'системы, решающие задачи, которые традиционно требуют интеллекта; ML — его подобласть.' },
	{ term: 'DL', full: 'Deep Learning', def: 'глубокое обучение; машинное обучение на многослойных нейронных сетях.' },
	{ term: 'ANN', full: 'Artificial Neural Network', def: 'искусственная нейронная сеть.' },
	{ term: 'SGD', full: 'Stochastic Gradient Descent', def: 'стохастический градиентный спуск; оптимизация по случайным мини-батчам данных.' },
	{ term: 'MSE', full: 'Mean Squared Error', def: 'средняя квадратичная ошибка; метрика качества регрессии.' },
	{ term: 'RMSE', full: 'Root Mean Squared Error', def: 'корень из средней квадратичной ошибки; в единицах целевой переменной.' },
	{ term: 'MAE', full: 'Mean Absolute Error', def: 'средняя абсолютная ошибка; метрика регрессии, устойчивая к выбросам.' },
	{ term: 'ROC', full: 'Receiver Operating Characteristic', def: 'кривая зависимости доли верных срабатываний от ложных при разных порогах классификатора.' },
	{ term: 'AUC', full: 'Area Under the Curve', def: 'площадь под ROC-кривой; агрегированная мера качества классификатора от 0 до 1.' },
	{ term: 'PCA', full: 'Principal Component Analysis', def: 'метод главных компонент; линейное снижение размерности данных.' },
	{ term: 'kNN', full: 'k-Nearest Neighbors', def: 'метод k ближайших соседей; предсказание по близости в пространстве признаков.' },
	{ term: 'CNN', full: 'Convolutional Neural Network', def: 'свёрточная нейросеть; особенно эффективна для изображений.' },
	{ term: 'RNN', full: 'Recurrent Neural Network', def: 'рекуррентная нейросеть; обрабатывает последовательности данных.' },
	{ term: 'MLE', full: 'Maximum Likelihood Estimation', def: 'оценка максимального правдоподобия; подбор параметров, максимизирующих вероятность наблюдаемых данных.' },
	{ term: 'ReLU', full: 'Rectified Linear Unit', def: 'функция активации max(0, x); стандарт в глубоких сетях.' },
	{ term: 'NLP', full: 'Natural Language Processing', def: 'обработка естественного языка.' },
	{ term: 'LLM', full: 'Large Language Model', def: 'большая языковая модель; нейросеть-трансформер, обученная на огромных текстовых корпусах.' },
	{ term: 'EDA', full: 'Exploratory Data Analysis', def: 'разведочный анализ данных; первичное изучение и визуализация перед моделированием.' },
	{ term: 'OLS', full: 'Ordinary Least Squares', def: 'метод наименьших квадратов; классическая оценка линейной регрессии.' },
];
