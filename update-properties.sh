#!/bin/bash

# Script to automatically update property image lists in script.js
# Run this script whenever you add new images to the properties folders

echo "🔍 Scanning properties directories..."

# Define the properties base directory
PROPERTIES_DIR="media/properties"
SCRIPT_FILE="script.js"

# Check if directories exist
if [ ! -d "$PROPERTIES_DIR" ]; then
    echo "❌ Error: $PROPERTIES_DIR directory not found!"
    exit 1
fi

if [ ! -f "$SCRIPT_FILE" ]; then
    echo "❌ Error: $SCRIPT_FILE not found!"
    exit 1
fi

# Function to get images from a directory
get_images() {
    local dir="$1"
    if [ -d "$dir" ]; then
        # Find all image files (case insensitive) and format as JSON array
        find "$dir" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) -printf '"%f",\n' | sort
    fi
}

# Function to generate property data
generate_property_data() {
    local property_folder="$1"
    local property_path="$PROPERTIES_DIR/$property_folder"
    
    echo "📁 Processing: $property_folder"
    
    # Get images from original and remodel folders
    local original_images=$(get_images "$property_path/original")
    local remodel_images=""
    
    # Check for both "remodel" and "Remodel" folders
    if [ -d "$property_path/remodel" ]; then
        remodel_images=$(get_images "$property_path/remodel")
        remodel_folder="remodel"
    elif [ -d "$property_path/Remodel" ]; then
        remodel_images=$(get_images "$property_path/Remodel")
        remodel_folder="Remodel"
    else
        echo "⚠️  No remodel folder found for $property_folder"
        remodel_folder="remodel"
    fi
    
    # Remove trailing comma from image lists
    original_images=$(echo "$original_images" | sed 's/,$//')
    remodel_images=$(echo "$remodel_images" | sed 's/,$//')
    
    # Count images
    original_count=$(echo "$original_images" | grep -c '"' || echo "0")
    remodel_count=$(echo "$remodel_images" | grep -c '"' || echo "0")
    
    echo "   📸 Original images: $original_count"
    echo "   📸 Remodel images: $remodel_count"
    
    # Generate property object (you'll need to customize name, address, and improvements)
    cat << EOF
            {
                name: "$property_folder",
                address: "Address for $property_folder",
                folder: "$property_folder",
                improvements: [
                    "Complete Kitchen Renovation",
                    "Bathroom Modernization",
                    "Flooring Upgrades",
                    "Fresh Paint Throughout",
                    "Updated Fixtures & Hardware",
                    "Landscaping Improvements"
                ],
                images: {
                    original: [
                        $original_images
                    ],
                    remodel: [
                        $remodel_images
                    ]
                },
                folders: {
                    original: "original",
                    remodel: "$remodel_folder"
                }
            }
EOF
}

# Create backup of original script.js
cp "$SCRIPT_FILE" "$SCRIPT_FILE.backup"
echo "💾 Created backup: $SCRIPT_FILE.backup"

# Generate new properties data
echo "🔄 Generating new properties data..."

properties_data=""
property_count=0

# Loop through all property directories
for property_dir in "$PROPERTIES_DIR"/*; do
    if [ -d "$property_dir" ]; then
        property_name=$(basename "$property_dir")
        
        # Skip if it's not a property directory (e.g., if it contains properties.json)
        if [ "$property_name" != "properties.json" ] && [ -d "$property_dir/original" -o -d "$property_dir/remodel" -o -d "$property_dir/Remodel" ]; then
            if [ $property_count -gt 0 ]; then
                properties_data="$properties_data,"
            fi
            properties_data="$properties_data$(generate_property_data "$property_name")"
            property_count=$((property_count + 1))
        fi
    fi
done

# Create the new properties array
new_properties_section="        // PROPERTIES_DATA_START - Do not modify this line
        this.properties = [
$properties_data
        ];
        // PROPERTIES_DATA_END - Do not modify this line"

# Replace the properties section in script.js
awk -v new_section="$new_properties_section" '
    /PROPERTIES_DATA_START/ { 
        print new_section
        skip = 1
        next
    }
    /PROPERTIES_DATA_END/ { 
        skip = 0
        next
    }
    !skip { print }
' "$SCRIPT_FILE.backup" > "$SCRIPT_FILE"

echo "✅ Updated $SCRIPT_FILE with $property_count properties"
echo "🎉 Done! Refresh your browser to see the changes."
echo ""
echo "📝 Note: You may want to manually update property names and addresses in script.js"
echo "🔧 To customize a property, edit the generated data between the PROPERTIES_DATA_START and PROPERTIES_DATA_END markers"