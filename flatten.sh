#!/bin/bash

# Check if a directory path is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <directory_path>"
    exit 1
fi

# Set the target directory
target_dir="$1"

# Check if the directory exists
if [ ! -d "$target_dir" ]; then
    echo "Error: Directory does not exist"
    exit 1
fi

# Create a temporary directory
temp_dir=$(mktemp -d)

# Find all files in the target directory and its subdirectories
# then copy them to the temporary directory with flattened names
find "$target_dir" -type f -print0 | while IFS= read -r -d '' file; do
    # Generate a unique name for each file
    base_name=$(basename "$file")
    counter=1
    new_name="$base_name"
    while [ -e "$temp_dir/$new_name" ]; do
        new_name="${base_name%.*}_$counter.${base_name##*.}"
        ((counter++))
    done
    cp "$file" "$temp_dir/$new_name"
done

# Create the zip file
zip_file="${target_dir##*/}_flattened.zip"
(cd "$temp_dir" && zip -r "$OLDPWD/$zip_file" .)

# Clean up the temporary directory
rm -rf "$temp_dir"

echo "Flattened zip file created: $zip_file"