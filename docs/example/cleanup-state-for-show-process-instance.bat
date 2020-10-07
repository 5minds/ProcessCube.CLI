@echo off
:: --HAS ENDING BACKSLASH
set batdir=%~dp0
:: --MISSING ENDING BACKSLASH
:: set batdir=%CD%
pushd "%batdir%"

call atlas remove-process-models BuchAusleihen_erfolgreich BuchAusleihen_fehlerhaft BuchAusleihen_laufend --yes