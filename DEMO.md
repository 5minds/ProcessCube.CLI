# Demo der Atlas CLI

## Vorbedingungen

* Atlas CLI: `npm install -g @atlas-engine/cli`
* BPMN Studio: Es muss eine Stable-Version des Studios laufen, das seine interne ProcessEngine erfolgreich auf Port 56000 gestartet hat: http://localhost:56000
* IdentityServer: Hier sollte man ausgeloggt sein, um den Login-Prozess nachvollziehbar demonstrieren zu können: http://localhost:5000/account/logout

## Ablauf

Um sich am IdentityServer anzumelden, muss  man das `login`-Kommando mit der  URL der zu verbindenden Engine aufrufen.

```shell
atlas login http://localhost:56000
```

Nun kann man sich im IdentityServer einloggen als `bob` mit Passwort `Admin1234*`.

Anschließend können alle Prozesse auf der Engine angezeigt werden:

```shell
atlas list-process-models
```

Um das Deployment neuer und aktualisierter Diagramme zu demonstrieren, können die Diagramme aus dem `fixtures/`-Ordner in diesem Repo deployt werden.

Das folgende  Kommando wird scheitern, weil `bob` die  Rechte zum Deployment fehlen.
Es kann gut benutzt werden, um zu zeigen, wie Fehlermeldungen aussehen und dass die Ausgabe auch im JSON-Format erfolgen kann.

```shell
atlas deploy-files fixtures/*.bpmn

atlas deploy-files fixtures/*.bpmn --output json
```

Darf `bob` diese Operation nicht vornehmen, so loggen uns wieder aus.

```shell
atlas logout
```

Die Engine des Studios ist so gestartet, dass man sich vom lokalen REchner aus anonym und mit vollen Rechten (`root`-Zugang) anmelden kann:

```shell
atlas login http://localhost:56000 --root
```

Mit dieser Session darf nun definitiv deployt werden:

```shell
atlas deploy-files fixtures/*.bpmn

atlas deploy-files fixtures/*.bpmn --output json
```

Wir finden die deployten Prozesse in der Übersicht deployter Prozessmodelle:


```shell
atlas list-process-models
```

Die angezeigten Prozessmodelle können auch gefiltert werden:

```shell
atlas list-process-models --filter-by-id Wartung.
```

Die Angabe mehrerer Filter bedeutet eine Ver-ODER-ung der gesuchten Muster:

```shell
atlas list-process-models --filter-by-id Wartung. --filter-by-id E-Mail
```

... und auch dieser Output kann als JSON formattiert werden:

```shell
atlas list-process-models --filter-by-id Wartung. --output json
```

Das JSON-Ergebnis lässt "pipen".
Hierdurch kann bspw. eine Ver-UND-ung von Suchmustern erreicht werden:

```shell
atlas list-process-models --filter-by-id Wartung. --output json | atlas list-process-models --filter-by-id Mail
```



```shell
atlas list-process-models --filter-by-id Wartung. --output json | atlas list-process-models --filter-by-id String

atlas list-process-models --filter-by-id Wartung. --output json | atlas list-process-models --filter-by-id String -o json | atlas list-process-instances
```

```shell
atlas start Wartung.StringUmdrehen StartEvent_1
```

Die Prozess-Instanz-ID kann genutzt werden, um weitere Informationen über die Prozess-Instanz abzufragen:

```shell
atlas show <process-instance-id>
```

Wir sehen in diesem Output, dass der Output einen leeren  `reversedString` enthält:

```
$ atlas show <process-instance-id>

#  ... snip ...

Output "String umgedreht" (EndEvent_00hkafj)

    {
      "reversedString": ""
    }
```

Der  Grund ist, dass wir keinen `string` als Eingabewert angegeben haben.

Eingabewerte können per `--input-values` an die Engine übergeben werden:

```shell
atlas start Wartung.StringUmdrehen StartEvent_1 --input-values '{"string": "5Minds"}' --output json
```

Rufen wir `atlas start` mit dem Schalter `--wait` auf, so beendet sich die CLI erst, nachdem der Prozess zu Ende gelaufen ist und gibt das Resultat  des Prozesses (in Form der Payload des letzten Tokens)als Teil des JSON-Ergebnisses zurück.

```shell
atlas start Wartung.StringUmdrehen StartEvent_1 --input-values '{"string": "5Minds"}' --wait --output json
```

Eingabewerte können auch als Datei mittels `--input-values-from-file <filename>` oder als Pipe übergeben werden:

```shell
cat fixtures/input-values-example.json | atlas start Wartung.StringUmdrehen StartEvent_1 --input-values-from-stdin --wait --output json
```

Zu allen Kommandos existieren umfangreiche Hilfetexte.
Insbesondere die Hilfe zum Kommando `list-process-instances` ist lesenswert.

```shell
atlas list-process-instances --help
```

Eine ÜBersicht aller Kommandos findet sich selbstverständlicherweise unter:

```shell
atlas --help
```
