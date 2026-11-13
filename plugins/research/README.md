# research：教授做研究

NotebookLM 研究知識庫工具包（來源：`notebooklm-v2.1.2-kit`）的 14 個 skill：文獻探索（paper-discovery）、知識整理與合成（knowledge-organizer、knowledge-synthesizer、knowledge-elevation）、引用誠信查驗（citation-integrity-check）、每日簡報（daily-brief-generator）、與論文寫作工具的資料橋接（paper-knowledge-backflow、synthesis-to-ars-export）等。

## 前置

這些 skill 在**知識庫資料夾**裡工作，路徑（`raw/`、`wiki/`、`refs/`）都相對於知識庫根目錄。知識庫的資料夾結構、`AGENTS.md`、`refs/` 與範本由工具包的 `setup.sh` 建立，plugin 只提供 skill，不建這些。在知識庫資料夾開 session 並啟用本 plugin 即可使用。

## 第三方 skill 與授權

`obsidian-second-brain`（作者 Eugeniu Ghelbur）與 `scientific-brainstorming`（作者 K-Dense Inc.）是第三方 skill，皆為 MIT 授權，授權全文在本資料夾的 `LICENSE-obsidian-second-brain`、`LICENSE-K-Dense`。收進來的是你的工具包裡的版本，**比上游舊**（上游 `eugeniughelbur/obsidian-second-brain`、`K-Dense-AI/scientific-agent-skills` 都已更新；`scientific-brainstorming` 上游已大幅改寫），要升級請回上游同步到工具包再執行 `sync-kits.sh sync`。

## 維護

本體是工具包，不是 plugin 複本。改工具包後執行 marketplace 的 `scripts/sync-kits.sh sync`，用 `check` 確認一致。
