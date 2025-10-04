#!/bin/bash

# ProcessCube CLI - Cross-Platform Installer
# Automatically detects platform and installs the correct binary

set -e

INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"
BINARY_NAME="${BINARY_NAME:-pc}"
VERSION="${VERSION:-latest}"
BASE_URL="https://github.com/5minds/ProcessCube.CLI/releases/download"

echo "🚀 ProcessCube CLI Installer"
echo "============================="

# Detect platform and architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case $OS in
    darwin)
        case $ARCH in
            arm64) PLATFORM="macos-arm64" ;;
            x86_64) PLATFORM="macos-x64" ;;
            *) echo "❌ Unsupported macOS architecture: $ARCH"; exit 1 ;;
        esac
        BINARY_FILE="pc-${PLATFORM}"
        ;;
    linux)
        case $ARCH in
            x86_64) PLATFORM="linux-x64" ;;
            *) echo "❌ Unsupported Linux architecture: $ARCH"; exit 1 ;;
        esac
        BINARY_FILE="pc-${PLATFORM}"
        ;;
    *)
        echo "❌ Unsupported operating system: $OS"
        echo "Please download manually from GitHub releases."
        exit 1
        ;;
esac

echo "✅ Detected platform: $OS-$ARCH"
echo "📦 Binary to download: $BINARY_FILE"

# Create temp directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

echo "⬇️  Downloading ProcessCube CLI..."
# Download binary (adjust URL to your actual release location)
curl -fsSL -o "$BINARY_FILE" "${BASE_URL}/${VERSION}/${BINARY_FILE}"

# Make executable
chmod +x "$BINARY_FILE"

# Test the binary
echo "🧪 Testing binary..."
./"$BINARY_FILE" --version > /dev/null

# Install to system
echo "📦 Installing to $INSTALL_DIR/$BINARY_NAME..."
sudo mv "$BINARY_FILE" "$INSTALL_DIR/$BINARY_NAME"

# Verify installation
echo "✅ Installation complete!"
echo "🎯 Version: $($INSTALL_DIR/$BINARY_NAME --version)"
echo ""
echo "Usage:"
echo "  $BINARY_NAME --help"
echo "  $BINARY_NAME deploy-files process.bpmn"
echo "  $BINARY_NAME list-process-models"

# Cleanup
cd /
rm -rf "$TEMP_DIR"

echo ""
echo "🎉 ProcessCube CLI is ready to use!"