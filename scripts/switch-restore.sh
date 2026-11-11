#!/bin/bash
# 退回切換前的狀態。用法：switch-restore.sh <switch-backup.sh 印出的資料夾>
# 備份時不存在的檔案會被刪掉；資料夾整個換回備份版本（換下來的放在 <備份>/replaced-<時間>/，不直接刪）。
# 結束時比對指紋，完全相同才印「還原完成」。
set -euo pipefail
ROOT="${ROOT:-$HOME}"
HERE="$(cd "$(dirname "$0")" && pwd)"
B="${1:?用法：switch-restore.sh <備份資料夾>}"
[[ -f "$B/manifest.tsv" ]] || { echo "找不到 $B/manifest.tsv" >&2; exit 1; }
R="$B/replaced-$(date +%Y%m%d-%H%M%S)"
park() { mkdir -p "$R/$(dirname "$1")"; mv "$ROOT/$1" "$R/$1"; }
while IFS=$'\t' read -r kind p; do
  case "$kind" in
    file)       mkdir -p "$ROOT/$(dirname "$p")"; cp -p "$B/files/$p" "$ROOT/$p" ;;
    absent)     [[ -e "$ROOT/$p" || -L "$ROOT/$p" ]] && park "$p" ;;
    dir)        [[ -e "$ROOT/$p" || -L "$ROOT/$p" ]] && park "$p"
                mkdir -p "$ROOT/$(dirname "$p")"; tar -C "$ROOT/$(dirname "$p")" -xpf "$B/files/$p.tar" ;;
    absent-dir) [[ -e "$ROOT/$p" || -L "$ROOT/$p" ]] && park "$p" ;;
  esac
done < "$B/manifest.tsv"
if diff <(ROOT="$ROOT" "$HERE/switch-fingerprint.sh") "$B/fingerprint.txt"; then
  echo "還原完成：與備份時完全相同（換下來的檔案在 ${R}）"
else
  echo "⚠️ 還原後與備份時不同，見上方差異" >&2; exit 2
fi
