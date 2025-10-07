#!/bin/bash

echo "🧪 Testing ProcessCube CLI Standalone Binaries"
echo "=============================================="

# Change to project root if needed
if [ ! -d "dist/binary" ]; then
    cd "$(dirname "$0")"
fi

# Check if binaries exist
if [ ! -d "dist/binary" ] || [ ! "$(ls -A dist/binary 2>/dev/null)" ]; then
    echo "❌ No binaries found in dist/binary/"
    echo "💡 Run one of these commands first:"
    echo "   - ./build-sea-macos.sh (for macOS)"
    echo "   - npm run build:binary:all (for all platforms)"
    exit 1
fi

cd "dist/binary"

# Test macOS ARM64 (should work on Apple Silicon)
if [[ $(uname -m) == "arm64" && $(uname) == "Darwin" ]]; then
    echo ""
    echo "✅ Testing macOS ARM64 binary:"
    if [ -f "pc-macos-arm64" ]; then
        chmod +x pc-macos-arm64
        echo "   Version: $(./pc-macos-arm64 --version 2>&1 | head -1)"
        echo "   Commands available: $(./pc-macos-arm64 --help 2>/dev/null | grep -c 'pc ' || echo 'N/A')"
        
        # Check binary type
        if strings pc-macos-arm64 | grep -q "NODE_SEA_BLOB"; then
            echo "   Binary type: SEA (Single Executable Application) ✨"
        else
            echo "   Binary type: PKG (Packaged Binary)"
        fi
    else
        echo "   ❌ pc-macos-arm64 not found"
    fi
fi

# Test macOS x64 (should work on Intel Macs and via Rosetta)
if [[ $(uname) == "Darwin" ]]; then
    echo ""
    echo "✅ Testing macOS x64 binary:"
    if [ -f "pc-macos-x64" ]; then
        chmod +x pc-macos-x64
        echo "   Version: $(./pc-macos-x64 --version 2>&1 | head -1)"
        echo "   Commands available: $(./pc-macos-x64 --help 2>/dev/null | grep -c 'pc ' || echo 'N/A')"
        
        # Check binary type
        if strings pc-macos-x64 | grep -q "NODE_SEA_BLOB"; then
            echo "   Binary type: SEA (Single Executable Application) ✨"
        else
            echo "   Binary type: PKG (Packaged Binary)"
        fi
    else
        echo "   ❌ pc-macos-x64 not found"
    fi
fi

# File info
echo ""
echo "📦 Binary Information:"
echo "----------------------"
ls -lh pc-* 2>/dev/null || echo "No binaries found"

echo ""
echo "🎯 Distribution Summary:"
echo "------------------------"
for binary in pc-*; do
    if [ -f "$binary" ]; then
        size=$(du -h "$binary" | cut -f1)
        platform=$(echo "$binary" | sed 's/pc-//' | sed 's/\.exe//')
        
        # Detect binary type
        if strings "$binary" | grep -q "NODE_SEA_BLOB" 2>/dev/null; then
            type="SEA"
        else
            type="PKG"
        fi
        
        echo "- ✅ $platform: $binary ($size, $type)"
    fi
done

echo ""
echo "🚀 Ready for distribution! No Node.js required on target systems."
echo ""
echo "💡 For local installation:"
echo "   sudo cp pc-macos-* /usr/local/bin/pc && chmod +x /usr/local/bin/pc"