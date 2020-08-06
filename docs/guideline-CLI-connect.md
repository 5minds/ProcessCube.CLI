# Guideline CLI: Verbindung aufbauen

## Voraussetzungen
* Die AtlasEngine muss auf dem lokalen oder auf einem entfernten System installiert sein. Siehe [Installationsanleitung AtlasEngine](./install.md) //ToDo: Link anpassen. Alternativ können Sie sich auch das BPMN-Studios / AtlasStudio mit einer integrierten AtlasEngine installieren. Siehe [Installationsanleitung BPMN-Studio / AtlasStudio](./install.md)
* Die Atlas.CLI muss auf dem lokalen System installiert sein. Siehe [Installationsanleitung Atlas.CLI](./install.md)

## Einloggen in die Atlas.CLI
Damit Sie mit der AtlasEngine über die Atlas.CLI interagieren können müssen Sie sich zunächst einloggen. Dies können Sie durch folgenden Befehl realisieren:
```shell
atlas login <ENGINE_URI>
```
---
**Info**

Die "ENGINE_URI" variiert je nach Installation und Einrichtung ihrer AltasEngine. Auf einem Entwicklungssystem wird vorwiegend die AtlasEngine lokal auf dem selben System betrieben. Dazu verwenden Sie einfach "localhost" und den entsprechend konfigurierten Port.
Die Ports haben bei der Einrichtung Standardwerte für die verschiedenen Varianten der Freigabeversionen. Es folgt eine Auflistung der Standardwerte für jede Installationsart und Variante der Freigabeversion:

| Installationsart                          | Variante der Freigabeversion | Standardport |
|-------------------------------------------|------------------------------|:------------:|
| AtlasEngine via BPMN-Studio / AtlasStudio | alpha                        |     56200    |
| AtlasEngine via BPMN-Studio / AtlasStudio | beta                         |     56100    |
| AtlasEngine via BPMN-Studio / AtlasStudio | stable                       |     56000    |
| standalone AtlasEngine                    | alpha                        |     8000     |
| standalone AtlasEngine                    | beta                         |     8000     |
| standalone AtlasEngine                    | stable                       |     8000     |

---

### Produktions- oder Testsystem
Auf Produktions- oder Testsystem empfehlt sich die AtlasEngine nicht innerhalb eines BPMN-Studios / AtlasStudios zu betreiben. Mit einer im  AtlasEngine aus der 'stable' Freigabeversion die auf einem Server (mit der IP-Adresse 10.10.32.7) installiert wurde können Sie sich wie folgt einloggen:

```shell
atlas login http://10.10.32.7:8000
```

Es öffnet sich nun ein Webbrowser mit der von Ihnen konfigurieren Authority. 
![alt text](./images/LoginWithAtlasAuthoriy.png "Einloggen mit der AtlasAuthoriy")
Geben Sie Ihre Anmeldeinformationen und bestätigen Sie mit "Login" oder wählen Sie einen konfigurierten Provider wie Microsoft oder Google.

### Entwicklungssystem
Wenn Sie sich auf einem Entwicklungssystem befinden empfiehlt sich die Option für "Anonymen Root Zugriff" in der AtlasEngine freizuschalten. Bei der im BPMN-Studio / AtlasStudio integrierten AtlasEngine können Sie dies durch die [Einstellungen](./install.md) realisieren. Bei einer "standalone" eingerichteten AtlasEngine können Sie die Einstellung ebenfalls [konfigurieren](.install.md).

Mit einer im BPMN-Studio / AtlasStudio integrierten AtlasEngine aus der 'stable' Freigabeversion, die lokal installiert wurde und dessen anonymer root Zugriff erlaubt ist können Sie sich wie folgt einloggen:

```shell
atlas login http://localhost:56000 --root
```

