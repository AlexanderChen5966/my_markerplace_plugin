# teaching：教授備課

NotebookLM 備課知識庫工具包（來源：`notebooklm-teaching-v1.1-kit`）的 19 個 skill：教材入庫與隱私把關（material-ingest、privacy-guard）、單元整理與合成（unit-organizer、unit-synthesizer）、教案（lesson-plan-generator）、簡報（slide-builder）、測驗與評分標準（quiz-generator、rubric-builder）、教學目標對齊檢查（objective-alignment-check）、學生迷思累積（misconception-miner）、回饋初稿（feedback-drafter）、中文去 AI 味（humanize-zh）等。

## 前置

這些 skill 在**備課知識庫資料夾**裡工作，路徑（`raw/`、`wiki/`、`refs/`、`templates/`）都相對於知識庫根目錄。知識庫的資料夾結構、`AGENTS.md`、`refs/` 與 `templates/` 由工具包的 `setup.sh` 建立，plugin 只提供 skill，不建這些。在知識庫資料夾開 session 並啟用本 plugin 即可使用。部分 skill 需要外部工具（例如 slide-builder 用 Marp）。

## 注意

`privacy-guard` 與 `feedback-drafter` 是阻斷式把關（學生資料去識別化、人工審核）。學生資料請遵守你所在機構的規定，不要放進公開的地方。

## 維護

本體是工具包，不是 plugin 複本。改工具包後執行 marketplace 的 `scripts/sync-kits.sh sync`，用 `check` 確認一致。
