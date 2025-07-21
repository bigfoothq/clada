#!/bin/bash

output_file="snapshot_selections.txt"

file_list=$(cat <<'EOF'

/Users/stuart/repos/clada/proj/comp/sham-action-parser/src/index.ts
/Users/stuart/repos/clada/proj/comp/fs-ops/src/index.ts
/Users/stuart/repos/clada/proj/src/index.ts
/Users/stuart/repos/clada/proj/comp/fs-ops/src/index.ts
/Users/stuart/repos/clada/unified-design.yaml




/Users/stuart/repos/clada/proj/doc/API.md
/Users/stuart/repos/clada/proj/doc/ARCH.md
/Users/stuart/repos/clada/proj/doc/TODO.md

/Users/stuart/repos/clada/replacer/replacer_llm_instructions.md
/Users/stuart/repos/clada/xd5_ref.md
EOF
)

echo "$file_list" | while read -r file; do
  # Skip blank lines
  [[ -z "$file" ]] && continue
  {
    echo "=== START FILE: $file ==="
    cat "$file"
    echo
    echo "=== END FILE: $file ==="
    echo
  }
done | tee "$output_file" | pbcopy
