# Atlas CLI

ProcessEngine spezifisches Tooling, welches im Rahmen von Deployment- und Debugging-Prozessen verwendet wird.

## Was sind die Ziele dieses Projekts?

Automatisierung.

## Wie kann ich das Projekt aufsetzen?


### Voraussetzungen

* Node `>= 10.0.0`
* npm `>= 6.0.0`


### Setup/Installation

```shell
$ npm install @atlas-engine/cli
```

## Wie kann ich das Projekt benutzen?


### Benutzung

#### `atlas --help`

Blendet eine Hilfe ein.

```shell
$ atlas --help

USAGE:

  atlas [COMMAND]

COMMANDS:

  info                        prints info about current session
  login                       logs a user in to the given engine
  logout                      logs out from the current session
  deploy                      deploys one or more files to the engine
  remove                      removes one or more files from the engine
  start                       starts one or more process instances
  stop                        stops one or more process instances
  retry                       retries one or more process instances
  list-process-models         lists process models
  list-process-instances      lists process instances
  list-correlations           lists correlations
```

#### `atlas login`

Loggt den Benutzer auf der Engine unter der angegebenen URI ein. Resultiert in einer aktiven Session.
Eine Session speichert den erhaltenen Access-Token, so dass Folge-Befehle diese Identität verwenden können.

```shell
$ atlas login <ENGINE_URI>
```

Bei einer abgelaufenen Session kann der Parameter `ENGINE_URL` auch weggelassen werden.
Die CLI verwendet in diesem Fall die `ENGINE_URL` der abgelaufenen Session, um den Nutzer erneut bei der entsprechenden Authority anzumelden.

#### `atlas logout`

Loggt den Benutzer aus. Löscht die Session.

```shell
$ atlas logout
```

#### `atlas info`

> Alias: `atlas i`

Zeigt Informationen über die aktuell verbundene Engine und die Session an.

```shell
$ atlas info
```

Es wird ein Standardsatz an Infos zu aktuellen Laufzeitparametern angezeigt, wie bspw. die letzten 5 gestarteten Prozessinstanzen, Durchsatz, durchschnittliche Durchlaufzeit, etc.

`atlas i` ist gewissermaßen das Dashboard der CLI.

### Deployment

#### `atlas deploy`

> Alias: `atlas cp`

Transportiert ein Prozessmodell auf die Engine, so dass es gestartet werden kann.

```shell
$ atlas deploy <FILE_PATTERN> [[FILE_PATTERN2] …]
```

#### `atlas remove`

> Alias: `atlas rm`

Entfernt ein Prozessmodell von der Engine, so dass es nicht mehr gestartet werden kann.

```shell
$ atlas remove <PROCESS_MODEL_ID> [[PROCESS_MODEL_ID2] ...]
```

### Start/Stop von Prozessen

#### `atlas start`

Startet eine Prozess-Instanz mit der angegebenen Prozessmodell-Id und StartEvent-Id.

```shell
$ atlas start <PROCESS_MODEL_ID> <START_EVENT_ID> [[PROCESS_MODEL_ID2 START_EVENT_ID2] ...]
```

#### `atlas stop`

Stoppt die Prozess-Instanz mit der angegebenen Prozess-Instanz-Id.

```shell
$ atlas stop <PROCESS_INSTANCE_ID> [[PROCESS_INSTANCE_ID2] ...]
{
  result_type: "process-instance",
  result: {
    id: "foo123"
  }
}
```

#### `atlas retry`

Setzt die Prozess-Instanz mit der angegebenen Prozess-Instanz-Id an der Activity fort, an der die Prozess-Instanz gescheitert ist.

```shell
$ atlas retry <PROCESS_INSTANCE_ID> [[PROCESS_INSTANCE_ID2] ...]
```

### Abfragen von Prozess-Modellen und Prozess-Instanzen

#### `atlas list-process-models`

> Alias: `atlas lsp`

Listet die deployten Prozes-Modelle (neuste zuerst).

```shell
$ atlas list-process-models [--limit <LIMIT>] [--sort-by-name [DIRECTION]] [--sort-by-created-at [DIRECTION]] [--filter-by-name <NAME>] [--filter-since <DATE>] [--filter-until <DATE>]
```

#### `atlas list-process-instances`

> Alias: `atlas lsi`

Listet Prozess-Instanzen (zuletzt gestartete zuerst).

```shell
$ atlas list-process-instances [--limit LIMIT]
{
  "result_type": "process-instances",
  "result": ["1", "2"]
}
```

#### `atlas list-correlations`

> Alias: `atlas lsc`

Listet Correlations (zuletzt gestartete zuerst).

```shell
$ atlas list-correlations [--limit LIMIT]
```

#### `atlas show-process-instance <ID> [[<ID2>] ...] [--correlation]`

> Alias: `atlas show`

Zeigt eine oder mehrere Prozess-Instanzen an.

```shell
$ atlas show-process-instance <ID> [[<ID2>] ...] [--correlation]
```

Grundsätzlich ist `ID` eine Prozess-Instanz-Id.

```shell
$ atlas show-process-instance e53e7b37-5fd2-4b1b-9b5f-c249de39bfa4
```

Aus Komfortgründen ist, wie bei Git, eine partielle Angabe der ID möglich, so dass der Benutzer bspw. nur das erste Glied der UUID kopieren und angeben muss.

```shell
$ atlas show e53e7b37
```

Wenn `--correlation` gegeben ist, wird die übergebene `ID` als Correlation-Id interpretiert und es werden die zugehörigen Prozess-Instanzen angezeigt.

```shell
$ atlas show-process-instance --correlation 43f3f138-f56c-4be4-ac95-9c9444c4b13c
```

### JSON-Ausgabe und Piping

Das Standard-Ausgabeformat der Ausgabe ist JSON und kann von einem Kommando zu einem anderen "gepiped" werden:

```shell
$ atlas list-process-models --filter-by-id=Maintenance. | atlas list-correlations --filter-by-state=error | atlas retry
```
