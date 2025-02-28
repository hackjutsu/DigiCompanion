#!/bin/bash

# Script to package a Chrome extension for store publishing
# Works on WSL, Linux, and macOS

# Get extension name from manifest.json
NAME=$(grep -o '"name": "[^"]*"' manifest.json | head -1 | cut -d'"' -f4 | tr ' ' '-' | tr -d "'" | tr '[:upper:]' '[:lower:]')
# Get version from manifest.json
VERSION=$(grep -o '"version": "[^"]*"' manifest.json | cut -d'"' -f4)
TEMP_DIR="temp_package"
ZIP_NAME="${NAME}-v${VERSION}.zip"

# Determine the appropriate zip command
if grep -qi microsoft /proc/version; then
    # Running in WSL
    if command -v 7z.exe &> /dev/null; then
        echo "Using Windows 7-Zip in WSL"
        ZIP_CMD="7z.exe a -tzip"
    elif command -v zip &> /dev/null; then
        echo "Using zip in WSL"
        ZIP_CMD="zip -r"
    else
        echo "Error: Neither 7z.exe nor zip is installed"
        echo "Please install one of the following:"
        echo "  For WSL: Install 7-Zip on Windows or run 'sudo apt-get install zip' in WSL"
        exit 1
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # Running on macOS
    if ! command -v zip &> /dev/null; then
        echo "Error: zip is not installed on your Mac"
        echo "Please install zip using: brew install zip"
        exit 1
    fi
    echo "Using zip on macOS"
    ZIP_CMD="zip -r"
else
    # Running on Linux
    if ! command -v zip &> /dev/null; then
        echo "Error: zip is not installed"
        echo "Please install zip using: sudo apt-get install zip"
        exit 1
    fi
    echo "Using zip on Linux"
    ZIP_CMD="zip -r"
fi

echo "Packaging extension: $NAME (version $VERSION)"

# Create clean temp directory
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Detect directories to include
DIRS=()
for dir in */; do
    # Skip the temp directory and hidden directories
    if [[ "$dir" != "$TEMP_DIR/" && "$dir" != ".*/" ]]; then
        dir_name="${dir%/}"
        # Skip node_modules and other common directories that shouldn't be packaged
        if [[ "$dir_name" != "node_modules" && "$dir_name" != ".git" && "$dir_name" != "dist" && "$dir_name" != "build" ]]; then
            DIRS+=("$dir_name")
            mkdir -p "$TEMP_DIR/$dir_name"
        fi
    fi
done

# Copy directories
for dir in "${DIRS[@]}"; do
    echo "Copying directory: $dir"
    cp -r "$dir"/* "$TEMP_DIR/$dir/" 2>/dev/null || true
done

# List of common extension files to include from root
COMMON_FILES=(
    "manifest.json"
    "background.js"
    "content.js"
    "popup.js"
    "popup.html"
    "options.js"
    "options.html"
    "README.md"
    "PRIVACY.md"
    "LICENSE"
)

# Copy each file from root
for file in "${COMMON_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Copying file: $file"
        cp "$file" "$TEMP_DIR/"
    fi
done

# Copy any additional JS files in the root
for file in *.js; do
    if [ -f "$file" ] && [[ ! " ${COMMON_FILES[@]} " =~ " ${file} " ]]; then
        echo "Copying additional JS file: $file"
        cp "$file" "$TEMP_DIR/"
    fi
done

# Copy any additional HTML files in the root
for file in *.html; do
    if [ -f "$file" ] && [[ ! " ${COMMON_FILES[@]} " =~ " ${file} " ]]; then
        echo "Copying additional HTML file: $file"
        cp "$file" "$TEMP_DIR/"
    fi
done

# Copy any additional CSS files in the root
for file in *.css; do
    if [ -f "$file" ]; then
        echo "Copying CSS file: $file"
        cp "$file" "$TEMP_DIR/"
    fi
done

# Create zip file
echo "Creating zip file: $ZIP_NAME"
cd "$TEMP_DIR"
$ZIP_CMD "../$ZIP_NAME" ./*
cd ..

# Clean up
rm -rf "$TEMP_DIR"

echo "Package created: $ZIP_NAME"
echo "Ready for Chrome Web Store upload!"