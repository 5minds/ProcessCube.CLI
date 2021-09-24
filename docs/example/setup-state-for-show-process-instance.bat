@echo off
:: --HAS ENDING BACKSLASH
set batdir=%~dp0
:: --MISSING ENDING BACKSLASH
:: set batdir=%CD%
pushd "%batdir%"

call pc deploy-files %batdir%\Processes\*.bpmn

call pc start-process-model BuchAusleihen_erfolgreich
call pc start-process-model BuchAusleihen_fehlerhaft
call pc start-process-model BuchAusleihen_laufend
