# Installation der Atlas.CLI

Die Atlas.CLI ist eine Komandozeilenanwendung um mit der AtlasEngine unabhängig vom BPMN-Studio / AltasStudio zu interagieren. Mithilfe der CLI können Sie Prozesse in Ihrer CI-Pipeline automatisiert auf verschiedenen Systemen deployen. Des Weiteren ist es ein praktisches Werkzeug für den Softwarebetrieb. Denn Prozessinstanzen können mithilfe der CLI beauskunftet und bei Bedarf auch gestartet, gestoppt oder fortgesetzt werden. 
Konsoleneaffine Entwickler lieben es eine Vielzahl ihrer anfallenden Tätigkeiten mit der Konsole zu erledigen oder sogar zu automatisieren.  All das ist möglich mit der Atlas.CLI!

## Installationsvoraussetzungen
* Node.js 10.0.0 oder höher auf einem Betriebssystem welches von 'Node.js' unterstützt wird. (Wenn Sie Node noch nicht installiert haben können Sie sich auf folgender Webseite informieren: https://nodejs.org/)
* npm 6.0.0 oder höher auf einem Betriebssystem welches von 'npm' unterstützt wird. (Wenn Sie Node noch nicht installiert haben können Sie sich auf folgender Webseite informieren: https://docs.npmjs.com/about-npm/)

## Installation
Nachdem die Vorrausetzungen für die Installation erfüllt sind, kann die Atlas.CLI installiert werden. Dies können Sie mit folgendem Befehl durchführen:
```shell
npm install -global @atlas-engine/cli
```
Für eine spezifische Version muss diese nach der Paketbezeichnung mit "@dist-tags" angegeben werden. Dist-Tags kennzeichnen die verschiedenen eindeutigen Versionen eines Pakets. Einen Überblick über die verschiedenen Versionen können Sie sich mit dem folgenden Befehl verschaffen:
```shell
npm show @atlas-engine/cli
```

Der Befehl für die Installation einer spezifischen Version sieht dann wie folgend aus:
```shell
npm install -global @atlas-engine/cli@beta
```