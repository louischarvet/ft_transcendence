#!/bin/bash

source_dir="common_tools"
scripts_dir="scripts"

for dir in ./*/; do
	dirname=$(basename "$dir")

	if [ "$dirname" != "$source_dir" ] && [ "$dirname" != "$scripts_dir" ]; then
		rm -rf "$dir"/"$source_dir"
	fi
done
