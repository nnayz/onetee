#!/bin/bash

# Script to generate .env files from env.example files
# Usage: ./generate-env.sh [directory] [env_example_name]

set -e  # Exit on any error

# Default values
DEFAULT_DIR="."
DEFAULT_ENV_EXAMPLE=".env.example"

# Use provided values or defaults
TARGET_DIR="${1:-$DEFAULT_DIR}"
ENV_EXAMPLE_NAME="${2:-$DEFAULT_ENV_EXAMPLE}"

# Function to generate .env file
generate_env() {
    local dir="$1"
    local env_example="$2"
    
    local env_example_path="$dir/$env_example"
    local env_file="$dir/.env"
    
    echo "🔍 Checking $env_example_path..."
    
    # Check if env.example exists
    if [ ! -f "$env_example_path" ]; then
        echo "❌ Error: $env_example_path not found!"
        return 1
    fi
    
    # Check if .env already exists
    if [ -f "$env_file" ]; then
        echo "⚠️  Warning: $env_file already exists!"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "⏭️  Skipping $env_file"
            return 0
        fi
    fi
    
    # Copy env.example to .env
    cp "$env_example_path" "$env_file"
    echo "✅ Successfully generated $env_file from $env_example_path"
}

# Main execution
echo "🚀 OneTee Environment Generator"
echo "================================"

# Generate .env for backend directory
if [ -d "backend" ]; then
    echo ""
    echo "📁 Processing backend directory..."
    if [ -f "backend/.env.example" ]; then
        generate_env "backend" ".env.example"
    else
        echo "⚠️  Warning: backend/.env.example not found!"
    fi
fi

# Generate .env for frontend directory
if [ -d "frontend" ]; then
    echo ""
    echo "📁 Processing frontend directory..."
    if [ -f "frontend/.env.example" ]; then
        generate_env "frontend" ".env.example"
    else
        echo "⚠️  Warning: frontend/.env.example not found!"
    fi
fi

echo ""
echo "🎉 Environment generation completed!"
echo "📝 Please edit the generated .env files to set your actual environment variables"
echo ""
echo "💡 Tip: This script automatically processes backend and frontend directories"
echo "   Make sure to create .env.example files in each directory if they don't exist"

# Make the script executable
chmod +x "$0" 