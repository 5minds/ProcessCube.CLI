# Guideline für den Betrieb

## Vorraussetzungen
* Sie müssen die Atlas.CLI installiert haben. Siehe [Installationsanleitung Atlas.CLI](./install.md)
* Sie müssen sich zuvor mithilfe der Atlas.CLI mit einer AtlasEngine verbunden haben. Siehe [Guideline CLI: Verbindung aufbauen](./guideline-CLI-connect.md)
* Laden Sie sich das [Beispiel](./example) herunter. Darin ist ein Prozess und mehrere Shell-Scripte enthalten.
  
## Deployment von Prozessen
```shell
atlas deploy-files ./example/Process/BuchAusleiheMitAusleihkarteDigital.bpmn
```

## Starten von ProzessInstanzen
```shell
atlas start-process-model BuchAusleihenMitAusleihkarte
```

* Woher bekomme ich die 


## Anzeigen von ProzessInstanzen
### Anzeigen fehlgeschlagener ProzessInstanzen
### Anzeigen erfolgreicher ProzessInstanzen
### Anzeigen laufender ProzessInstanzen

## Fortsetzen fehlgeschlagener ProzessInstanzen
### Fortsetzen einzelner ProzessInstanzen
### Fortsetzen aller ProzessInstanzen

