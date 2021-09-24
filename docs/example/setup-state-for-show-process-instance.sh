#!/bin/bash

DIRNAME=$(cd "$(dirname "${0}")" && pwd)

pc deploy-files $DIRNAME/Processes/*.bpmn

pc start-process-model BuchAusleihen_erfolgreich
pc start-process-model BuchAusleihen_fehlerhaft
pc start-process-model BuchAusleihen_laufend
