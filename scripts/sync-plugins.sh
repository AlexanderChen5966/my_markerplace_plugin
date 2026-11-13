#!/bin/bash
# 本體 → plugin 複本的同步與一致性檢查。
#   sync-plugins.sh check   只比對，不改；有差異 exit 1（預設）
#   sync-plugins.sh sync    把本體複製進 plugin（每個 skill 整個資料夾鏡像，排除 .DS_Store）
#
# 本體位置：
#   ~/.agents/skills/<skill>             所有 agent 共用
#   ~/.agents/claude-only/skills/<skill> 只有 Claude 用（ai-pair、flutter-ui-compare），其他 agent 不讀
#   ~/.agents/claude-only/agents/<檔>    Claude subagent（code-reviewer）
#   ~/.agents/skills/<檔>                plugin 根目錄的附檔（MATTPOCOCK-SOURCE.md、LICENSE-mattpocock）
# research、teaching 兩包的本體是 NotebookLM 工具包，由 sync-kits.sh 同步與檢查，這支腳本跳過它們。
# 哪個 skill 屬於哪一包，以 plugins/<包>/skills/ 底下現有的資料夾為準；
# 本體新增了 skill 但沒有任何一包收，check 會列出來，要自己決定放哪包（先 mkdir 該包的 skills/<名稱>）。
set -u
mode="${1:-check}"
case "$mode" in check|sync) ;; *) echo "用法：$0 [check|sync]"; exit 2 ;; esac
HERE="$(cd "$(dirname "$0")" && pwd)"
PLUGINS="$HERE/../plugins"
SHARED="$HOME/.agents/skills"
CONLY="$HOME/.agents/claude-only"
problems=0

body_of_skill() {
  if [ -d "$SHARED/$1" ]; then echo "$SHARED/$1"
  elif [ -d "$CONLY/skills/$1" ]; then echo "$CONLY/skills/$1"
  fi
}

compare_or_sync() {  # $1 本體 $2 複本 $3 顯示名稱
  if [ "$mode" = sync ]; then
    if [ -d "$1" ]; then rsync -a --delete --exclude .DS_Store "$1/" "$2/"
    else cp -p "$1" "$2"; fi
  fi
  if diff -rq -x .DS_Store "$1" "$2" >/dev/null 2>&1; then
    echo "  ✅ $3"
  else
    echo "  ❌ $3 與本體不同"; diff -rq -x .DS_Store "$1" "$2" | sed 's/^/     /'; problems=$((problems+1))
  fi
}

declare -a packaged=()
for pkg in "$PLUGINS"/*/; do
  p="$(basename "$pkg")"
  # research、teaching 的本體是 NotebookLM 工具包，由 sync-kits.sh 管
  case "$p" in research|teaching) echo "── ${p}（由 sync-kits.sh 管）"; continue ;; esac
  echo "── $p"
  for s in "$pkg"skills/*/; do
    [ -d "$s" ] || continue
    n="$(basename "$s")"; packaged+=("$n")
    b="$(body_of_skill "$n")"
    if [ -z "$b" ]; then echo "  ⚠️  $n 沒有本體（~/.agents/skills 與 claude-only 都沒有）"; problems=$((problems+1)); continue; fi
    compare_or_sync "$b" "${s%/}" "skill $n"
  done
  for a in "$pkg"agents/*.md; do
    [ -f "$a" ] || continue
    n="$(basename "$a")"
    if [ -f "$CONLY/agents/$n" ]; then compare_or_sync "$CONLY/agents/$n" "$a" "agent $n"
    else echo "  ⚠️  agent $n 沒有本體"; problems=$((problems+1)); fi
  done
  for f in MATTPOCOCK-SOURCE.md LICENSE-mattpocock; do
    [ -f "$pkg$f" ] && compare_or_sync "$SHARED/$f" "$pkg$f" "$f"
  done
done

echo "── 本體有、沒有任何一包收的 skill"
none=1
for b in "$SHARED"/*/ "$CONLY"/skills/*/; do
  [ -f "$b/SKILL.md" ] || continue
  n="$(basename "$b")"
  printf '%s\n' "${packaged[@]}" | grep -qx "$n" || { echo "  ⚠️  $n"; problems=$((problems+1)); none=0; }
done
[ "$none" = 1 ] && echo "  （無）"

[ "$problems" -eq 0 ] && echo "✅ 本體與 plugin 一致" || echo "⚠️ $problems 個項目需要處理"
[ "$problems" -eq 0 ]
