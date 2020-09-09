#!/bin/bash

DIRNAME=$(cd "$(dirname "${0}")" && pwd)

atlas deploy-files $DIRNAME/Processes/*.bpmn

atlas start-process-model BuchAusleihen_erfolgreich
atlas start-process-model BuchAusleihen_fehlerhaft
atlas start-process-model BuchAusleihen_laufend