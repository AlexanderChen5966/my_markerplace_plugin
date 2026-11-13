---
name: notebooklm-skill
description: |
  NotebookLM 雙向橋接（上傳 + 語意檢索）。讓 Codex/Claude 把課本 PDF、課綱、
  公開教材與 YouTube 連結送進 NotebookLM，並用自然語言問答、取回含頁碼的引用。
  上傳前強制經過 privacy-guard 白名單驗證。本 SKILL.md 是包裝，引擎為外部 pip 套件。

  Trigger: notebooklm-skill, notebooklm, 上傳 notebooklm, 問課本, 課本裡有講嗎,
           語意檢索, 找教材內容, 這個概念課本哪裡有
metadata:
  version: 1.0.0-wrapper
  engine: external（pip/uvx 套件 notebooklm-skill，非本 kit 自帶）
  hosts: Codex desktop / Claude Desktop / Claude Code
  gate: privacy-guard（上傳前，阻斷式）
---

# notebooklm-skill（包裝）

> **這是包裝說明，不是引擎本身。** 實際功能由外部套件 `notebooklm-skill` 提供
> （瀏覽器自動化，需保持 Google 登入）。NotebookLM 無公開 API，故以此套件溝通。

## 為什麼教師端比研究端更需要這個

論文版用 NotebookLM 做文獻語意檢索。教學版的用法更直接：
**把一整本課本丟進去，然後用問句找內容。**

備課時最花時間的動作之一是「這個概念課本哪一章有講」——翻索引、翻目錄、
記得好像在第七章但找不到。NotebookLM 回答時會給頁碼，直接定位。

這也是 awesome-agentic-ai-zh 教師分支把 NotebookLM 列為 Tier 1 核心工具的原因。

---

## 安裝（工程師一次性）

```bash
uvx notebooklm-skill          # 或 pip install notebooklm-skill
uvx notebooklm login          # 首次 Google 登入（開瀏覽器）
```

登入狀態需保持。若過期，教師會看到錯誤——這時請工程師重新 login。

---

## 使用方式（純對話）

```
把行銷管理的課本上傳到 NotebookLM
市場區隔的四個條件課本哪裡有講
課本有提到本土案例嗎
這支 YouTube 影片加進去
```

---

## 兩個動作

### 一、上傳（upload）

**🛑 上傳前一律先過 `privacy-guard` 白名單驗證。** 這是阻斷式閘門，不可跳過。

| 素材 | 上傳方式 |
|------|---------|
| 課本 PDF（`raw/fixed/`）| PDF 原檔直接上傳（**保留頁碼引用**，這是重點）|
| 課綱、自製講義 | wiki 條目文字貼入，或轉 PDF 上傳 |
| 公開 YouTube 教學影片 | **URL 直接加入**（必須公開且有字幕）|
| 公開網頁教材 | URL 加入 |
| **學生作品、成績、課堂錄音** | 🚫 **一律禁止** |

**PDF 原檔上傳而非貼文字**：貼文字會失去頁碼，而頁碼是備課引用的關鍵
（`[課本 p.78]` 這種標記要能對回原書）。

### 二、問答（ask）

```
市場區隔的四個條件課本哪裡有講
```

回傳含來源引用。取回結果後：

- 若答案要進 wiki 條目 → 標 `[課本 p.X]` 與 `[已核對]`（因為有頁碼可查）
- 若 NotebookLM 沒給明確頁碼 → 標 `[待查證]`，不要自己補頁碼

🛑 **不要編造頁碼。** NotebookLM 沒給就是沒給。

---

## Notebook 組織

**一門課一個 Notebook。**

| 方案 | 來源上限 |
|------|---------|
| 免費 | 50 |
| Plus | 100 |
| Pro | 300 |
| Ultra | 500-600 |

單一來源上限：**200MB 或 50 萬字**。

超過上限時按單元群組拆分（例如 `MKT101 前半` / `MKT101 後半`），
但要注意**無法跨 Notebook 查詢**，所以相關單元要放同一個。

---

## 限制（要讓教師知道，避免誤期待）

| 限制 | 影響 |
|------|------|
| 無公開 API | 靠瀏覽器自動化，需保持 Google 登入。登入過期會失敗 |
| 上傳 = 送第三方 | 即使之後刪除也可能已被快取。這是白名單制存在的理由 |
| YouTube 需公開 + 有字幕 | 沒字幕的影片完全無法處理 |
| `.pptx` 不支援 | 需先轉 Google Slides 或 PDF（或用 `material-ingest` 走 markitdown 路線）|
| 試算表支援不明確 | 不同來源說法矛盾，建議轉 PDF 或 Markdown 上傳 |
| 回傳是文字 | 不含 PDF 頁面截圖 |
| 黑箱 | 檢索結果**回不到你的檔案系統**。要沉澱進 wiki 必須另外落地 |

最後一項是重要的定位判斷：**NotebookLM 是查詢介面，不是資產庫。**
問答用它，累積用 `wiki/`。兩者分工，不要指望 NotebookLM 幫你累積跨學期知識。

---

## 不要做的事

- **不要跳過 `privacy-guard`**
- **不要上傳學生資料**（任何形式）
- **不要編造頁碼**
- **不要把 NotebookLM 當知識庫**。它不會幫你累積迷思與教學反思
