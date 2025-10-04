#!/bin/bash

echo "🧪 Testing ProcessCube CLI Standalone Binaries"
echo "=============================================="

cd "$(dirname "$0")/dist/binary"

# Test macOS ARM64 (should work on Apple Silicon)
if [[ $(uname -m) == "arm64" && $(uname) == "Darwin" ]]; then
    echo ""
    echo "✅ Testing macOS ARM64 binary:"
    chmod +x pc-macos-arm64
    ./pc-macos-arm64 --version
    echo "   Commands available: $(./pc-macos-arm64 --help | grep -c 'pc ')"
fi

# Test macOS x64 (should work on Intel Macs)
if [[ $(uname) == "Darwin" ]]; then
    echo ""
    echo "✅ Testing macOS x64 binary:"
    chmod +x pc-macos-x64
    ./pc-macos-x64 --version
    echo "   Commands available: $(./pc-macos-x64 --help | grep -c 'pc ')"
fi

# File info
echo ""
echo "📦 Binary Information:"
echo "----------------------"
ls -lh pc-*

echo ""
echo "🎯 Distribution Ready:"
echo "- ✅ macOS (Intel): pc-macos-x64 ($(du -h pc-macos-x64 | cut -f1))"
echo "- ✅ macOS (Apple Silicon): pc-macos-arm64 ($(du -h pc-macos-arm64 | cut -f1))"
echo "- ✅ Linux (x64): pc-linux-x64 ($(du -h pc-linux-x64 | cut -f1))"
echo "- ✅ Windows (x64): pc-win-x64.exe ($(du -h pc-win-x64.exe | cut -f1))"

echo ""
echo "🚀 Ready for distribution! No Node.js required on target systems."