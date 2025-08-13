#!/bin/bash

# Script to generate .env file from .env.example
# Usage: ./generate-env.sh [path_to_env_example]

set -e  # Exit on any error

# Default path for .env.example
DEFAULT_ENV_EXAMPLE=".env.example"

# Use provided path or default
ENV_EXAMPLE_PATH="${1:-$DEFAULT_ENV_EXAMPLE}"
ENV_FILE=".env"

# Check if .env.example exists
if [ ! -f "$ENV_EXAMPLE_PATH" ]; then
    echo "❌ Error: $ENV_EXAMPLE_PATH not found!"
    echo "Please create a $ENV_EXAMPLE_PATH file first."
    exit 1
fi

# Check if .env already exists
if [ -f "$ENV_FILE" ]; then
    echo "⚠️  Warning: $ENV_FILE already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operation cancelled."
        exit 1
    fi
fi

# Copy .env.example to .env
cp "$ENV_EXAMPLE_PATH" "$ENV_FILE"

echo "✅ Successfully generated $ENV_FILE from $ENV_EXAMPLE_PATH"
echo "📝 Please edit $ENV_FILE to set your actual environment variables"

# Make the script executable
chmod +x "$0" 