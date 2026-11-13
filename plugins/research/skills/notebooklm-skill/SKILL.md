---
name: notebooklm-skill
description: |
  Bidirectional bridge to Google NotebookLM (upload + ask). Lets Codex/Claude
  auto-upload raw materials to NotebookLM and run semantic retrieval with source
  citations (page markers). This SKILL.md is a thin wrapper — the actual engine is
  the external pip/uvx package `notebooklm-skill` (browser automation, needs Google login).

  Trigger: notebooklm-skill, notebooklm, 上傳 notebooklm, 檢索論文, ask notebooklm,
           語意檢索, 找論文, 比較論文觀點
metadata:
  version: 1.0.0-wrapper
  engine: external（pip/uvx 套件 notebooklm-skill，非本 kit 自帶）
  hosts: Codex desktop / Claude Desktop（cross-tool，實測可用）
---

# notebooklm-skill（包裝）

> **這是包裝說明，不是引擎本身。** 實際功能由外部套件 `notebooklm-skill` 提供
> （瀏覽器自動化，需保持 Google 登入）。本檔讓它在 kit `skills/` 內可被發現、
> 並統一觸發約定。NotebookLM 無公開 API，故以此套件雙向溝通。

## 安裝（一次性）

```bash
uvx notebooklm-skill          # 或 pip install notebooklm-skill
uvx notebooklm login          # 首次 Google 登入
```

## 兩個動作

### upload — 上傳素材到 NotebookLM

```
notebooklm-skill upload raw/papers/Smith2023.pdf
```
- **PDF 原檔** → 直接上傳（保留頁碼引用）
- **網頁** → 加入 URL 來源
- **逐字稿 / 截圖 / 一般 md** → 貼入 wiki 摘要文字

### ask — 語意檢索（帶引用）

```
notebooklm-skill ask 哪些論文討論自主學習對學業成就的影響？
```
回傳帶來源引用的結果（如「Smith (2023) [p.23] 發現…」），
由 Codex/Claude 整理後呈現，必要時交給 knowledge-organizer 結構化存入 wiki。

## 在工作流中的角色

- **資料流定位**：階段 2-5 全程可檢索（流程二「智慧查詢」核心）
- **與 kit 的銜接**：ask 取回的帶引用結果 → knowledge-organizer 寫入 `paper-summaries/`
- **三角分工**：NotebookLM 當 RAG 檢索引擎、Obsidian 當知識庫、Codex 當編排中心
  （完整架構見 `docs/notebooklm-workflow-v2.1.md`）

## 限制

| 限制 | 說明 |
|------|------|
| 無公開 API | 透過瀏覽器自動化，需保持 Google 登入 |
| Notebook 上限 50 份來源 | 超過依子主題拆分 |
| ask 回傳為文字 | 不含 PDF 原檔頁面截圖 |

## Changelog

### v1.0.0-wrapper（2026-06-26）
- 建立包裝 SKILL.md（v2.0-kit），統一 upload/ask 觸發約定
- 引擎為外部 pip/uvx 套件 notebooklm-skill，非 kit 自帶
