---
name: synthesis-to-ars-export
description: |
  Bridge skill (kit → ARS). Exports kit's distilled knowledge (topic-synthesis CAVE
  entries + related paper-summaries) into materials that Academic Research Skills (ARS)
  can consume for drafting: a lit-review seed (from C/A/V) and a bibliography list
  (citation_key + DOI + page locators). Writes to outputs/ars-handoff/.

  Trigger: synthesis-to-ars-export, 撰稿橋接, 匯出 ARS, ars handoff, kit to ars,
           lit-review seed, 文獻回顧底稿
metadata:
  version: 1.0.0
  target: 學術研究者、教授
  origin: P8（kit → ARS 資料流橋接）
  prerequisite: knowledge-synthesizer（需有 wiki/topic-synthesis/ 條目）+ citation_key 約定
---

# synthesis-to-ars-export

把 kit 精煉好的文獻回顧與概念框架，轉成 [ARS](https://github.com/Imbad0202/academic-research-skills)
（或 Codex 版 academic-research-skills-codex）撰稿可吃的素材。
解決三套系統間「kit → ARS 要手動複製」的接縫。

> **資料流定位**：端到端工作流階段 6（撰稿前橋接）。kit ──→ ARS。
> 詳見 `docs/codex-desktop-integration-v2.1.md` 的流程圖。

## 使用方式

```
synthesis-to-ars-export 學習動機              # 匯出該主題的撰稿素材
synthesis-to-ars-export wiki/topic-synthesis/synthesis-learning-motivation.md
匯出 ARS 撰稿素材 教育科技
```

---

## 輸出兩份素材

### 1. lit-review seed（文獻回顧底稿）

把 CAVE 精粹直接對應成論文文獻回顧的段落骨架：

| CAVE 維度 | → 對應論文段落 |
|-----------|--------------|
| **C 共識核心** | 「該領域已建立的共識」段 |
| **A 獨特視角** | 「各家取徑與貢獻」段 |
| **V 研究缺口 + 來源衝突** | 「研究缺口 / 未解爭議」段（直接是你論文的切入點）|
| **E 一句話洞察**（若有 elevation）| 「本研究的理論定位」引子 |

每段保留 `[[citation_key]]` 來源標記，方便 ARS 撰稿時對接引用。

### 2. bibliography 清單

供 ARS 引用查驗對接，每筆帶：
```yaml
- citation_key: Smith2023
  doi: 10.xxxx/xxxxx
  title: ...
  authors: ...
  year: 2023
  journal: ...
  used_pages: [23, 45-47, 89]    # 來自 paper-summaries R 層的 [p.X]
```

---

## 執行流程

1. 解析輸入（主題關鍵字 → 找對應 `topic-synthesis/`；或指定檔案）
2. 讀取該精粹條目 + 它引用的所有 `paper-summaries/`（用 `[[citation_key]]` 回溯）
3. 產 lit-review seed（CAVE → 段落骨架）
4. 產 bibliography（從 paper-summaries frontmatter 收 citation_key/doi/used_pages）
5. 寫入 `outputs/ars-handoff/{topic}-{YYYY-MM-DD}/`：
   - `lit-review-seed.md`
   - `bibliography.yaml`
   - `README.md`（如何把這兩份帶進 ARS / ARS-codex 的簡短說明）

## 範圍邊界

- **只做格式轉換與彙整**，不撰寫論文（撰稿是 ARS 的事）
- **產出待人工確認**：seed 是骨架不是成稿，人工調整後再餵 ARS
- **不直接寫入 ARS 工作區**：輸出到中立交換資料夾 `outputs/ars-handoff/`，由你手動帶入（保持三套系統解耦）

---

## Changelog

### v1.0.0（2026-06-26）
- 初始版本（v2.0-kit，提案 P8）
- 輸出 lit-review seed（CAVE → 論文段落骨架）+ bibliography.yaml
- 寫入中立交換資料夾 outputs/ars-handoff/，保持系統解耦
- 依賴 citation_key 約定（見 AGENTS.md「資料流地基」）
