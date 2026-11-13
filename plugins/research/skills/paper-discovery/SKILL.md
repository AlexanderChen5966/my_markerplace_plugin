---
name: paper-discovery
description: |
  Conversational paper search & collection (stage 1). Given a topic in plain language,
  rewrites it into multiple search queries, searches free no-API-key academic sources
  (商管 primary: OpenAlex / Semantic Scholar / RePEc / EconBiz / SSRN / Unpaywall),
  dedupes across sources, presents candidates WITH journal / citations / ranking badges,
  supports citation snowballing, and on the user's pick downloads open-access PDFs into
  raw/papers/ named by citation_key — then hands off to knowledge-organizer.
  Keeps a search log (queries / picked / skipped) for reproducibility.
  Engineer wires the source once; the professor operates by chat.

  Trigger: paper-discovery, 找論文, 搜尋論文, 收集文獻, 找文獻, 有哪些 paper,
           滾雪球, 從這篇往外找, find papers, search literature, snowball
metadata:
  version: 2.2.1
  origin: P9（上游探索橋接：搜尋 → citation key 落地）
  operation: 純對話（教授）
  setup: 免金鑰優先；工程師接好任一來源即可（一次性）
  default_domain: 商管（business / management）
---

# paper-discovery

把「文獻探索」做成**對話操作**的入口：你用白話說主題，它改寫檢索式、搜尋、列出帶品質標示的清單、你挑、它下載命名歸位、並記錄搜尋軌跡。
搜尋引擎不自建——優先用**免金鑰**來源；本 skill 負責「**改寫 → 呼叫來源 → 去重排序 → 套 citation key 約定 → 落 `raw/papers/` → 記 log**」這層橋接。

> **資料流定位**：階段 1（文獻探索）。補上工作流最前端，讓 kit「從蒐集 paper 開始」。
> **操作/設定分工**：教授純對話；工程師一次性接好來源（見下方）。
> **免金鑰原則**：預設**不需要 OpenAI API key**。判斷由主機 LLM 免費完成；搜尋走免金鑰學術來源。

## 使用方式（純對話）

```
找一些關於「平台商業模式對企業績效影響」的論文
有哪些近三年討論 ESG 與公司治理的 paper？
從 Smith2023 這篇往外找：它引用了誰、誰引用了它        ← 滾雪球
上次搜過的不要再列                                    ← seen list 自動生效
```

---

## 搜尋來源分層（免金鑰優先）

### Tier 0 — Agent 直接搜（零設定，馬上能用）

主機（Codex / Claude）用**內建網路搜尋**去 Google Scholar / 期刊頁找論文。
- ✅ 不裝任何東西、不用 key
- ⚠️ 回傳網頁文字，結構較鬆、偶爾抓不到 PDF 直連；Google Scholar 無官方 API，可能被反爬蟲阻擋
- ⚠️ **候選清單中來自 Tier 0 的項目一律標示 `[網頁來源]`**，提醒 metadata 可信度低於 Tier 1 結構化資料

### Tier 1 — 免金鑰學術來源（推薦，工程師接一次）

**🎯 商管主來源（v2.1 預設）：**

| 來源 | 免 key | 商管覆蓋 |
|------|--------|----------|
| **OpenAlex** | ✅（填 email 進 polite pool）| 跨領域最全，商管完整涵蓋，**首選通用入口**；原生支援引用網絡（滾雪球）|
| **Semantic Scholar** | ✅（選配免費 key 提額度）| 跨領域 + 引用網絡（滾雪球備援）|
| **RePEc / EconPapers / IDEAS** | ✅ | 經濟、財金、部分管理 |
| **EconBiz**（ZBW）| ✅ 有搜尋 API | 經濟 + 商學（德國國家經濟圖書館）|
| **SSRN** | 瀏覽免費（無乾淨 API，走 Tier 0 抓）| 財金/會計/管理**工作論文**重鎮 |
| **Crossref** | ✅ | DOI 書目 metadata（補齊引用資訊）|
| **Unpaywall** | ✅（填 email）| 用 DOI 找**合法開放取用** PDF |

> 商管組合建議：**OpenAlex / Semantic Scholar（通用）＋ RePEc / EconBiz / SSRN（領域）＋ Unpaywall（找 PDF）**。

**📦 其他領域擴充備案（需要時再接）：**

| 領域 | 來源 | 免 key |
|------|------|--------|
| 理工 / CS / 量化金融 | **arXiv**（含 econ、q-fin）| ✅ 完全免費 |
| 生醫 / 生命科學 | **Europe PMC / PubMed** | ✅ |
| 開放取用期刊（跨領域）| **DOAJ** | ✅ |
| 跨來源聚合 | paper-search-mcp 之類聚合 MCP | 視來源 |

**🇹🇼 台灣中文文獻（v2.2.1 支援）：**

| 來源 | 免費 | 用途 |
|------|------|------|
| **國圖「臺灣期刊論文索引」**（tpl.ncl.edu.tw）| ✅ 免費查詢，**已授權文章可直接下載 PDF** | 5,500+ 種台灣期刊、276 萬篇書目；走 Tier 0 網頁查詢 |
| **臺灣博碩士論文知識加值系統**（NDLTD）| ✅ 免費，部分開放電子全文 | 博碩士論文（管理學院論文常有完整文獻回顧可挖）|
| **Google Scholar 中文檢索** | ✅（Tier 0）| 中文文獻通用補搜 |
| **華藝 Airiti Library** | 機構訂閱（無公開 API）| 最大台灣中文期刊庫 → 走 🏥 徽章（`subscriptions.yaml` 加 Airiti）|
| **TSSCI / THCI 收錄清單** | ✅ 公開（國科會人社中心）| 加進 `refs/journal-rankings.yaml`，中文期刊也標 ⭐ |

> **中文 citation_key 約定**：作者姓氏羅馬拼音 + 年份（如 Chen2024，與 Zotero BBT 慣例一致）；中文題名/作者保留於 frontmatter。
> ⚠️ 仍屬盲區：CNKI（中國大陸文獻）無免費管道，需人工處理。

### Tier 2 — 需 OpenAI API key（選配，沿用 v2.0 方案）

若已有 OpenAI key 且想要**自動 deep scoping**：
- `gpt-researcher` MCP：主題式自動深度搜尋
- `paper-qa` MCP：找 + 下載 + 直接問 PDF

> 這兩者自帶 LLM 迴圈，故需 key。**非必需**——Tier 0/1 已能涵蓋日常文獻探索。完整 API-key 方案保留在 `notebooklm-v2.0-kit`。

---

## 執行流程

1. **解析主題 + Query Rewrite**：從對話取出研究主題 / 年份範圍等條件，**改寫成 3-5 組檢索式**再搜（別直接拿白話原句查）：
   - 英文學術術語版（platform business model → two-sided markets / multi-sided platforms）
   - 關鍵字組合版、同義概念版、（必要時）中文版
2. **選來源並搜尋**（依工程師接好的層級，預設商管 Tier 1）：
   - 有接 Tier 1 → OpenAlex / Semantic Scholar / RePEc / EconBiz 並行查
   - 只有 Tier 0 → 主機內建搜尋（結果標 `[網頁來源]`）
   - **中文主題** → 國圖「臺灣期刊論文索引」+ 博碩士論文網（Tier 0 網頁查詢）+ Google Scholar 中文
   - 有 Tier 2 key → 可選 gpt-researcher / paper-qa
3. **跨來源去重 + 排序**：
   - 以 **DOI 正規化去重**（無 DOI 用 標題+第一作者+年份 模糊比對）；working paper 版與正式版視為同篇，保留正式版並註記有 SSRN 前身
   - 比對 **seen list**（search log 內），已略過的論文預設不重列（可說「連略過的也列出來」覆蓋）
   - 排序依據：相關性 × 被引數 × 期刊等級（有 rankings 清單時）
4. **列出候選（帶品質標示，供你挑）**：
   ```
   1. Smith (2023)《標題…》
      📰 Strategic Management Journal ｜ ⭐FT50 / ABS 4* ｜ 📈 被引 142
      🟢 開放取用  doi:10.xxx
   2. Johnson (2024)《標題…》
      📰 J. of Platform Economy ｜ （無等級資料）｜ 📈 被引 8
      🏥 學校訂閱可取得  doi:10.yyy
   3. Lee (2025)《標題…》 [網頁來源]
      📎 需自行取得（可試 Unpaywall / SSRN 工作論文版）
   ```
   - **期刊等級標示**：工程師若已放 `refs/journal-rankings.yaml`（FT50 / ABS 星級清單），自動比對標示；沒有清單則顯示期刊名+被引數，並提醒「未過濾期刊等級，請留意掠奪性期刊」
   - **全文三層徽章**（借鑑 paper-radar）：🟢 OA 直接抓 ／ 🏥 學校訂閱（工程師若放 `refs/subscriptions.yaml` 訂閱清單則自動比對）／ 📎 自己補
5. **你挑要收的**（回覆編號即可；也可說「第 1 篇往外滾雪球」）
6. **滾雪球（Snowballing，可選動作）**：對任一篇候選或已入庫論文：
   - **Backward**：經 OpenAlex / Semantic Scholar 取它的參考文獻清單（它引了誰）
   - **Forward**：取施引文獻（誰引用了它），依被引數排序列出
   - 結果回到步驟 4 的候選清單格式，繼續挑
7. **下載 + 落地**（對每篇選定的）：
   - **citation_key 權威規則**：若已接 Zotero（Better BibTeX）→ **以 BBT 產生的 key 為準**，skill 只沿用不自產；未接 Zotero → skill 生成（作者+年份，衝突時先查 `raw/papers/` 現有檔名再加 a/b）。**全 kit 只能有一個 key 產生器**，避免對齊主鍵斷鏈
   - 🟢 → 下載 PDF 至 `raw/papers/{citation_key}.pdf`；🏥 → 給圖書館連結提示手動下載；📎 → 先試 Unpaywall / SSRN 找 OA 版，找不到提示手動（skill 仍幫命名）
   - 寫入最小 frontmatter 草稿（citation_key / doi / title / authors / year / journal）
8. **記錄搜尋 log**（append 到 `outputs/search-log.md`）：
   ```
   ## 2026-07-07｜平台商業模式對企業績效影響
   - 檢索式：platform business model firm performance / two-sided markets performance / …
   - 來源：OpenAlex + RePEc（Tier 1）
   - 候選：12 篇｜挑選：Smith2023, Johnson2024｜略過：Lee2025（主題偏 B2C）…
   ```
   - 供 **seen list** 去重、避免重複推薦；也是日後寫系統性文獻回顧（SLR/PRISMA）時的 search protocol 依據
9. **交棒**：提示「是否用 knowledge-organizer 結構化這些新論文？」

---

## 優雅降級（完全沒接來源時）

即使工程師一個來源都沒接，本 skill 仍可用 **Tier 0（主機內建搜尋）** 運作（結果標 `[網頁來源]`）；
或對話引導手動收集——你下載 PDF 後，skill 幫你**套 citation key 命名 + 歸入 `raw/papers/` + 寫 frontmatter + 記 log**。

> 即使沒有自動來源，「命名、歸位、搜尋紀錄」這三層約定永遠不會亂——這對後續所有 skill 至關重要。

---

## 設定（工程師，一次性）

**免金鑰最低設定**（v2.1 預設，不碰 OpenAI 帳單）：
- 接 **OpenAlex MCP**（商管首選通用入口，填 email 進 polite pool、注意 rate limit）；或
- 接 **Semantic Scholar MCP**；或
- 什麼都不接，靠 **Tier 0 主機內建搜尋**

**商管加強**：再接 RePEc / EconBiz MCP；SSRN 走 Tier 0 抓；DOI 配 Unpaywall（填 email）。

**品質與全文標示（強烈建議，各一份靜態檔即可）**：
- `refs/journal-rankings.yaml`：FT50 / ABS(AJG) 星級 + **TSSCI / THCI 收錄清單**（國科會人社中心公開）→ 候選清單自動標 ⭐（中英期刊皆可標）
- `refs/subscriptions.yaml`：學校圖書館訂閱期刊清單（向館員要一份即可，**記得包含 Airiti Library**）→ 自動標 🏥

**其他領域**：依需求加 arXiv（理工）/ Europe PMC（生醫）/ DOAJ。
**選配 Tier 2**：有 OpenAI key 才接 gpt-researcher / paper-qa。

設定完成後，教授端**無需任何指令**，直接用對話觸發。

## 範圍邊界

- **不自建搜尋引擎**：搜尋一律經主機內建或免金鑰來源；本 skill 只做橋接與落地
- **citation key 是落地核心**：一律以 citation key 命名，且**有 Zotero BBT 時以 BBT 為唯一權威**（見 AGENTS.md「資料流地基」）
- **不做文獻管理**：庫管理（去重 / BibTeX / 標籤）交給 Zotero MCP
- **不做持續監測**：本 skill 是主動搜尋（pull）；每日自動追蹤新論文（push，radar 模式）屬 daily-brief-generator 的擴充方向

---

## Changelog

### v2.2.1（2026-07-07）— 台灣中文文獻支援
- 新增台灣中文來源：國圖「臺灣期刊論文索引」（免費，已授權文章可下載 PDF）+ 臺灣博碩士論文網（NDLTD）+ Google Scholar 中文
- Airiti Library 走 🏥 訂閱徽章（`subscriptions.yaml` 納入）；TSSCI/THCI 清單納入 `journal-rankings.yaml`（中文期刊也標 ⭐）
- 中文 citation_key 約定：作者姓氏羅馬拼音+年份（Chen2024，與 BBT 慣例一致）
- 盲區收斂：僅剩 CNKI（中國大陸文獻）需人工處理

### v2.2.0（2026-07-07）— v2.1.1-kit 搜尋品質補強（修補 2026-07 機制評估的缺口）
- **Query Rewrite**：白話主題改寫成 3-5 組檢索式再搜
- **候選清單升級**：期刊名 + 被引數 + FT50/ABS 星級標示（`refs/journal-rankings.yaml`）+ 掠奪性期刊警示
- **全文三層徽章**（借鑑 drpwchen/paper-radar）：🟢 OA ／ 🏥 學校訂閱（`refs/subscriptions.yaml`）／ 📎 自己補
- **滾雪球（Snowballing）**：backward（它引誰）/ forward（誰引它），經 OpenAlex/S2 引用網絡
- **跨來源去重**：DOI 正規化 + working paper/正式版合併
- **citation_key 唯一權威**：有 Zotero BBT 以 BBT 為準，skill 不自產；無則 skill 生成並先查現有檔名
- **搜尋 log**（`outputs/search-log.md`）：檢索式/來源/挑選/略過，供 seen list 去重與 SLR search protocol
- **Tier 0 標示**：網頁來源結果標 `[網頁來源]` 提示可信度
- 明示覆蓋盲區：中文文獻（TSSCI/Airiti/CNKI）需人工補搜

### v2.1.0（2026-06-29）— v2.1-kit（免金鑰 + 商管主來源）
- 搜尋改為**三層免金鑰優先**：Tier 0 主機內建搜尋 / Tier 1 免金鑰學術來源 / Tier 2 OpenAI-key 選配
- **預設領域改為商管**：OpenAlex / Semantic Scholar / RePEc / EconBiz / SSRN / Unpaywall
- 其他領域（arXiv / Europe PMC / DOAJ）列為擴充備案
- gpt-researcher / paper-qa 降為選配（完整 API-key 方案保留於 v2.0-kit）

### v1.0.0（2026-06-26）— v2.0-kit（提案 P9）
- 對話式文獻探索入口：MCP 搜尋 → 列候選 → 下載 → citation key 命名落地 → 交棒 organizer
- 操作/設定分工：教授純對話、工程師一次性接 MCP
- 優雅降級：無 MCP 時引導手動收集，仍保證命名與歸位
