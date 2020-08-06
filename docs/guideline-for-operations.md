# Guideline für den Betrieb

## Vorraussetzungen

* Sie müssen die Atlas.CLI installiert haben. Siehe [Installationsanleitung Atlas.CLI](./install.md)
* Sie müssen sich zuvor mithilfe der Atlas.CLI mit einer AtlasEngine verbunden haben. Siehe [Guideline CLI: Verbindung aufbauen](./guideline-CLI-connect.md)
* Laden Sie sich das [Beispiel](./example) herunter. Darin sind mehrere Prozesse und Shell-Scripte enthalten.
  
## Deployment von Prozessmodellen
Um BPMN-Prozesse mit der AtlasEngine ausführen zu können müssen diese zunächst an die AtlasEngine übertragen werden. Diese Schritt bezeichnet man als Deployment und kann mit dem folgenden Befehl ausgeführt werden: 
```shell
atlas deploy-files ./example/Processes/BuchAusleihen_erfolgreich.bpmn
```
Als Ergebis des Befehls wird zu dem deployten BPMN die "process_model_id" angezeigt:
![Ergebnis des deploy-files](./example/deploy-files_result.png "Ergebnis des deploy-files")

Die "process_model_id" ist fest im BPMN hinterlegt und gleicht häufig dem Namen der *.bpmn Datei. Jedoch kann die "process_model_id" auch von Dateinamen des BPMNs abweichen. Sie können die "process_model_id" zusätzlich mithilfe des Ergebnisses des Befehls `list-process-models` aus dem Abschnitt [Anzeigen von Prozessmodellen](#Anzeigen-von-Prozessmodellen) in der Spalte "id" identifizieren.

## Anzeigen von Prozessmodellen
Sie können sich vergewissern, welche Prozessmodelle deployed wurden, indem Sie sich alle deployten Prozessmodelle auflisten lassen. Dies können Sie mit dem folgenden Befehl realiseren:
```shell
atlas list-process-models
```
Als Ergebnis werden alle deployten Prozessmodelle angezeigt: 
![Ergebnis des list-process-models](./example/list-process-models_result.png "Ergebnis des list-process-models")

## Starten von Prozess-Instanzen
Nachdem das Prozessmodel deployed ist können Sie eine Prozess-Instanz starten. Dies können Sie mit dem Befehl `start-process-model` realisieren, indem Sie die "process_model_id" als Parameter übergeben:
```shell
atlas start-process-model BuchAusleihen_erfolgreich
```


Es folgt eine tabellarische Ausgabe der Eigenschaften der gestarteten ProzessInstanz innerhalb der Konsole:
![Ergebnis des start-process-model](./example/start-process-model_result.png "Ergebnis des start-process-model")

**Info**

Die angezeigte `processInstanceId` ist das Eindeutigkeitskriterium einer jeden Prozess-Instanz.

## Anzeigen von Prozess-Instanzen

Im Abschnitt [Starten von Prozess-Instanzen](#Starten-von-Prozess-Instanzen) haben Sie eine Prozess-Instanz gestartet. In diesem Abschnitt soll die gestarte Prozess-Instanz angezeigt werden. Dies können Sie mit folgendem Kommando ausführen:
```shell
atlas show-process-instance 'c29ebb9c-6561-4b0d-b1c5-aa7668bdd530'
```
**Info**

Als Parameter wird die `processInstanceId` von der gestarteten Prozess-Instanz übergeben. Wenn Sie den Befehl auf Ihrer Umgebung ausführen, müssen Sie die `processInstanceId` von Ihrer gestarteten Prozess-Instanz angeben. Dazu müssen Sie die `processInstanceId` aus der Ausgabe von [Starten von Prozess-Instanzen](#Starten-von-Prozess-Instanzen) nutzen.

Es folgt die Ausgabe der Eigenschaften der Prozess-Instanz innerhalb der Konsole:
![Ergebnis des show-process-instance](./example/show-process-instance_result.png "Ergebnis des show-process-instance")

Für die folgenden Abschnitte benötigen Sie einen definierten Status um bei jedem Abschnitt das beschriebene Ergebnis zu erhalten. Um den definierten Status zu erreichen führen Sie einfach folgenden Befehl aus:
```shell
sh setup-state-for-show-process-instance.sh
```
Mit diesem Befehl werden die Prozessmodelle "BuchAusleihen_erfolgreich", "BuchAusleihen_fehlerhaft" und "BuchAusleihen_laufend" die sich in dem "Processes"-Ordner befinden deployed und gestartet.

### Anzeigen fehlgeschlagener Prozess-Instanzen
### Anzeigen erfolgreicher Prozess-Instanzen
### Anzeigen laufender Prozess-Instanzen

## Fortsetzen fehlgeschlagener Prozess-Instanzen
### Fortsetzen einzelner Prozess-Instanzen
### Fortsetzen aller Prozess-Instanzen

