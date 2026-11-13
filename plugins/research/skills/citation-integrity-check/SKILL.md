---
name: citation-integrity-check
description: |
  Citation integrity & claim-faithfulness audit for academic wiki entries.
  Verifies that [p.X] page markers in paper-summaries fall within the source PDF's
  real page range, and that each wiki claim is actually supported by the cited page
  (ALIGNED / OVERSTATED / NOT_SUPPORTED). Advisory only — produces a human-review list.

  Trigger: citation-integrity-check, 引用誠信, 引用查驗, claim 查證, 頁碼查驗,
           citation audit, claim-faithfulness, 誠信檢查
metadata:
  version: 1.0.0
  target: 學術研究者、教授
  origin: P1（整合自 academic-research-skills ARS Stage 2.5/4.5）
---

# citation-integrity-check

學術知識庫最大的盲點：knowledge-organizer 要求每條發現標 `[p.X]` 頁碼，
卻**從不驗證**這個頁碼是否真實、claim 是否真被該頁支撐。
本 skill 補上這道「引用誠信」閘門——**advisory 不阻斷**，產出待人工確認清單。

> 動機：Zhao 等人（2026）估計 2025 年單年 146,932 筆幻覺引用。AI 整理學術素材時最常出的錯就是「頁碼掛錯、claim 與來源不符」。

## 使用方式

```
citation-integrity-check                          # 檢查 paper-summaries/ 全部
citation-integrity-check wiki/paper-summaries/Smith2023.md   # 指定單篇
引用誠信檢查 學習動機                              # 檢查某主題相關條目
```

---

## 兩道檢查

### 檢查 A — 頁碼存在性（Page-Range Validity）

> `[p.X]` 是否落在該 PDF 實際頁數範圍內

判斷邏輯：
1. 從 wiki 條目 frontmatter 取 `citation_key`，定位 `raw/papers/{citation_key}.pdf`
2. 取得該 PDF 總頁數（讀檔或既有 metadata）
3. 逐條比對 R 層發現的 `[p.X]` / `[p.X-Y]`：頁碼 > 總頁數，或格式異常 → 標記

輸出：
```
⚠️ 頁碼越界：[[Smith2023]]
問題：R3 標記 [p.89]，但該 PDF 僅 42 頁
建議：人工核對正確頁碼
```

### 檢查 B — claim-faithfulness（半自動）

> wiki 的 claim 是否真被所引頁面支撐

判斷邏輯（逐條 R 層發現）：
1. 取該發現引用的頁碼，讀回 `raw/papers/{key}.pdf` 對應頁原文
2. 把「原文段落」與「wiki 的 claim」並列，AI 判定三級：
   - **ALIGNED**：claim 忠實反映原文
   - **OVERSTATED**：claim 比原文宣稱更強（加了原文沒有的確定性 / 範圍）
   - **NOT_SUPPORTED**：該頁找不到支撐此 claim 的內容
3. 非 ALIGNED 者列入待確認清單

輸出：
```
🔍 claim 存疑：[[Smith2023]] R2
原文 [p.23]：「在本研究樣本中觀察到正相關（r=.34）」
wiki claim：「X 與 Y 有強烈因果關係」
判定：OVERSTATED（相關 → 因果、.34 非「強烈」）
建議：改為「觀察到中度正相關（r=.34, p.23）」
```

> **與 P5 串接**：被判 `NOT_SUPPORTED` 的發現，建議在 knowledge-organizer 條目中降級為 `[待查證]` 信心標籤。

---

## 範圍邊界（刻意不做）

| 不做 | 為何 |
|------|------|
| 四索引線上查驗（Semantic Scholar / OpenAlex / Crossref / arXiv） | 個人庫多為在地 PDF 素材，用「對照原檔頁碼」即可；線上查驗 ROI 低 |
| 阻斷式 hard gate | 個人單人庫不需要 ARS 那種 terminal 攔截；本 skill 一律 advisory |
| 自動改寫 wiki 條目 | 只產清單，改寫由人工或後續 organizer 重跑決定 |

---

## 執行流程

1. 收集目標條目（全部 `paper-summaries/` 或指定）
2. 對每篇取 `citation_key` → 定位 PDF（無 PDF 或無 key → 標「無法查驗」並略過 B）
3. 跑檢查 A（頁碼存在性）
4. 跑檢查 B（claim-faithfulness，逐條 R 層發現）
5. 彙整待確認清單，存入 `outputs/citation-integrity-YYYY-MM-DD.md`
6. 提供優先核對清單（NOT_SUPPORTED > OVERSTATED > 頁碼越界）

## 輸出格式

```markdown
# 引用誠信檢查報告 — YYYY-MM-DD

## 摘要
- 檢查條目：N 篇 | 可查驗：N | 無法查驗（缺 PDF/key）：N
- 發現問題：頁碼越界 N | OVERSTATED N | NOT_SUPPORTED N

## 🔴 NOT_SUPPORTED（最優先核對）
## 🟡 OVERSTATED
## 🟢 頁碼越界
## ⚪ 無法查驗（建議補 citation_key 或 PDF）
```

---

## Changelog

### v1.0.0（2026-06-26）
- 初始版本（v2.0-kit，提案 P1）
- 兩道檢查：頁碼存在性 + claim-faithfulness（ALIGNED/OVERSTATED/NOT_SUPPORTED）
- advisory 設計，產出待人工確認清單，不阻斷、不自動改寫
- 依賴 citation_key 約定（見 AGENTS.md「資料流地基」）
