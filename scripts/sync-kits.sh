#!/bin/bash
# 工具包 → plugin 複本的同步與一致性檢查（research、teaching 兩包）。
#   sync-kits.sh check   只比對，不改；有差異 exit 1（預設）
#   sync-kits.sh sync    把工具包的 skills/ 鏡像進 plugin（排除 .DS_Store）
#
# 來源（本體）是使用者自己的兩套 NotebookLM 工具包，Codex desktop 也直接讀它們：
#   research ← notebooklm-v2.1.2-kit/skills/*
#   teaching ← notebooklm-teaching-v1.1-kit/skills/*
# 第三方 skill（MIT）照收，授權全文放在 plugin 根目錄，check 會確認它們都在：
#   obsidian-second-brain  → LICENSE-obsidian-second-brain（Eugeniu Ghelbur，上游 eugeniughelbur/obsidian-second-brain）
#   scientific-brainstorming → LICENSE-K-Dense（K-Dense Inc.，上游 K-Dense-AI/scientific-agent-skills）
# 注意：收的是工具包裡的版本（較舊）；上游已更新，要不要升級由使用者決定，升級請改工具包再 sync。
# 只同步 skills/；kit 的 AGENTS.md、docs、wiki、setup.sh、refs、templates 留在 kit（vault 結構由 setup.sh 建立）。
set -u
mode="${1:-check}"
case "$mode" in check|sync) ;; *) echo "用法：$0 [check|sync]"; exit 2 ;; esac
HERE="$(cd "$(dirname "$0")" && pwd)"; PLUGINS="$HERE/../plugins"
KITS="$HOME/Desktop/紀錄文件資料夾"
EXCLUDE=""
problems=0

one() {  # $1 plugin  $2 kit 目錄
  local plugin="$1" kit="$2"
  echo "── ${plugin} ← $(basename "$kit")"
  [ -d "$kit/skills" ] || { echo "  ❌ 找不到 $kit/skills"; problems=$((problems+1)); return; }
  mkdir -p "$PLUGINS/$plugin/skills"
  for d in "$kit"/skills/*/; do
    n="$(basename "$d")"
    case " $EXCLUDE " in *" $n "*) echo "  ⏭  ${n}（第三方，不收）"; continue ;; esac
    [ "$mode" = sync ] && { mkdir -p "$PLUGINS/$plugin/skills/$n"; rsync -a --delete --exclude .DS_Store "$d" "$PLUGINS/$plugin/skills/$n/"; }
    if diff -rq -x .DS_Store "$d" "$PLUGINS/$plugin/skills/$n" >/dev/null 2>&1; then echo "  ✅ $n"
    else echo "  ❌ $n 與 kit 不同"; problems=$((problems+1)); fi
  done
  for d in "$PLUGINS/$plugin"/skills/*/; do   # plugin 裡有、kit 已經沒有的
    n="$(basename "$d")"; [ -d "$kit/skills/$n" ] && case " $EXCLUDE " in *" $n "*) false ;; *) true ;; esac && continue
    if [ "$mode" = sync ]; then rm -rf "$d"; echo "  🗑  ${n}（kit 已移除）"; else echo "  ❌ $n 在 plugin 但不在 kit"; problems=$((problems+1)); fi
  done
}
one research "$KITS/notebooklm-v2.1.2-kit"
for f in LICENSE-obsidian-second-brain LICENSE-K-Dense; do
  if [ -s "$PLUGINS/research/$f" ]; then echo "  ✅ $f"; else echo "  ❌ 缺 $f（第三方 skill 的授權全文）"; problems=$((problems+1)); fi
done
one teaching "$KITS/notebooklm-teaching-v1.1-kit"
[ $problems -eq 0 ] && echo "✅ kit 與 plugin 一致" || { echo "❌ $problems 項不一致"; exit 1; }
