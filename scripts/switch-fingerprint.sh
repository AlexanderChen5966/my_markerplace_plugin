#!/bin/bash
# 印出 switch-targets.txt 每個項目的指紋：檔案 md5、資料夾內每個項目（symlink 記目標）。還原後兩份指紋要完全相同。
set -euo pipefail
ROOT="${ROOT:-$HOME}"
HERE="$(cd "$(dirname "$0")" && pwd)"
while IFS= read -r p; do
  [[ -z "$p" || "$p" == \#* ]] && continue
  src="$ROOT/${p%/}"
  if [[ -L "$src" ]]; then echo "link $p -> $(readlink "$src")"
  elif [[ -d "$src" ]]; then
    (cd "$src" && find . -print0 | sort -z | while IFS= read -r -d '' f; do
      if [[ -L "$f" ]]; then echo "link $p$f -> $(readlink "$f")"
      elif [[ -f "$f" ]]; then echo "file $p$f $(md5 -q "$f")"
      else echo "dir  $p$f"; fi
    done)
  elif [[ -f "$src" ]]; then echo "file $p $(md5 -q "$src")"
  else echo "none $p"; fi
done < "$HERE/switch-targets.txt"
