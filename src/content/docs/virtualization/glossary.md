---
title: "Глоссарий и источники"
description: "Ключевые термины курса по виртуализации с краткими определениями и список авторитетных первоисточников."
sidebar:
  order: 11
---

Этот раздел собирает воедино терминологию, которая встречалась на протяжении всего курса, и даёт ссылки на первоисточники — статьи и спецификации, на которых построена современная виртуализация. Определения намеренно краткие: они нужны как быстрый справочник, а развёрнутые объяснения ищите в соответствующих разделах курса, на которые даны ссылки.

## Как пользоваться глоссарием

Термины сгруппированы по темам в том порядке, в каком они вводились в курсе: основы и классификация, виртуализация CPU, памяти, ввода-вывода, паравиртуализация и контейнеры. Внутри группы термины идут в логическом, а не алфавитном порядке — так связанные понятия стоят рядом.

:::tip[Совет]
Если вы ищете конкретный термин, используйте поиск по странице (Ctrl+F / Cmd+F). Многие термины снабжены ссылкой на раздел, где они разбираются подробно.
:::

## Основы и классификация

- **Виртуализация** — техника создания абстрактного (виртуального) представления вычислительных ресурсов: процессора, памяти, устройств, — позволяющая запускать несколько изолированных вычислительных сред на одном физическом оборудовании. См. [/virtualization/intro/](/virtualization/intro/).
- **Гипервизор (Hypervisor)** — программный слой, создающий и управляющий виртуальными машинами, распределяющий между ними физические ресурсы и обеспечивающий их изоляцию. Синоним — VMM.
- **VMM (Virtual Machine Monitor)** — монитор виртуальных машин; исторический термин из работы Попека и Голдберга для компонента, отвечающего трём свойствам: эквивалентность (fidelity), безопасность изоляции (safety) и эффективность (efficiency).
- **Type-1 (bare-metal) гипервизор** — гипервизор, работающий напрямую поверх оборудования без хостовой ОС (VMware ESXi, Xen, Microsoft Hyper-V). См. [/virtualization/hypervisors/](/virtualization/hypervisors/).
- **Type-2 (hosted) гипервизор** — гипервизор, работающий как приложение или модуль внутри обычной хостовой ОС (VMware Workstation, VirtualBox, QEMU). Граница между типами размывается: KVM формально модуль ядра Linux, но по производительности близок к Type-1.
- **Гостевая ОС (Guest OS)** — операционная система, выполняющаяся внутри виртуальной машины.
- **Хостовая ОС (Host OS)** — операционная система, на которой работает гипервизор Type-2.
- **Trap-and-emulate** — классическая модель виртуализации: гость выполняется напрямую, а попытка выполнить привилегированную инструкцию вызывает ловушку (trap), которую VMM перехватывает и эмулирует.

## Виртуализация CPU

- **Кольца защиты (protection rings)** — уровни привилегий процессора x86 (ring 0 — ядро, ring 3 — пользователь; ring 1 и 2 почти не используются), ограничивающие доступ к привилегированным операциям. См. [/virtualization/cpu/](/virtualization/cpu/).
- **Депривилегирование (deprivileging, ring compression)** — приём, при котором гостевое ядро, рассчитанное на ring 0, запускается на менее привилегированном уровне (ring 1 или ring 3), чтобы VMM сохранял контроль над оборудованием.
- **Привилегированная инструкция** — инструкция, выполнение которой вне ring 0 вызывает исключение (trap). Основа для классической виртуализации trap-and-emulate.
- **Чувствительная инструкция (sensitive instruction)** — инструкция, которая читает или меняет состояние, связанное с привилегиями или конфигурацией машины (control-sensitive), либо ведёт себя по-разному в зависимости от уровня привилегий (behavior-sensitive).
- **Критерий виртуализуемости Попека–Голдберга** — архитектура эффективно виртуализуема методом trap-and-emulate, если множество чувствительных инструкций является подмножеством привилегированных. Классический x86 этому критерию не удовлетворял.
- **Бинарная трансляция (binary translation)** — динамическая перекомпиляция гостевого кода на лету с заменой проблемных (чувствительных, но непривилегированных) инструкций безопасными последовательностями. Использовалась VMware до появления аппаратной поддержки.
- **Intel VT-x** — аппаратное расширение виртуализации Intel, добавляющее режимы VMX root (для VMM) и VMX non-root (для гостя). Маркетинговое имя для архитектуры VMX.
- **VMX (Virtual Machine Extensions)** — собственно набор инструкций и режимов Intel для виртуализации: VMXON, VMLAUNCH, VMRESUME, VMREAD, VMWRITE и др.
- **VMCS (Virtual Machine Control Structure)** — структура в памяти, хранящая состояние гостя и хоста, а также настройки перехватов; через неё VMM управляет каждой VM в Intel VT-x.
- **VM exit** — переход управления от гостя (non-root) к VMM (root), вызываемый перехватываемым событием или инструкцией; состояние гостя сохраняется в VMCS.
- **VM entry** — обратный переход от VMM к гостю (VMLAUNCH/VMRESUME) с восстановлением гостевого состояния из VMCS.
- **AMD-V (SVM)** — аппаратная виртуализация AMD; SVM (Secure Virtual Machine) — набор инструкций (VMRUN, VMLOAD, VMSAVE) и структура VMCB, аналог VT-x/VMCS.
- **VMCB (Virtual Machine Control Block)** — структура управления виртуальной машиной в AMD SVM, аналог VMCS у Intel.
- **Ring -1 (root mode)** — неформальное обозначение нового уровня привилегий, который аппаратная виртуализация даёт гипервизору «под» ring 0 гостя, устраняя необходимость в депривилегировании.

## Виртуализация памяти

- **Теневые таблицы страниц (shadow page tables)** — программная техника: VMM поддерживает собственные таблицы страниц, отображающие гостевые виртуальные адреса прямо в физические адреса хоста, синхронизируя их с гостевыми таблицами. Дорого по накладным расходам. См. [/virtualization/memory/](/virtualization/memory/).
- **EPT (Extended Page Tables)** — аппаратная двухуровневая трансляция адресов Intel: вторая таблица переводит гостевые физические адреса в физические адреса хоста, устраняя теневые таблицы.
- **NPT (Nested Page Tables / RVI)** — аналог EPT от AMD (также называется Rapid Virtualization Indexing).
- **SLAT (Second Level Address Translation)** — обобщающий термин для аппаратной вложенной трансляции (EPT и NPT).
- **TLB (Translation Lookaside Buffer)** — аппаратный кэш недавних трансляций виртуальных адресов в физические; промахи особенно дороги при двухуровневой трансляции.
- **VPID / ASID** — теги виртуальных процессоров (Virtual Processor ID у Intel, Address Space ID у AMD), позволяющие хранить записи разных VM в TLB одновременно и избегать полного сброса TLB при каждом VM exit/entry.
- **Memory ballooning** — приём динамического возврата памяти: драйвер-«баллон» внутри гостя по запросу гипервизора занимает память и отдаёт её хосту, позволяя перераспределять RAM между VM.
- **KSM (Kernel Same-page Merging)** — механизм ядра Linux, находящий идентичные страницы памяти разных VM и объединяющий их в одну copy-on-write, экономя RAM.
- **Overcommit (переподписка)** — выделение виртуальным машинам суммарно больше ресурсов (памяти, CPU), чем физически доступно, в расчёте на то, что не все они используются одновременно.

## Виртуализация ввода-вывода

- **Эмуляция устройств (device emulation)** — программная имитация реального аппаратного устройства (например, сетевой карты Intel e1000) для гостя; гость использует штатные драйверы, но каждое обращение перехватывается и обрабатывается VMM. Медленно. См. [/virtualization/io/](/virtualization/io/).
- **virtio** — стандарт паравиртуализованных устройств: гость использует специальные драйверы, «знающие» о виртуализации, что устраняет дорогую эмуляцию железа. См. [/virtualization/paravirtualization/](/virtualization/paravirtualization/).
- **Virtqueue / vring** — кольцевой буфер (ring buffer) в общей памяти, через который гость и хост обмениваются дескрипторами запросов в virtio; vring — конкретная реализация транспорта.
- **vhost** — перенос обработки virtio-устройства (например, vhost-net) из пользовательского QEMU в ядро хоста, что убирает лишние переключения контекста и ускоряет ввод-вывод.
- **IOMMU (Input-Output Memory Management Unit)** — аппаратный блок, транслирующий адреса DMA от устройств и изолирующий их, что делает безопасным прямой проброс устройств в VM.
- **Intel VT-d** — реализация IOMMU от Intel (Virtualization Technology for Directed I/O); у AMD аналог называется AMD-Vi.
- **PCI passthrough** — прямой проброс физического PCI/PCIe-устройства в виртуальную машину в монопольное владение, с почти нативной производительностью; требует IOMMU.
- **SR-IOV (Single Root I/O Virtualization)** — стандарт PCI-SIG, позволяющий одному физическому устройству представлять себя как множество независимых, пробрасываемых в разные VM.
- **PF (Physical Function)** — полнофункциональное PCIe-устройство в SR-IOV, управляющее ресурсами и конфигурацией.
- **VF (Virtual Function)** — облегчённая «виртуальная функция» SR-IOV, порождённая PF и пробрасываемая в отдельную VM.

## Паравиртуализация и контейнеры

- **Паравиртуализация (paravirtualization)** — подход, при котором гостевая ОС модифицируется и «знает», что работает под гипервизором, заменяя дорогие перехваты явными вызовами к гипервизору. Противоположность полной виртуализации. См. [/virtualization/paravirtualization/](/virtualization/paravirtualization/).
- **Hypercall** — явный вызов гостем функции гипервизора (аналог системного вызова, но к VMM); основа паравиртуализации.
- **dom0 (domain 0)** — привилегированный домен в архитектуре Xen, имеющий прямой доступ к оборудованию и управляющий остальными VM.
- **domU (unprivileged domain)** — обычная непривилегированная гостевая VM в Xen.
- **Контейнер** — изолированное окружение на уровне ОС, разделяющее ядро с хостом; в отличие от VM не запускает отдельное ядро. См. [/virtualization/containers-vs-vm/](/virtualization/containers-vs-vm/).
- **Namespaces** — механизм ядра Linux, изолирующий видимость ресурсов (PID, сеть, точки монтирования, пользователи и т.д.) для группы процессов; основа изоляции контейнеров.
- **cgroups (control groups)** — механизм ядра Linux для учёта и ограничения потребления ресурсов (CPU, память, ввод-вывод) группами процессов.
- **microVM** — облегчённая виртуальная машина с минимальным набором эмулируемых устройств и быстрым запуском (Firecracker, Cloud Hypervisor), сочетающая изоляцию VM со скоростью контейнеров.

## Эксплуатация и управление

- **Snapshot (снимок)** — сохранённое состояние VM (память, диск, состояние устройств) в конкретный момент, к которому можно вернуться. См. [/virtualization/kvm-qemu/](/virtualization/kvm-qemu/).
- **Live migration (живая миграция)** — перенос работающей VM с одного физического хоста на другой практически без прерывания работы, обычно итеративным копированием страниц памяти.
- **KVM (Kernel-based Virtual Machine)** — модуль ядра Linux, превращающий ядро в гипервизор Type-1 поверх аппаратной виртуализации (VT-x/AMD-V).
- **QEMU** — эмулятор и виртуализатор; в паре с KVM берёт на себя эмуляцию устройств и управление VM, тогда как KVM ускоряет исполнение CPU. См. [/virtualization/kvm-qemu/](/virtualization/kvm-qemu/).
- **libvirt** — библиотека и набор инструментов (virsh) для унифицированного управления гипервизорами (KVM/QEMU, Xen и др.) через единый API.

## Источники

Ниже — первоисточники, на которых базируется материал курса: основополагающие научные статьи и официальные спецификации производителей и проектов. Это лучшая точка входа для углублённого изучения.

### Основополагающие статьи

- Gerald J. Popek, Robert P. Goldberg. **Formal Requirements for Virtualizable Third Generation Architectures**. *Communications of the ACM*, vol. 17, no. 7, July 1974, pp. 412–421. Работа, формально определившая условия виртуализуемости архитектуры. [dl.acm.org/doi/10.1145/361011.361073](https://dl.acm.org/doi/10.1145/361011.361073)
- Paul Barham, Boris Dragovic, Keir Fraser, Steven Hand, Tim Harris, Alex Ho, Rolf Neugebauer, Ian Pratt, Andrew Warfield. **Xen and the Art of Virtualization**. *Proceedings of the 19th ACM Symposium on Operating Systems Principles (SOSP '03)*, 2003. Архитектура Xen и паравиртуализация. [dl.acm.org/doi/10.1145/945445.945462](https://dl.acm.org/doi/10.1145/945445.945462) (PDF: [cl.cam.ac.uk/research/srg/netos/papers/2003-xensosp.pdf](https://www.cl.cam.ac.uk/research/srg/netos/papers/2003-xensosp.pdf))
- Keith Adams, Ole Agesen. **A Comparison of Software and Hardware Techniques for x86 Virtualization**. *Proceedings of ASPLOS XII*, 2006. Сравнение бинарной трансляции и первого поколения VT-x. [dl.acm.org/doi/10.1145/1168857.1168860](https://dl.acm.org/doi/10.1145/1168857.1168860)
- Avi Kivity, Yaniv Kamay, Dor Laor, Uri Lublin, Anthony Liguori. **kvm: the Linux Virtual Machine Monitor**. *Proceedings of the Linux Symposium (OLS)*, Ottawa, June 2007, vol. 1, pp. 225–230. [kernel.org/doc/ols/2007/ols2007v1-pages-225-230.pdf](https://www.kernel.org/doc/ols/2007/ols2007v1-pages-225-230.pdf)
- Rusty Russell. **virtio: towards a de-facto standard for virtual I/O devices**. *ACM SIGOPS Operating Systems Review*, vol. 42, no. 5, 2008, pp. 95–103. [dl.acm.org/doi/10.1145/1400097.1400108](https://dl.acm.org/doi/10.1145/1400097.1400108)

### Спецификации производителей

- **Intel 64 and IA-32 Architectures Software Developer's Manual, Volume 3 (System Programming Guide)** — главы по VMX (VT-x), VMCS, EPT, VPID. Актуальная версия: [intel.com/sdm](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html)
- **AMD64 Architecture Programmer's Manual, Volume 2: System Programming** — раздел Secure Virtual Machine (SVM): VMRUN, VMCB, NPT, ASID. [amd.com — Developer Guides & Manuals](https://www.amd.com/en/search/documentation/hub.html)
- **Virtio Specification (OASIS)** — современный нормативный стандарт virtio. [docs.oasis-open.org/virtio/virtio/v1.2/virtio-v1.2.html](https://docs.oasis-open.org/virtio/virtio/v1.2/virtio-v1.2.html)
- **PCI-SIG: Single Root I/O Virtualization (SR-IOV)** — спецификация SR-IOV. [pcisig.com/specifications/iov](https://pcisig.com/specifications/iov)

### Документация проектов

- **Документация QEMU** — [qemu.org/docs/master/](https://www.qemu.org/docs/master/)
- **Документация libvirt** — [libvirt.org/docs.html](https://libvirt.org/docs.html)
- **Документация ядра Linux: виртуализация и KVM** — [docs.kernel.org/virt/](https://docs.kernel.org/virt/), API KVM: [docs.kernel.org/virt/kvm/api.html](https://docs.kernel.org/virt/kvm/api.html)
- **Документация ядра Linux: cgroups v2** — [docs.kernel.org/admin-guide/cgroup-v2.html](https://docs.kernel.org/admin-guide/cgroup-v2.html)
- **Документация Xen Project** — [xenproject.org/help/documentation/](https://xenproject.org/help/documentation/)

:::note[Навигация]
Это последний раздел курса. Вернуться к оглавлению курса по виртуализации можно на странице [/virtualization/](/virtualization/), а посмотреть общую дорожную карту обучения — на [/roadmap/](/roadmap/).
:::
