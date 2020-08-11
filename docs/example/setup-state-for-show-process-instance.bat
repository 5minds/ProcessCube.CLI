
SET DIRNAME=%cd%

atlas deploy-files %DIRNAME%/Processes/*.bpmn

atlas start-process-model BuchAusleihen_erfolgreich
atlas start-process-model BuchAusleihen_fehlerhaft
atlas start-process-model BuchAusleihen_laufend