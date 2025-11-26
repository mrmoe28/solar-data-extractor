#!/bin/bash

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to that directory
cd "$DIR"

# Run the install script
./install-auto-watcher.sh

# Keep terminal open to show results
echo ""
read -p "Press Enter to close..."
