# macOS Binary Builds - SEA mit PKG Fallback

Dieses Dokument erklärt, wie Sie optimierte Binaries für ProcessCube CLI erstellen, die die Code-Signierungsprobleme unter macOS umgehen.

## Problem mit Code-Signierung unter macOS

Standard-Binaries haben auf macOS Probleme:
- macOS Gatekeeper blockiert unsignierte Binaries
- Code-Signierung erfordert Apple Developer Account und Zertifikate
- Komplexe Notarisierungsprozesse

## Lösung: Hybridansatz (SEA + PKG Fallback)

Unser Build-System versucht zuerst **SEA (Single Executable Application)**, fällt dann auf **PKG** zurück:

### 1. **SEA (Bevorzugt)** - Node.js v20+
- Native Node.js SEA-Funktionalität
- Kein Code-Signing erforderlich
- Beste Kompatibilität und Performance

### 2. **PKG (Fallback)** - Wenn SEA fehlschlägt
- Bewährte Alternative
- Funktioniert zuverlässig auf allen macOS Versionen
- Minimale Sicherheitswarnungen

## Lokale Entwicklung

### Schnell-Build für aktuelles System:
```bash
./build-sea-macos.sh
```

### Manuelle Builds:

**Alle Plattformen:**
```bash
npm run build:sea:all
```

**Nur macOS:**
```bash
npm run build:sea:macos-x64
npm run build:sea:macos-arm64
```

**Einzelne Plattformen:**
```bash
npm run build:sea:linux-x64
npm run build:sea:win-x64
```

## GitHub Actions

Der GitHub Workflow ist so konfiguriert, dass:
- **Linux und Windows**: PKG-Binaries (funktionieren ohne Probleme)
- **macOS**: SEA-Binaries (umgehen Code-Signierung)

## Installation der SEA-Binaries

### macOS Users:

1. **Download:**
   ```bash
   curl -L -o pc https://github.com/5minds/ProcessCube.CLI/releases/latest/download/pc-macos-arm64
   # oder für Intel Macs:
   curl -L -o pc https://github.com/5minds/ProcessCube.CLI/releases/latest/download/pc-macos-x64
   ```

2. **Ausführbar machen:**
   ```bash
   chmod +x pc
   ```

3. **Beim ersten Start:** macOS zeigt möglicherweise eine Sicherheitswarnung
   - Gehe zu **System Preferences > Security & Privacy**
   - Klicke auf **"Allow Anyway"**

4. **Installation:**
   ```bash
   sudo mv pc /usr/local/bin/
   pc --help
   ```

## Vorteile der SEA-Lösung

✅ **Keine Code-Signierung nötig**  
✅ **Native Node.js Performance**  
✅ **Kleinere Binary-Größe**  
✅ **Einfachere CI/CD Pipeline**  
✅ **Weniger Abhängigkeiten**  

## Technische Details

- SEA-Binaries enthalten das komplette Node.js Runtime + unsere Anwendung
- `postject` Tool injiziert unseren Code in das Node.js Binary
- `--experimental-sea-config` verwendet die sea-config.json
- macOS-spezifische `--macho-segment-name` Konfiguration

## Troubleshooting

**Binary wird nicht ausgeführt:**
```bash
# Überprüfe Permissions
ls -la pc

# Überprüfe ob Binary korrekt erstellt wurde
file pc

# Teste direkt
./pc --help
```

**macOS Sicherheitswarnung:**
- Gehe zu System Preferences > Security & Privacy
- Klicke "Allow Anyway" für das ProcessCube CLI Binary
- Oder verwende: `sudo spctl --add --label "ProcessCube CLI" ./pc`