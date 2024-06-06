# ProcessCube CLI

ProcessEngine spezifisches Tooling, welches im Rahmen von Deployment- und Debugging-Prozessen verwendet wird.

## Was sind die Ziele dieses Projekts?

Automatisierung.

## Wie kann ich das Projekt aufsetzen?


### Voraussetzungen

* Node `>= 18.0.0`
* npm `>= 10.0.0`


### Setup/Installation

```shell
$ npm install @5minds/processcube_cli
```

## Wie kann ich das Projekt benutzen?


### Benutzung

#### `pc --help`

Blendet eine Hilfe ein.

```shell
$ pc --help
pc [command]

COMMANDS

  pc session-status                                           Show status of the current session  [aliases: st]
  pc login [engine_url]                                       Log in to the given engine
  pc logout                                                   Log out from the current session
  pc deploy-files [filenames...]                              Deploy BPMN files to the engine  [aliases: deploy]
  pc remove [process_model_ids...]                            Remove deployed process models from the engine
  pc start-process-model <process_model_id> <start_event_id>  Start an instance of a deployed process model  [aliases: start]
  pc stop-process-instance [process_instance_ids...]          Stop instances with the given process instance IDs  [aliases: stop]
  pc show-process-instance [process_instance_ids...]          Show detailed information about individual process instances or correlations  [aliases: show]
  pc retry [process_instance_ids...]                          Restart failed process instances with the given process instance IDs
  pc list-process-models                                      List, sort and filter process models by ID  [aliases: lsp]
  pc list-process-instances                                   List, sort and filter process instances by date, state, process model and/or correlation  [aliases: lsi]
  pc list-correlations                                        list correlations  [aliases: lsc]

GENERAL OPTIONS

  --help, -h    Show help  [boolean] [default: false]
  --version     Show version number  [boolean]
  --output, -o  Set output  [string] [default: "text"]
```

#### `pc login`

Loggt den Benutzer auf der Engine unter der angegebenen URI ein. Resultiert in einer aktiven Session.
Eine Session speichert den erhaltenen Access-Token, so dass Folge-Befehle diese Identität verwenden können.

```shell
$ pc login <ENGINE_URI> [options]
```

Weitere Beispiele und Informationen können mit `pc login --help` abgerufen werden.

#### `pc logout`

Loggt den Benutzer aus. Löscht die Session.

```shell
$ pc logout
```

#### `pc session-status`

> Alias: `pc st`

Zeigt Informationen über die aktuell verbundene Engine und die Session an.

```shell
$ pc session-status [options]
```

Weitere Beispiele und Informationen können mit `pc session-status --help` abgerufen werden.

### Deployment

#### `pc deploy-files`

> Alias: `pc deploy`

Transportiert ein Prozessmodell auf die Engine, so dass es gestartet werden kann.

```shell
$ pc deploy-files <FILE_PATTERN> [FILE_PATTERN2…] [options]
```

Weitere Beispiele und Informationen können mit `pc deploy-files --help` abgerufen werden.

#### `pc remove-process-models`

> Alias: `pc remove`

Entfernt ein Prozessmodell von der Engine, so dass es nicht mehr gestartet werden kann.

```shell
$ pc remove <PROCESS_MODEL_ID> [PROCESS_MODEL_ID2...] [options]
```

Weitere Beispiele und Informationen können mit `pc remove-process-models --help` abgerufen werden.

### Start/Stop von Prozessen

#### `pc start-process-model`

> Alias: `pc start`

Startet eine Prozess-Instanz anhand der angegebenen Prozessmodell-Id und StartEvent-Id.

```shell
$ pc start <PROCESS_MODEL_ID> <START_EVENT_ID> [options]
```

Weitere Beispiele und Informationen können mit `pc start-process-model --help` abgerufen werden.

#### `pc stop-process-instance`

> Alias: `pc stop`

Stoppt die Prozess-Instanz mit der angegebenen Prozess-Instanz-Id.

```shell
$ pc stop <PROCESS_INSTANCE_ID> [PROCESS_INSTANCE_ID2...] [options]
```

Weitere Beispiele und Informationen können mit `pc stop-process-instance --help` abgerufen werden.

### Abfragen von Prozess-Modellen und Prozess-Instanzen

#### `pc list-process-models`

> Alias: `pc lsp`

Listet die deployten Prozes-Modelle (neuste zuerst).

```shell
$ pc list-process-models [options]
```

Weitere Beispiele und Informationen können mit `pc list-process-models --help` abgerufen werden.

#### `pc list-process-instances`

> Alias: `pc lsi`

Listet Prozess-Instanzen (zuletzt gestartete zuerst).

```shell
$ pc list-process-instances [options]
```

Weitere Beispiele und Informationen können mit `pc list-process-instances --help` abgerufen werden.

#### `pc show-process-instance`

> Alias: `pc show`

Zeigt eine oder mehrere Prozess-Instanzen an.

```shell
$ pc show-process-instance <ID> [<ID2>...] [options]
```

Grundsätzlich ist `ID` eine Prozess-Instanz-Id.

```shell
$ pc show-process-instance e53e7b37-5fd2-4b1b-9b5f-c249de39bfa4
```

Wenn `--correlation` gegeben ist, wird die übergebene `ID` als Correlation-Id interpretiert und es werden die zugehörigen Prozess-Instanzen angezeigt.

```shell
$ pc show-process-instance --correlation 43f3f138-f56c-4be4-ac95-9c9444c4b13c
```

Weitere Beispiele und Informationen können mit `pc show-process-instance --help` abgerufen werden.

### JSON-Ausgabe und Piping

Das Standard-Ausgabeformat der Ausgabe ist JSON und kann von einem Kommando zu einem anderen "gepiped" werden:

```shell
$ pc list-process-models --filter-by-id=Maintenance. | pc list-correlations --filter-by-state=error | pc retry
```
