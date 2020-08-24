@echo off
:: --HAS ENDING BACKSLASH
set batdir=%~dp0
:: --MISSING ENDING BACKSLASH
:: set batdir=%CD%
pushd "%batdir%"

call atlas deploy-files %batdir%\Processes\*.bpmn

call atlas start-process-model BuchAusleihen_erfolgreich
call atlas start-process-model BuchAusleihen_fehlerhaft
call atlas start-process-model BuchAusleihen_laufend