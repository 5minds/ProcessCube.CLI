# Guideline für den Betrieb

## Vorraussetzungen

* Sie müssen die ProcessCube CLI installiert haben, siehe [Installationsanleitung ProcessCube CLI](./installation.mdx).
* Sie müssen sich zuvor mithilfe der ProcessCube CLI mit einer 5Minds Engine verbunden haben, siehe [ProcessCube CLI: Verbindung aufbauen](./guideline-CLI-connect.md).

## Vorbereitung

1. Laden Sie sich das [Beispiel](#example) herunter und extrahieren Sie das Zip-Archiv.
2. Navigieren Sie in der Konsole/Eingabeaufforderung mithilfe des `cd`-Befehls in den extrahierten Ordner.

---
**Info:**
In dem extrahierten Ordner sind mehrere Prozesse und Scripte enthalten. Sie können jederzeit je nach Betriebssystem das Script `cleanup-state-for-show-process-instance.sh` (Linux oder macOS) `cleanup-state-for-show-process-instance.bat` (Windows) ausführen, um ihre Umgebung in den Anfangszustand zurück zu versetzen.

---

## Deployment von Prozessmodellen

Um BPMN-Prozesse mit der 5Minds Engine ausführen zu können, müssen diese zunächst an die 5Minds Engine übertragen werden. Diesen Schritt bezeichnet man als Deployment und er kann mit dem folgenden Befehl ausgeführt werden:

```shell
pc deploy-files ./example/Processes/BuchAusleihen_erfolgreich.bpmn
```

Als Ergebnis des Befehls wird zu dem deployten BPMN die `process_model_id` angezeigt:

![Ergebnis: deploy-files](./images/deploy-files_result.png "Ergebnis: deploy-files")

Die `process_model_id` ist fest im BPMN hinterlegt und gleicht häufig dem Namen der *.bpmn Datei. Jedoch kann die `process_model_id` auch von Dateinamen des BPMNs abweichen. Sie können die `process_model_id` zusätzlich mithilfe des Ergebnisses des Befehls `list-process-models` aus dem Abschnitt [Anzeigen von Prozessmodellen](#Anzeigen-von-Prozessmodellen) in der Spalte "id" identifizieren.

## Anzeigen von Prozessmodellen

Sie können sich vergewissern, welche Prozessmodelle deployed wurden, indem Sie sich alle deployten Prozessmodelle auflisten lassen. Dies können Sie mit dem folgenden Befehl realisieren:

```shell
pc list-process-models
```

Als Ergebnis werden alle deployten Prozessmodelle angezeigt:

![Ergebnis: list-process-models](./images/list-process-models_result.png "Ergebnis: list-process-models")

## Starten von Prozess-Instanzen

Nachdem das Prozessmodel deployt ist, können Sie eine Prozess-Instanz starten. Dies können Sie mit dem Befehl `start-process-model` realisieren, indem Sie die `process_model_id` als Parameter übergeben:

```shell
pc start-process-model BuchAusleihen_erfolgreich
```

Es folgt eine tabellarische Ausgabe der Eigenschaften der gestarteten Prozess-Instanz innerhalb der Konsole:

![Ergebnis des start-process-model](./images/start-process-model_result.png "Ergebnis des start-process-model")

---
**Info:**
Die angezeigte `processInstanceId` ist für jede Prozess-Instanz eindeutig.

---

## Anzeigen von Prozess-Instanzen

Im Abschnitt [Starten von Prozess-Instanzen](#Starten-von-Prozess-Instanzen) haben Sie eine Prozess-Instanz gestartet. In diesem Abschnitt soll die gestartete Prozess-Instanz angezeigt werden. Dies können Sie mit folgendem Kommando ausführen:

```shell
pc show-process-instance 08a0845e-3537-4510-a568-58ee671a6a5d
```

---
**Info:**
Als Parameter wird die `process_instance_id` von der gestarteten Prozess-Instanz übergeben. Wenn Sie den Befehl auf Ihrer Umgebung ausführen, müssen Sie die `process_instance_id` von Ihrer gestarteten Prozess-Instanz angeben. Dazu müssen Sie die `process_instance_id` aus der Ausgabe von [Starten von Prozess-Instanzen](#Starten-von-Prozess-Instanzen) nutzen.

---

Es folgt die Ausgabe der Eigenschaften der Prozess-Instanz innerhalb der Konsole:

![Ergebnis: show-process-instance](./images/show-process-instance_result.png "Ergebnis: show-process-instance")

Für die folgenden Abschnitte benötigen Sie einen definierten Status, um bei jedem Abschnitt das beschriebene Ergebnis zu erhalten. Um den definierten Status zu erreichen, führen Sie je nach Betriebssystem einen der folgenden Befehle aus:

* Linux / macOS

```shell
sh ./example/setup-state-for-show-process-instance.sh
```

* Windows

```shell
call .\example\setup-state-for-show-process-instance.bat
```

Mit diesem Befehl werden die Prozessmodelle "BuchAusleihen_erfolgreich", "BuchAusleihen_fehlerhaft" und "BuchAusleihen_laufend", die sich in dem `Processes`-Ordner befinden, deployed und gestartet.

Um sich die gestarteten Prozess-Instanzen anzeigen zu lassen, können Sie den folgenden Befehl ausführen:

```shell
pc list-process-instances
```

Als Ergebnis erhalten Sie eine tabellarische Auflistung aller Prozess-Instanzen:

![Ergebnis: list-process-instances](./images/list-process-instances_result.png "Ergebnis: list-process-instances")

Jede der aufgelisteten Prozess-Instanzen befindet sich in einem anderen Status:

* BuchAusleihen_laufend --> running
* BuchAusleihen_fehlerhaft --> error
* BuchAusleihen_erfolgreich --> finished

---
**Info:**
Es existiert noch der Status "terminated", der jedoch für dieses Beispiel irrelevant ist.

---

Die ProcessCube CLI bietet die Möglichkeit nach spezifischen Merkmalen von Prozess-Instanzen zu filtern, die auch in der integrierten Hilfe `pc list-process-instances --help` detailliert beschrieben werden. In den folgenden Abschnitten lernen Sie einige dieser Filtermöglichkeiten kennen.

### Filtern nach fehlgeschlagenen Prozess-Instanzen

```shell
pc list-process-instances --filter-by-state error
```

Als Ergebnis erhalten Sie eine tabellarische Auflistung aller Prozess-Instanzen im Status `error`:

![Ergebnis: list-process-instances](./images/list-process-instances_error_result.png "Ergebnis: list-process-instances")

### Filtern nach erfolgreicher Prozess-Instanzen

```shell
pc list-process-instances --filter-by-state finished
```

Als Ergebnis erhalten Sie eine tabellarische Auflistung aller Prozess-Instanzen im Status `finished`:

![Ergebnis: list-process-instances](./images/list-process-instances_finished_result.png "Ergebnis: list-process-instances")

### Filtern nach laufenden Prozess-Instanzen

```shell
pc list-process-instances --filter-by-state running
```

Als Ergebnis erhalten Sie eine tabellarische Auflistung aller Prozess-Instanzen im Status `running`:

![Ergebnis: list-process-instances](./images/list-process-instances_running_result.png "Ergebnis: list-process-instances")

## Wiederholen fehlgeschlagener Prozess-Instanzen

Wenn zum Beispiel ein Service der aus dem Prozess aufgerufen wird kurzzeitig nicht zur Verfügung steht, kann es vorkommen, dass Aktivitäten innerhalb des Prozesses fehlschlagen. Prozess-Instanzen werden dann in den Zustand `error` versetzt. Prozess-Instanzen in diesem Zustand können wiederholt werden. Dabei wird die zuvor fehlgeschlagene Operation erneut ausgeführt. In den folgenden Abschnitten wird beschrieben wie sie einzelne oder alle fehlgeschlagene Prozess-Instanzen wiederholen können.

### Wiederholen einzelner Prozess-Instanzen

Um einzelne Prozess-Instanzen zu wiederholen, müssen Sie zunächst die `processInstanceId` identifizieren, die Sie fortsetzen möchten. Dazu können Sie wie im Abschnitt [Filtern nach fehlgeschlagenen Prozess-Instanzen](#Filtern-nach-fehlgeschlagenen-Prozess-Instanzen) beschrieben vorgehen. Die `processInstanceId` wird als Parameter für den Befehl `pc retry-process-instance` benötigt.

```shell
pc retry-process-instance aa3db49e-c9ee-4c04-ac26-026ed31028db
```

### Wiederholen aller Prozess-Instanzen

Ergebnisse von Befehlen können mithilfe der ProcessCube CLI auch als Eingangsparameter in andere Befehle mithilfe des Pipe-Operators (`|`) umgeleitet werden. Erforderlich hierfür ist, dass die Eingabe an den Folgebefehl im JSON-Format übergeben wird. Dies können Sie realisieren, indem Sie am vorangegangen Befehl das Ausgabeformat mithilfe der `--output`-Option festlegen.
So ist es möglich zunächst alle fehlgeschlagenen Prozess-Instanzen zu ermitteln und diese im Anschluss zu wiederholen:

```shell
pc list-process-instances --filter-by-state error | pc retry-process-instance
```

Unabhängig davon, ob Sie eine einzelne oder alle fehlgeschlagenen Prozess-Instanzen wiederholt haben, wird folgende Ausgabe angezeigt:

![Ergebnis: retry-process-instance](./images/retry-process-instance_result.png "Ergebnis: retry-process-instance")
