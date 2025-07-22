#!/bin/bash

output_file="snapshot_selections.txt"
copy_files_mode=false

# Check for flag
if [[ "$1" == "--copy-files" ]]; then
  copy_files_mode=true
fi

file_list=$(cat <<'EOF'

proj/comp/listener/src/errors.ts proj/comp/listener/src/formatters.ts proj/comp/listener/src/index.ts proj/comp/listener/src/listener.ts proj/comp/listener/src/types.ts proj/comp/listener/src/utils.ts proj/comp/listener/doc/ABSTRACT.md proj/comp/listener/doc/API.md proj/comp/listener/doc/ARCH.md proj/comp/listener/test/integration/listener-workflow.test.ts proj/comp/listener/test-data/integration/listener-workflow.md proj/comp/listener/test-data/startListener.json replacer/replacer_llm_instructions.md xd5_ref.md

/Users/stuart/repos/clada/replacer/replacer_llm_instructions.md
/Users/stuart/repos/clada/xd5_ref.md
/Users/stuart/repos/clada/unified-design.yaml
EOF
)

# Extract, split, de-duplicate
unique_files=$(echo "$file_list" | tr ' \n' '\n' | grep -v '^$' | sort -u)

# Count files
file_count=$(echo "$unique_files" | wc -l)

if $copy_files_mode; then
  # Save file paths to a temporary file
  temp_list_file="/tmp/attached-file-paths.txt"
  echo "$unique_files" > "$temp_list_file"

  # Build AppleScript list of POSIX file references, including the temp file
  file_refs=$(echo "$unique_files" | awk '{printf "\"POSIX file \\\"%s\\\"\",", $0}')
  file_refs+="\"POSIX file \\\"$temp_list_file\\\"\""

  # Copy all files (plus the path list file) to clipboard
  osascript <<EOF
  set theFiles to {$file_refs}
  set the clipboard to theFiles
EOF

  echo "📁 Copied $file_count file references (plus path list) to macOS clipboard"
  echo "📝 Path list saved at $temp_list_file"
else
  echo "$unique_files" | while read -r file; do
    {
      echo "=== START FILE: $file ==="
      cat "$file"
      echo
      echo "=== END FILE: $file ==="
      echo
    }
  done | tee "$output_file" | pbcopy
  echo "✅ Concatenated $file_count files into $output_file"
fi

# proj/comp/listener/src/errors.ts proj/comp/listener/src/formatters.ts proj/comp/listener/src/index.ts proj/comp/listener/src/listener.ts proj/comp/listener/src/types.ts proj/comp/listener/src/utils.ts proj/comp/listener/doc/ABSTRACT.md proj/comp/listener/doc/API.md proj/comp/listener/doc/ARCH.md proj/comp/listener/test/integration/listener-workflow.test.ts proj/comp/listener/test-data/integration/listener-workflow.md proj/comp/listener/test-data/startListener.json replacer/replacer_llm_instructions.md xd5_ref.md



# /Users/stuart/repos/clada/proj/comp/sham-action-parser/doc/ABSTRACT.md
# /Users/stuart/repos/clada/proj/comp/sham-action-parser/doc/API.md
# /Users/stuart/repos/clada/proj/comp/sham-action-parser/doc/ARCH.md

# /Users/stuart/repos/clada/proj/comp/fs-ops/doc/ABSTRACT.md
# /Users/stuart/repos/clada/proj/comp/fs-ops/doc/API.md
# /Users/stuart/repos/clada/proj/comp/fs-ops/doc/ARCH.md

# /Users/stuart/repos/clada/proj/doc/API.md
# /Users/stuart/repos/clada/proj/doc/ARCH.md
# /Users/stuart/repos/clada/proj/doc/TODO.md
