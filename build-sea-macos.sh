#!/bin/bash

# Build SEA (Single Executable Application) for macOS
# This script creates standalone binaries that avoid code signing issues

set -e

echo "🔧 Building ProcessCube CLI SEA binaries for macOS..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/binary
mkdir -p dist/binary

# Build the main JavaScript bundle
echo "📦 Building JavaScript bundle..."
npm run build

# Generate SEA blob
echo "🔗 Generating SEA blob..."
node --experimental-sea-config sea-config.json

# Detect current architecture
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    CURRENT_ARCH="arm64"
else
    CURRENT_ARCH="x64"
fi

# Copy Node.js binary 
cp $(which node) dist/binary/pc-macos-$CURRENT_ARCH

# Try using a different approach - remove the existing fuse first if it exists
echo "🔗 Attempting to patch and inject SEA blob..."

# Method 1: Try direct injection with overwrite
if npx postject dist/binary/pc-macos-$CURRENT_ARCH NODE_SEA_BLOB dist/pc.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA \
    --overwrite 2>/dev/null; then
    echo "✅ SEA injection successful with --overwrite"
else
    echo "⚠️  Trying fallback method..."
    # Method 2: Try with different sentinel name
    if npx postject dist/binary/pc-macos-$CURRENT_ARCH NODE_SEA_BLOB dist/pc.blob \
        --sentinel-fuse NODE_SEA_FUSE_$(openssl rand -hex 16) \
        --macho-segment-name NODE_SEA 2>/dev/null; then
        echo "✅ SEA injection successful with custom sentinel"
    else
        echo "❌ SEA injection failed. Falling back to pkg binary..."
        rm -f dist/binary/pc-macos-$CURRENT_ARCH
        # Fallback to pkg if SEA fails
        npx pkg dist/pc.js --out-path=dist/binary --targets=latest-macos-$CURRENT_ARCH
        # pkg creates the binary with a generic name, rename it
        if [ -f dist/binary/pc ]; then
            mv dist/binary/pc dist/binary/pc-macos-$CURRENT_ARCH
        fi
        echo "✅ PKG binary created as fallback"
    fi
fi

echo "✅ Binary created: dist/binary/pc-macos-$CURRENT_ARCH"
echo ""
echo "🎉 To test the binary run:"
echo "   ./dist/binary/pc-macos-$CURRENT_ARCH --help"
echo ""

# Check what type of binary was created
if file dist/binary/pc-macos-$CURRENT_ARCH | grep -q "Mach-O"; then
    if strings dist/binary/pc-macos-$CURRENT_ARCH | grep -q "NODE_SEA_BLOB"; then
        echo "✅ SEA (Single Executable Application) binary created successfully!"
        echo "💡 SEA binaries don't require code signing and should work without issues on macOS!"
    else
        echo "✅ PKG binary created successfully as SEA fallback!"
        echo "⚠️  Note: PKG binaries may show macOS security warnings on first run."
        echo "   Go to System Preferences > Security & Privacy and click 'Allow Anyway'"
    fi
else
    echo "⚠️  Unknown binary type created"
fi