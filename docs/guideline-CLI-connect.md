# ProcessCube CLI: Verbindung zu einer 5Minds Engine aufbauen

## Voraussetzungen

* Die 5Minds Engine muss auf dem lokalen oder auf einem entfernten System installiert sein, siehe [Installationsanleitung 5Minds Engine](#) //ToDo: Link anpassen. Alternativ können Sie sich auch das BPMN Studio / 5Minds Studio mit einer integrierten 5Minds Engine installieren, siehe [Installationsanleitung BPMN Studio / 5Minds Studio](#).
* Die ProcessCube CLI muss auf dem lokalen System installiert sein, siehe [Installationsanleitung ProcessCube CLI](#).

## Einloggen in die ProcessCube CLI

Damit Sie mit der 5Minds Engine über die ProcessCube CLI interagieren können, müssen Sie sich zunächst einloggen. Dies können Sie durch den folgenden Befehl realisieren:

```shell
pc login <ENGINE_URI>
```

---
**Info:**
Die `ENGINE_URI` variiert je nach Installation und Einrichtung ihrer 5Minds Engine. Auf einem Entwicklungssystem wird vorwiegend die 5Minds Engine lokal auf dem selben System betrieben. Dazu verwenden Sie einfach `localhost` und den entsprechend konfigurierten Port.
Die Ports haben bei der Einrichtung Standardwerte für die verschiedenen Freigabekanäle. Es folgt eine Auflistung der Standardwerte für jede Installationsart und jeden Freigabekanal:

| Installationsart                          | Freigabekanal | Standardport |
|-------------------------------------------|------------------------------|:------------:|
| 5Minds Engine                    | alpha                        |     10580     |
| 5Minds Engine                    | beta                         |     10570     |
| 5Minds Engine                    | stable                       |     10560     |
| 5Minds Engine via BPMN Studio / 5Minds Studio | alpha                        |     56200    |
| 5Minds Engine via BPMN Studio / 5Minds Studio | beta                         |     56100    |
| 5Minds Engine via BPMN Studio / 5Minds Studio | stable                       |     56000    |

Die Ports der 5Minds Engine können im Rahmen der [Konfiguration](https://github.com/atlas-engine/AtlasEngine/master/docs/install.md) individuell angepasst werden. Sofern die Einstellung nicht den Standardwerten entsprechen, müssen Sie die Verbindungsparameter entsprechend anpassen.

---

### Produktions- oder Testsystem

Auf Produktions- oder Testsystemen empfiehlt sich die 5Minds Engine nicht innerhalb eines BPMN Studios / 5Minds Studios zu betreiben. Mit einer 5Minds Engine aus dem 'stable' Freigabekanal, die auf einem Server (mit der IP-Adresse 10.10.32.7) installiert wurde, können Sie sich wie folgt einloggen:

```shell
pc login http://10.10.32.7:10560
```

Es öffnet sich nun ein Webbrowser mit der von Ihnen konfigurierten 5Minds Authority.

![alt text](./images/LoginWithAtlasAuthoriy.png "Einloggen mit der 5Minds Authoriy")

Geben Sie Ihre Anmeldeinformationen ein und bestätigen Sie mit "Login". Abhängig von Ihrer Konfiguration der 5Minds Authority ist es auch möglich, dass sie sich mit einem Provider wie Microsoft oder Google einloggen können.

---
**Info:**
Die 5Minds Authority ist für die Authentifizierung und Autorisierung in der ProcessCube-Plattform zuständig. Wenn Sie mehr dazu erfahren möchten, können Sie sich im Abschnitt [5Minds Authority](#ToDo) detaillierter informieren.

---

### Entwicklungssystem

Wenn Sie sich auf einem Entwicklungssystem befinden empfiehlt sich die Option für anonymen "Root-Zugriff" in der 5Minds Engine freizuschalten. Bei einer 5Minds Engine können Sie diese Einstellung [konfigurieren](#). Bei der im BPMN Studio / 5Minds Studio integrierten 5Minds Engine ist diese Option standardmäßig eingeschaltet.

Mit einer im BPMN Studio / 5Minds Studio integrierten 5Minds Engine aus dem 'stable' Freigabekanal, die lokal installiert wurde und dessen anonymen "Root-Zugriff" erlaubt ist, können Sie sich wie folgt einloggen:

```shell
pc login http://localhost:56000 --root
```

---
**Info:**
Die ProcessCube CLI nimmt als Standardprotokoll `http` und als Standardhost `localhost`. Dadurch ist auf Entwicklungssystemen die verkürzte Schreibweise für das Anmelden möglich:

```shell
pc login :56000 --root
```

---
