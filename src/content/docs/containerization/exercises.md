---
title: "Сводные задания курса «Контейнеризация»"
description: "Интегральные практические задания по всему курсу: от namespaces и cgroups до образов, runtime, сети, хранилищ, безопасности и оркестрации. С решениями в раскрывающихся блоках."
sidebar:
  order: 90
---

Эта страница собирает сквозные задания по всему курсу — от низкоуровневых примитивов ядра ([namespaces](/containerization/namespaces/), [cgroups](/containerization/cgroups/)) до сборки [образов](/containerization/images/), работы [runtime](/containerization/runtimes/), [Docker](/containerization/docker/), [сети](/containerization/networking/), [хранилищ](/containerization/storage/), [безопасности](/containerization/security/) и [оркестрации](/containerization/orchestration/). В отличие от заданий внутри отдельных разделов, здесь задачи намеренно более крупные и интегральные: почти каждая требует связать минимум 2–3 темы вместе. Рекомендуется выполнять их по порядку внутри уровня. Команды, требующие изоляции ядра (`unshare`, `nsenter`, монтирование cgroup), запускайте на Linux (ВМ/WSL2), а не на macOS — там нет нужных namespace.

## Базовые

### Задание 1. Контейнер «руками» через unshare (intro + namespaces)

Не используя Docker, запустите процесс в собственных PID-, mount-, UTS- и network-namespace. Внутри: смонтируйте свежий `/proc`, поменяйте hostname, убедитесь что процесс видит себя как PID 1, а сетевых интерфейсов (кроме `lo`) нет. Объясните, почему без `--mount-proc` команда `ps` показывает «чужие» процессы.

<details>
<summary>Решение</summary>

```bash
# Требуются права root либо настроенные user namespaces
sudo unshare --pid --mount --uts --net --fork --mount-proc /bin/bash

# Внутри новой среды:
hostname mybox            # меняем UTS-namespace, на хост не влияет
hostname                  # -> mybox
ps -ef                    # видим только процессы этого namespace, bash = PID 1
echo $$                   # -> 1
ip link                   # только lo (state DOWN), хостовых eth нет
```

Ключевые моменты:

- `--fork` обязателен для PID-namespace: сам `unshare` не становится PID 1, он порождает дочерний процесс, который и получает PID 1 в новом namespace.
- `--mount-proc` сначала создаёт mount-namespace, затем монтирует новый `procfs`. Без него `/proc` остаётся унаследованным от хоста, и `ps` (который читает `/proc/*`) показывает процессы хоста, хотя PID-namespace уже изолирован. Изоляция PID и «вид» в `/proc` — разные вещи: `ps` доверяет содержимому `/proc`.
- `--net` даёт пустой стек: только loopback в состоянии DOWN. Чтобы появилась связность, нужен veth-pair и мост (см. задание про сеть).

Это и есть минимальный «контейнер»: набор namespace + смонтированный proc. Docker делает то же самое плюс cgroups, rootfs (pivot_root) и capabilities.

</details>

### Задание 2. Многоступенчатая сборка минимального образа (images)

Возьмите простую программу на Go (или C) и соберите образ так, чтобы финальный размер был как можно меньше: используйте multi-stage build, статическую линковку и базовый образ `scratch`. Сравните размер с наивной сборкой на полном `golang`-образе.

<details>
<summary>Решение</summary>

```dockerfile
# Сборочная стадия
FROM golang:1.22 AS build
WORKDIR /src
COPY go.* ./
RUN go mod download
COPY . .
# CGO_ENABLED=0 -> статический бинарь без зависимости от glibc
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app ./cmd/app

# Финальная стадия: пустой образ, только бинарь
FROM scratch
COPY --from=build /app /app
# Для HTTPS-клиентов нужны корневые сертификаты:
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
ENTRYPOINT ["/app"]
```

```bash
docker build -t app:slim .
docker images app
# app  slim  ~5-10 MB  против ~900 MB у образа на полном golang
```

Что здесь работает на размер:

- `multi-stage`: тулчейн Go остаётся в стадии `build` и в финальный образ не попадает.
- `CGO_ENABLED=0` + `-ldflags="-s -w"`: статический бинарь без отладочной информации и таблицы символов.
- `FROM scratch`: ноль слоёв ОС. Альтернатива с shell и отладкой — `distroless` или `alpine` (но alpine — это musl, возможны нюансы).
- Корневые сертификаты копируем вручную, иначе TLS-соединения упадут с `x509: certificate signed by unknown authority`.

</details>

### Задание 3. Жизненный цикл и слои контейнера в Docker (docker + images)

Запустите контейнер из nginx, измените внутри него файл (например, индексную страницу), затем покажите изменения через `docker diff`, сохраните контейнер в новый образ через `docker commit` и объясните, какой слой при этом создаётся. В конце — почему `commit` считается антипаттерном для прода.

<details>
<summary>Решение</summary>

```bash
docker run -d --name web nginx:alpine
docker exec web sh -c 'echo "hello layers" > /usr/share/nginx/html/index.html'

docker diff web
# C /usr/share/nginx/html          (Changed)
# C /usr/share/nginx/html/index.html
# A /run/nginx.pid                 (Added)

docker commit web nginx:custom
docker history nginx:custom        # сверху появился новый слой с нашими изменениями
```

Объяснение:

- Контейнер = read-only слои образа + один тонкий writable-слой сверху (copy-on-write). Все изменения внутри живого контейнера пишутся именно в этот верхний слой.
- `docker diff` сравнивает writable-слой с образом: `A` — добавлено, `C` — изменено, `D` — удалено.
- `docker commit` «замораживает» writable-слой в новый read-only слой нового образа.
- Антипаттерн: образ, собранный `commit`-ом, невоспроизводим (нет Dockerfile, неизвестно что внутри), не версионируется в git, тащит мусор (pid-файлы, временные данные). В проде образ должен описываться декларативно Dockerfile-ом.

</details>

### Задание 4. Ограничение памяти и CPU через cgroups (cgroups + docker)

Запустите контейнер с лимитом памяти 100 MB и долей CPU. Спровоцируйте OOM-kill, найдите след в системе, затем покажите, как те же ограничения выглядят напрямую в иерархии cgroup v2.

<details>
<summary>Решение</summary>

```bash
# Лимит памяти 100M, без swap; CPU - не более половины ядра
docker run -d --name hog \
  --memory=100m --memory-swap=100m \
  --cpus="0.5" \
  alpine sh -c 'tail -f /dev/null'

# Спровоцируем OOM: выделяем больше лимита
docker exec hog sh -c 'cat /dev/zero | head -c 200m | tail' || true
docker inspect hog --format '{{.State.OOMKilled}}'   # -> true
```

Прямой взгляд в cgroup v2 (на хосте):

```bash
# id контейнера
CID=$(docker inspect -f '{{.Id}}' hog)
cd /sys/fs/cgroup/system.slice/docker-$CID.scope   # путь зависит от драйвера/дистрибутива

cat memory.max          # 104857600  (= 100M)
cat memory.current      # текущее потребление
cat cpu.max             # "50000 100000" -> 50ms квоты на 100ms период = 0.5 CPU
cat memory.events       # счётчик oom_kill увеличивается при убийствах
```

Суть: флаги `--memory`/`--cpus` Docker лишь записывает в файлы контроллеров `memory` и `cpu` соответствующей cgroup. `--cpus=0.5` транслируется в `cpu.max` как квота/период. При превышении `memory.max` ядро вызывает OOM-killer внутри cgroup, и контейнер падает с `OOMKilled=true`.

</details>

### Задание 5. Связь двух контейнеров через bridge-сеть (networking + docker)

Создайте пользовательскую bridge-сеть, поднимите в ней приложение и БД, и докажите, что контейнеры видят друг друга по имени (встроенный DNS), а наружу проброшен только нужный порт приложения. Объясните разницу со стандартной сетью `bridge`.

<details>
<summary>Решение</summary>

```bash
docker network create appnet

docker run -d --name db --network appnet \
  -e POSTGRES_PASSWORD=secret postgres:16

docker run -d --name api --network appnet \
  -p 8080:8080 \
  -e DATABASE_URL='postgres://postgres:secret@db:5432/postgres' \
  myapp:latest

# Резолв по имени внутри сети:
docker exec api getent hosts db    # вернёт IP контейнера db
```

- В пользовательской сети работает встроенный DNS Docker: имя контейнера (`db`) резолвится в его IP. В дефолтной сети `bridge` этого нет — там пришлось бы пользоваться устаревшими `--link` или IP-адресами.
- Наружу опубликован только `8080` приложения (`-p 8080:8080` — это правило DNAT в iptables). Порт БД `5432` доступен только внутри `appnet`, на хост не выходит — это правильная сегментация: БД не светится в интернет.
- Пользовательская сеть также даёт изоляцию: контейнеры из других сетей до `appnet` по умолчанию не достучатся.

</details>

## Средние

### Задание 6. rootfs + chroot/pivot_root «вручную» (runtimes + namespaces + images)

Соберите минимальный rootfs из образа alpine (через `docker export`), затем запустите в нём шелл в отдельных namespace со сменой корня. Поясните разницу между `chroot` и `pivot_root` и почему runtime (runc) использует именно `pivot_root`.

<details>
<summary>Решение</summary>

```bash
# 1) Достаём готовый rootfs из образа
mkdir -p /tmp/rootfs
CID=$(docker create alpine:latest)
docker export $CID | tar -C /tmp/rootfs -xf -
docker rm $CID

# 2) Запускаем процесс в новых namespace с этим корнем
sudo unshare --pid --mount --uts --net --fork --mount-proc=/tmp/rootfs/proc \
  chroot /tmp/rootfs /bin/sh

# Внутри:
cat /etc/os-release   # Alpine - корень подменён
ls /                  # видим только rootfs alpine
```

`chroot` против `pivot_root`:

- `chroot` лишь меняет «видимый корень» процесса, но старый корень остаётся примонтированным где-то в дереве mount; при наличии нужных прав/файловых дескрипторов из него можно «выбраться» (классический chroot escape).
- `pivot_root` физически переставляет точку монтирования корня: старый корень становится поддиректорией, которую затем размонтируют (`umount -l`). После этого ссылок на старый корень не остаётся — побег невозможен.
- Поэтому OCI-runtime (`runc`) для изоляции использует `pivot_root` (когда возможно), а не `chroot`. Это часть слоя безопасности: контейнер не должен иметь дороги к хостовому rootfs.

</details>

### Задание 7. Сравнение runtime-стека: OCI-спека и низкоуровневый запуск (runtimes)

Не запуская Docker daemon напрямую для старта, экспортируйте OCI-bundle и запустите контейнер через `runc`. Опишите цепочку `docker → containerd → containerd-shim → runc` и где в ней заканчивается «высокоуровневый» и начинается «низкоуровневый» runtime.

<details>
<summary>Решение</summary>

```bash
# Готовим OCI-bundle: rootfs + config.json
mkdir -p /tmp/bundle/rootfs
CID=$(docker create alpine:latest); docker export $CID | tar -C /tmp/bundle/rootfs -xf -; docker rm $CID

cd /tmp/bundle
runc spec                       # генерирует дефолтный config.json (OCI Runtime Spec)
# (по желанию правим args/terminal в config.json)
sudo runc run mycontainer       # стартует контейнер строго по спеке
sudo runc list                  # видим запущенный контейнер
```

Цепочка и границы:

```text
docker CLI  ->  dockerd  ->  containerd  ->  containerd-shim  ->  runc  ->  [процесс контейнера]
[------------ высокоуровневый runtime ------------]            [-- низкоуровневый --]
```

- Высокоуровневый runtime (`containerd`, ранее частично `dockerd`): управление образами, pull/push, сеть через CNI, том, API, lifecycle контейнеров.
- `containerd-shim`: «переживает» рестарт containerd, остаётся родителем процесса контейнера, держит stdio и код возврата.
- Низкоуровневый runtime (`runc`): реализует OCI Runtime Spec — создаёт namespaces/cgroups, выставляет capabilities, делает `pivot_root` и `exec` целевого процесса. Это и есть «механика контейнера».
- OCI стандартизует две вещи: формат образа (Image Spec) и формат bundle/запуска (Runtime Spec) — благодаря этому `runc` можно заменить на `crun`, `kata-runtime`, `gVisor (runsc)` без изменения вышестоящего стека.

</details>

### Задание 8. Persistent storage: volume против bind mount против tmpfs (storage)

Поднимите БД с именованным volume, продемонстрируйте сохранность данных после `docker rm` контейнера, затем сравните поведение с bind mount и tmpfs. Сформулируйте, когда что применять и в чём ловушка bind mount по правам/UID.

<details>
<summary>Решение</summary>

```bash
docker volume create pgdata
docker run -d --name db -v pgdata:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret postgres:16

docker exec -it db psql -U postgres -c 'CREATE TABLE t(id int); INSERT INTO t VALUES (1);'
docker rm -f db                          # контейнер удалён

# Новый контейнер на том же volume - данные на месте:
docker run -d --name db2 -v pgdata:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret postgres:16
docker exec -it db2 psql -U postgres -c 'SELECT * FROM t;'   # -> 1
```

```bash
# Bind mount: монтируем директорию хоста
docker run -d -v /srv/pg:/var/lib/postgresql/data -e POSTGRES_PASSWORD=secret postgres:16

# tmpfs: данные только в RAM, исчезают со стопом контейнера
docker run -d --tmpfs /cache:size=64m alpine sh -c 'tail -f /dev/null'
```

| Тип | Где данные | Переживает rm | Применение |
|-----|-----------|---------------|------------|
| named volume | управляется Docker (`/var/lib/docker/volumes`) | да | БД, прод-данные, переносимость |
| bind mount | путь на хосте | да | разработка (код в контейнер), доступ к конкретным файлам хоста |
| tmpfs | RAM | нет | секреты, кэш, чувствительные временные данные |

Ловушка bind mount: UID/GID внутри контейнера и владелец директории на хосте должны совпадать, иначе процесс получит `permission denied`. У named volume Docker сам выставляет владельца при первом монтировании, поэтому с БД он удобнее. Для bind mount часто требуется заранее `chown` или запуск с нужным `--user`.

</details>

### Задание 9. Healthcheck, restart policy и graceful shutdown (docker + intro)

Опишите сервис, который сообщает о своей готовности через HEALTHCHECK, автоматически перезапускается при падении и корректно обрабатывает сигнал остановки. Объясните разницу между exec- и shell-формой `CMD` в контексте доставки сигналов.

<details>
<summary>Решение</summary>

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY app.py .
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/healthz')" || exit 1
# exec-форма: процесс становится PID 1 и получает сигналы напрямую
CMD ["python", "app.py"]
```

```bash
docker run -d --name svc --restart=on-failure:3 -p 8080:8080 svc:latest
docker ps           # STATUS: ... (healthy) после прохождения проверок
docker stop svc     # SIGTERM -> приложение успевает закрыть соединения, затем (через 10с) SIGKILL
```

Ключевое:

- HEALTHCHECK переводит контейнер в статусы `starting` → `healthy`/`unhealthy`. Оркестратор (или `--restart`) реагирует на это, а зависимые сервисы могут ждать готовности.
- `--restart=on-failure:N` перезапускает только при ненулевом коде выхода, до N раз; `always`/`unless-stopped` — даже после рестарта демона.
- exec-форма `CMD ["python","app.py"]` запускает процесс напрямую как PID 1, и `SIGTERM` от `docker stop` доходит до приложения. Shell-форма `CMD python app.py` запускает через `/bin/sh -c`, который становится PID 1 и обычно НЕ пробрасывает сигналы дочернему процессу — приложение не получит SIGTERM и будет жёстко убито SIGKILL через таймаут. Для корректного graceful shutdown используйте exec-форму (или init-процесс вроде `tini`).

</details>

### Задание 10. Multi-service окружение в Docker Compose (docker + networking + storage)

Опишите в `compose.yaml` приложение, БД и обратный прокси: с зависимостями по готовности, общей сетью, именованным volume под данные БД и переменными окружения. Объясните роль `depends_on: condition: service_healthy`.

<details>
<summary>Решение</summary>

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build: ./api
    environment:
      DATABASE_URL: postgres://postgres:secret@db:5432/postgres
    depends_on:
      db:
        condition: service_healthy   # ждём не запуска, а готовности БД
    expose:
      - "8080"

  proxy:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - api

volumes:
  pgdata:
```

```bash
docker compose up -d
docker compose ps        # видно health статус db
docker compose logs -f api
```

Пояснения:

- Compose создаёт единую сеть проекта; сервисы резолвятся по именам (`db`, `api`, `proxy`).
- `depends_on` без условия гарантирует лишь порядок старта контейнера, но НЕ готовность процесса внутри. `condition: service_healthy` заставляет ждать, пока healthcheck БД не станет `healthy` — иначе `api` стартует раньше, чем БД примет соединения, и упадёт.
- `expose` открывает порт только внутри сети Compose; наружу выходит только `proxy` через `ports: 80:80`. Это та же сегментация, что в задании 5, но декларативно.
- `pgdata` — именованный volume: данные переживают `compose down` (но не `compose down -v`).

</details>

## Продвинутые

### Задание 11. Понижение привилегий: non-root, capabilities, read-only FS, no-new-privileges (security)

Возьмите образ, по умолчанию работающий от root, и приведите его к безопасному состоянию: запуск от непривилегированного пользователя, сброс всех Linux capabilities кроме необходимых, read-only корневая ФС с tmpfs под временные данные и запрет эскалации привилегий. Проверьте, что внутри действительно нет лишних прав.

<details>
<summary>Решение</summary>

```dockerfile
FROM nginx:alpine
# Готовим под non-root: nginx должен писать в свои временные пути
RUN adduser -D -u 10001 appuser \
 && chown -R appuser /var/cache/nginx /var/run
USER 10001
```

```bash
docker run -d --name hard \
  --user 10001 \
  --read-only \
  --tmpfs /var/cache/nginx --tmpfs /var/run \
  --cap-drop=ALL \
  --cap-add=NET_BIND_SERVICE \
  --security-opt no-new-privileges:true \
  myapp:latest

# Проверки:
docker exec hard id                       # uid=10001, не root
docker exec hard sh -c 'touch /test' || echo "FS read-only - ok"
docker exec hard sh -c 'cat /proc/self/status | grep CapEff'   # почти пустой capability-набор
```

Что мы сделали и зачем:

- `--user 10001` (или `USER` в Dockerfile): процесс не root внутри контейнера; компрометация приложения не даёт root-прав. Числовой UID лучше имени — работает даже если пользователя нет в `/etc/passwd`.
- `--cap-drop=ALL` + точечный `--cap-add`: контейнер по умолчанию получает урезанный, но всё же существенный набор capabilities. Сбрасываем всё и добавляем только нужное (например, `NET_BIND_SERVICE` для привязки к порту ниже 1024). Это принцип наименьших привилегий.
- `--read-only`: корневая ФС не пишется; всё, что должно меняться, выносим в `--tmpfs`. Резко сужает поверхность атаки (нельзя подбросить бинарь/скрипт).
- `--security-opt no-new-privileges:true`: запрещает повышение привилегий через setuid-бинари (`execve` не даст приобрести новые привилегии). Закрывает класс атак через privilege escalation.

Дополнительно в проде: seccomp-профиль (Docker применяет дефолтный, ограничивающий ~44 опасных syscalls), AppArmor/SELinux, сканирование образа на CVE и подпись образов.

</details>

### Задание 12. Сеть «руками»: veth + bridge + NAT между двумя network namespace (networking + namespaces)

Без Docker соедините два network namespace через bridge и обеспечьте им выход в интернет через NAT — фактически воспроизведите то, что делает Docker bridge-драйвер. Покажите ping между namespace и наружу.

<details>
<summary>Решение</summary>

```bash
# 1) Два namespace
sudo ip netns add ns1
sudo ip netns add ns2

# 2) Bridge на хосте
sudo ip link add br0 type bridge
sudo ip addr add 10.0.0.1/24 dev br0
sudo ip link set br0 up

# 3) veth-пары: один конец в namespace, другой в bridge
for n in 1 2; do
  sudo ip link add veth$n type veth peer name br-veth$n
  sudo ip link set veth$n netns ns$n
  sudo ip link set br-veth$n master br0
  sudo ip link set br-veth$n up
  sudo ip netns exec ns$n ip addr add 10.0.0.1$n/24 dev veth$n
  sudo ip netns exec ns$n ip link set veth$n up
  sudo ip netns exec ns$n ip link set lo up
  sudo ip netns exec ns$n ip route add default via 10.0.0.1
done

# 4) Связность между namespace
sudo ip netns exec ns1 ping -c2 10.0.0.12   # ns1 -> ns2 через br0

# 5) NAT наружу (eth0 - внешний интерфейс хоста)
sudo sysctl -w net.ipv4.ip_forward=1
sudo iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -o eth0 -j MASQUERADE
sudo ip netns exec ns1 ping -c2 8.8.8.8       # выход в интернет
```

Соответствие модели Docker:

- `br0` ≈ `docker0` (или мост пользовательской сети). veth-пара = «провод» между контейнером и мостом, один конец живёт в namespace контейнера (как `eth0` внутри), второй — порт моста на хосте.
- Маршрут по умолчанию через IP моста + `ip_forward=1` дают контейнерам выход наружу.
- `MASQUERADE` (SNAT) подменяет приватный src-IP на адрес хоста — именно так контейнеры с приватными адресами ходят в интернет. Публикация портов (`-p`) у Docker — это правило DNAT в `PREROUTING`, которого здесь нет, поскольку входящие соединения мы не пробрасываем.

</details>

### Задание 13. От Compose к Kubernetes: Deployment + Service + ConfigMap + проба (orchestration)

Перенесите приложение из задания 10 в Kubernetes-манифесты: Deployment с несколькими репликами, Service для доступа, ConfigMap с конфигурацией и readiness/liveness-пробы. Объясните разницу между liveness и readiness и роль Service в обнаружении подов.

<details>
<summary>Решение</summary>

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
data:
  LOG_LEVEL: "info"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels: { app: api }
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: api
          image: myapp:1.0
          ports:
            - containerPort: 8080
          envFrom:
            - configMapRef: { name: api-config }
          readinessProbe:
            httpGet: { path: /healthz, port: 8080 }
            initialDelaySeconds: 3
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /livez, port: 8080 }
            initialDelaySeconds: 10
            periodSeconds: 10
          resources:
            requests: { cpu: "100m", memory: "128Mi" }
            limits:   { cpu: "500m", memory: "256Mi" }
---
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector: { app: api }      # связывает Service с подами по label
  ports:
    - port: 80
      targetPort: 8080
```

```bash
kubectl apply -f api.yaml
kubectl get pods -l app=api          # 3 реплики
kubectl rollout status deploy/api
```

Ключевые различия и связи:

- liveness-проба отвечает на вопрос «жив ли процесс»; при провале kubelet перезапускает контейнер. Нужна для само-восстановления из зависших состояний.
- readiness-проба отвечает «готов ли под принимать трафик»; при провале под исключается из эндпойнтов Service, но НЕ перезапускается. Нужна для прогрева, ожидания зависимостей, временной перегрузки.
- Service по `selector` находит поды с нужными label и балансирует на их IP (через kube-proxy/iptables/IPVS). Поды эфемерны и меняют IP — Service даёт стабильное имя и VIP. Это аналог встроенного DNS Docker, но с балансировкой и автоматическим обновлением списка живых эндпойнтов.
- `resources.requests/limits` — это те самые cgroup-лимиты из задания 4, но управляемые планировщиком и kubelet.

</details>

### Задание 14. Интегральный аудит образа и контейнера: воспроизводимость, размер, безопасность, наблюдаемость (images + security + docker + cgroups)

Дан «плохой» Dockerfile: один большой слой, запуск от root, `latest`-теги, секреты в ARG, без healthcheck. Проведите полный рефакторинг и обоснуйте каждое изменение через темы курса. Покажите, как проверить итоговый результат (размер, пользователь, кэш слоёв, отсутствие секретов в истории).

<details>
<summary>Решение</summary>

Было (антипаттерны):

```dockerfile
FROM ubuntu:latest
ARG DB_PASSWORD=secret
RUN apt-get update && apt-get install -y python3 python3-pip
COPY . /app
RUN pip3 install -r /app/requirements.txt
CMD python3 /app/main.py
```

Стало:

```dockerfile
# 1) Зафиксированный тег/дайджест - воспроизводимость сборки
FROM python:3.12-slim AS build
WORKDIR /app
# 2) Сначала зависимости - кэш слоёв не инвалидируется при правке кода
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
# 3) non-root пользователь
RUN useradd -u 10001 -m appuser
COPY --from=build /install /usr/local
COPY . .
USER 10001
# 4) Готовность для оркестратора
HEALTHCHECK CMD python -c "import urllib.request;urllib.request.urlopen('http://localhost:8080/healthz')" || exit 1
# 5) exec-форма - корректные сигналы (PID 1)
CMD ["python", "main.py"]
```

Обоснование изменений по темам курса:

| Проблема | Что сделано | Тема |
|----------|-------------|------|
| `latest` | фиксированный тег (лучше — дайджест `@sha256:...`) | images, воспроизводимость |
| секрет в `ARG`/`ENV` | убрать совсем; секреты через runtime (env/secret store), либо `--mount=type=secret` в BuildKit | security |
| один жирный слой, `apt-get` мусор | slim-база, `--no-cache-dir`, разделение зависимостей и кода | images, размер |
| инвалидация кэша | сначала `requirements.txt`, потом код | docker build cache |
| запуск от root | `USER 10001` + при запуске `--cap-drop=ALL` | security |
| нет healthcheck | `HEALTHCHECK` + readiness в оркестраторе | docker, orchestration |
| shell-форма CMD | exec-форма для проброса SIGTERM | docker, lifecycle |

Проверки результата:

```bash
docker build -t app:1.0 .
docker images app:1.0                         # размер заметно меньше ubuntu+pip
docker run --rm app:1.0 id                     # uid=10001 (не root)

# Секрет не утёк в слои/историю:
docker history --no-trunc app:1.0 | grep -i secret || echo "секретов в истории нет"

# Запуск по принципу наименьших привилегий + лимиты (cgroups):
docker run -d --name app \
  --read-only --tmpfs /tmp \
  --cap-drop=ALL --security-opt no-new-privileges:true \
  --memory=256m --cpus=0.5 \
  -p 8080:8080 app:1.0
docker stats --no-stream app                   # видим, что лимиты cgroup применены
```

Важное замечание про секреты: даже если убрать `ARG DB_PASSWORD` из финального образа, в старом варианте он мог попасть в слой/историю сборки. Для сборочных секретов используйте `RUN --mount=type=secret` (BuildKit) — они не сохраняются в слоях. Для рантайма — переменные окружения из секрет-хранилища (Docker secrets, Vault, Kubernetes Secret), а не зашитые в образ значения.

</details>
