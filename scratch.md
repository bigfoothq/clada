```sh

find . -type f -not -name "package-lock.json"   -not -name ".gitignore"   -not -name "scratch.md"  -not -name "xx*"  -not -name "snapshot.txt"  -not -path "*/node_modules/*"   -not -path "*/dist/*"   -not -path "*/.git/*"  -not -path "*/xx*/*"  -not -path "*/.*/*"  -not -path "*/replacer/*" -exec sh -c '
  echo;
  echo "=== START FILE: $1 ===";
  cat "$1";
  echo;
  echo "=== END FILE: $1 ==="
' sh {} \; | tee snapshot.txt > /dev/null



find .  -type f -not -name "package-lock.json"   -not -name ".gitignore"   -not -name "scratch.md"  -not -name "xx*"  -not -name "snapshot.txt"  -not -path "*/node_modules/*"   -not -path "*/dist/*"   -not -path "*/.git/*"  -not -path "*/xx*/*"   -not -path "*/replacer/*" -not -path "*/node_modules/*"  -not -path "*/replacer/*" -not -path "*/.*/*" -not -path "*/xx*" -not -path "*/trash/*"




```