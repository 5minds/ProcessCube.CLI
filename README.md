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
atlas [command]

COMMANDS

  atlas session-status                                           Show status of the current session  [aliases: st]
  atlas login [engine_url]                                       Log in to the given engine
  atlas logout                                                   Log out from the current session
  atlas deploy-files [filenames...]                              Deploy BPMN files to the engine  [aliases: deploy]
  atlas remove [process_model_ids...]                            Remove deployed process models from the engine
  atlas start-process-model <process_model_id> <start_event_id>  Start an instance of a deployed process model  [aliases: start]
  atlas stop-process-instance [process_instance_ids...]          Stop instances with the given process instance IDs  [aliases: stop]
  atlas show-process-instance [process_instance_ids...]          Show detailed information about individual process instances or correlations  [aliases: show]
  atlas retry [process_instance_ids...]                          Restart failed process instances with the given process instance IDs
  atlas list-process-models                                      List, sort and filter process models by ID  [aliases: lsp]
  atlas list-process-instances                                   List, sort and filter process instances by date, state, process model and/or correlation  [aliases: lsi]
  atlas list-correlations                                        list correlations  [aliases: lsc]

GENERAL OPTIONS

  --help, -h    Show help  [boolean] [default: false]
  --version     Show version number  [boolean]
  --output, -o  Set output  [string] [default: "text"]
```

#### `atlas login`

Loggt den Benutzer auf der Engine unter der angegebenen URI ein. Resultiert in einer aktiven Session.
Eine Session speichert den erhaltenen Access-Token, so dass Folge-Befehle diese Identität verwenden können.

```shell
$ atlas login <ENGINE_URI> [options]
```

Weitere Beispiele und Informationen können mit `atlas login --help` abgerufen werden.

#### `atlas logout`

Loggt den Benutzer aus. Löscht die Session.

```shell
$ atlas logout
```

#### `atlas session-status`

> Alias: `atlas st`

Zeigt Informationen über die aktuell verbundene Engine und die Session an.

```shell
$ atlas session-status [options]
```

Weitere Beispiele und Informationen können mit `atlas session-status --help` abgerufen werden.

### Deployment

#### `atlas deploy-files`

> Alias: `atlas deploy`

Transportiert ein Prozessmodell auf die Engine, so dass es gestartet werden kann.

```shell
$ atlas deploy-files <FILE_PATTERN> [FILE_PATTERN2…] [options]
```

Weitere Beispiele und Informationen können mit `atlas deploy-files --help` abgerufen werden.

#### `atlas remove-process-models`

> Alias: `atlas remove`

Entfernt ein Prozessmodell von der Engine, so dass es nicht mehr gestartet werden kann.

```shell
$ atlas remove <PROCESS_MODEL_ID> [PROCESS_MODEL_ID2...] [options]
```

Weitere Beispiele und Informationen können mit `atlas remove-process-models --help` abgerufen werden.

### Start/Stop von Prozessen

#### `atlas start-process-model`

> Alias: `atlas start`

Startet eine Prozess-Instanz anhand der angegebenen Prozessmodell-Id und StartEvent-Id.

```shell
$ atlas start <PROCESS_MODEL_ID> <START_EVENT_ID> [options]
```

Weitere Beispiele und Informationen können mit `atlas start-process-model --help` abgerufen werden.

#### `atlas stop-process-instance`

> Alias: `atlas stop`

Stoppt die Prozess-Instanz mit der angegebenen Prozess-Instanz-Id.

```shell
$ atlas stop <PROCESS_INSTANCE_ID> [PROCESS_INSTANCE_ID2...] [options]
```

Weitere Beispiele und Informationen können mit `atlas stop-process-instance --help` abgerufen werden.

### Abfragen von Prozess-Modellen und Prozess-Instanzen

#### `atlas list-process-models`

> Alias: `atlas lsp`

Listet die deployten Prozes-Modelle (neuste zuerst).

```shell
$ atlas list-process-models [options]
```

Weitere Beispiele und Informationen können mit `atlas list-process-models --help` abgerufen werden.

#### `atlas list-process-instances`

> Alias: `atlas lsi`

Listet Prozess-Instanzen (zuletzt gestartete zuerst).

```shell
$ atlas list-process-instances [options]
```

Weitere Beispiele und Informationen können mit `atlas list-process-instances --help` abgerufen werden.

#### `atlas show-process-instance`

> Alias: `atlas show`

Zeigt eine oder mehrere Prozess-Instanzen an.

```shell
$ atlas show-process-instance <ID> [<ID2>...] [options]
```

Grundsätzlich ist `ID` eine Prozess-Instanz-Id.

```shell
$ atlas show-process-instance e53e7b37-5fd2-4b1b-9b5f-c249de39bfa4
```

Wenn `--correlation` gegeben ist, wird die übergebene `ID` als Correlation-Id interpretiert und es werden die zugehörigen Prozess-Instanzen angezeigt.

```shell
$ atlas show-process-instance --correlation 43f3f138-f56c-4be4-ac95-9c9444c4b13c
```

Weitere Beispiele und Informationen können mit `atlas show-process-instance --help` abgerufen werden.

### JSON-Ausgabe und Piping

Das Standard-Ausgabeformat der Ausgabe ist JSON und kann von einem Kommando zu einem anderen "gepiped" werden:

```shell
$ atlas list-process-models --filter-by-id=Maintenance. | atlas list-correlations --filter-by-state=error | atlas retry
```
