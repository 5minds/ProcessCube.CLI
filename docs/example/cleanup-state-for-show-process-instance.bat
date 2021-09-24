@echo off
:: --HAS ENDING BACKSLASH
set batdir=%~dp0
:: --MISSING ENDING BACKSLASH
:: set batdir=%CD%
pushd "%batdir%"

call pc remove-process-models BuchAusleihen_erfolgreich BuchAusleihen_fehlerhaft BuchAusleihen_laufend --yes
