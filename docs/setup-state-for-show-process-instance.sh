#!/bin/bash

atlas deploy-files ./example/Processes/*

atlas start-process-model BuchAusleihen_erfolgreich
atlas start-process-model BuchAusleihen_fehlerhaft
atlas start-process-model BuchAusleihen_laufend