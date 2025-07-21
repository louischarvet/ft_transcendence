#!/bin/bash

source_dir="common_tools"
scripts_dir="scripts"

for dir in ./*/; do
    dirname=$(basename "$dir")

    if [ "$dirname" != "$source_dir" ] && [ "$dirname" != "$scripts_dir" ]; then
        cp -r "$source_dir"/ "$dir"
    fi
done
