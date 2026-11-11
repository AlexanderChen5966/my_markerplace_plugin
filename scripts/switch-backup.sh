#!/bin/bash
# 正式切換前的快照。用法：switch-backup.sh            → 備份到 $ROOT/.claude/backups/plugin-switch-<時間>/
# 環境變數 ROOT 可改成假的家目錄做演練（預設 $HOME）。只讀不改，可重複執行。
set -euo pipefail
ROOT="${ROOT:-$HOME}"
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="$ROOT/.claude/backups/plugin-switch-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEST/files"
: > "$DEST/manifest.tsv"
while IFS= read -r p; do
  [[ -z "$p" || "$p" == \#* ]] && continue
  src="$ROOT/$p"
  if [[ "$p" == */ ]]; then
    d="${p%/}"
    if [[ -d "$src" ]]; then
      mkdir -p "$DEST/files/$(dirname "$d")"
      tar -C "$ROOT/$(dirname "$d")" -cf "$DEST/files/$d.tar" "$(basename "$d")"
      printf 'dir\t%s\n' "$d" >> "$DEST/manifest.tsv"
    else
      printf 'absent-dir\t%s\n' "$d" >> "$DEST/manifest.tsv"
    fi
  elif [[ -f "$src" ]]; then
    mkdir -p "$DEST/files/$(dirname "$p")"
    cp -p "$src" "$DEST/files/$p"
    printf 'file\t%s\n' "$p" >> "$DEST/manifest.tsv"
  else
    printf 'absent\t%s\n' "$p" >> "$DEST/manifest.tsv"
  fi
done < "$HERE/switch-targets.txt"
# 還原後比對用的指紋（檔案內容＋symlink 目標）
ROOT="$ROOT" "$HERE/switch-fingerprint.sh" > "$DEST/fingerprint.txt"
echo "$DEST"
