---
name: paper-knowledge-backflow
description: |
  Bridge skill (ARS → kit). After a paper is finalized, extracts three kinds of
  knowledge from ARS outputs (review reports, response-to-reviewers, final draft)
  and distills them back into the kit wiki: methodology decisions, rebuttal lessons,
  and cross-paper insights. Closes the knowledge-asset loop so each finished paper
  thickens concepts/.

  Trigger: paper-knowledge-backflow, 知識回灌, 回流 kit, backflow, paper 收尾,
           審稿攻防沉澱, 論文知識資產化
metadata:
  version: 1.0.0
  target: 學術研究者、教授
  origin: P7（ARS → kit 資料流橋接，資產化閉環）
---

# paper-knowledge-backflow

kit 是長期資產引擎，但 ARS 撰稿/審查階段「打過一場仗才學到的東西」
預設留在 ARS 工作區、論文一結案就流失。
本 skill 在流程末端把這些知識**回灌 kit wiki**，讓資產化不在撰稿階段斷鏈。

> **資料流定位**：端到端工作流階段 11（知識回流）。ARS ──→ kit。
> 這是「個人知識資產化閉環」的關鍵一步——每寫一篇論文，concepts/ 就厚一層。

## 使用方式

```
paper-knowledge-backflow outputs/ars-handoff/...   # 指定已完成論文的 ARS 產物
論文知識回灌 學習動機                                # 對某主題的完稿論文做回灌
```

---

## 萃取三類知識 → 三個落點

### 1. 方法論決策 → `wiki/concepts/` 或 `research/`

從草稿的 Method 段 + 研究設計討論萃取：
- 為何選此 method（vs 候選方法的 trade-off）
- 執行時踩過的坑、調整
- **可重用性**：下次類似研究可直接參考

格式：TBRC（B 層放適用條件、R 層放決策理由）。

### 2. 審稿攻防 → `wiki/rebuttal-lessons/`（v2.0 新類別）

從 ARS review report + response-to-reviewers 萃取：
- reviewer 打你哪個論點 / 哪個弱點
- 你怎麼補強 / 反駁 / 讓步
- **變成「論點防禦」資產**：下次寫到相關主張時，預先知道會被攻擊哪裡

格式：
```markdown
## 論點：[被挑戰的主張]
**攻擊**：reviewer 質疑 [...]
**回應**：[你怎麼補強——補數據 / 限縮範圍 / 補文獻]
**教訓**：[下次寫到此類主張要先準備什麼]
**關聯**：[[citation_key]]（原始 paper-summary）
```

### 3. 撰稿時的跨 paper 新洞察 → knowledge-elevation

寫作過程冒出、原本精粹條目裡沒有的連結，餵回 elevation 流程更新 `concepts/`。

---

## 執行流程

1. 定位該論文的 ARS 產物（review report / response / final draft）
2. 萃取三類知識（方法論 / 審稿攻防 / 新洞察）
3. **回填 join key**：每筆回灌知識標注原始 `citation_key`，串回對應 `paper-summaries/`
4. 產出對應 wiki 條目（待人工確認後入庫）：
   - 方法論 → `concepts/` 或 `research/`
   - 審稿攻防 → `rebuttal-lessons/`
   - 新洞察 → 觸發 knowledge-elevation
5. 更新 `wiki/INDEX.md`
6. 提示是否觸發 wiki-health-check 確認新條目連結品質

## 範圍邊界

- **產出待人工確認**：回灌是「沉澱草稿」，由你審過再正式入庫
- **不回寫 ARS**：單向 ARS → kit
- **rebuttal-lessons/ 是 v2.0 新增類別**：需在 AGENTS.md 資料夾結構登記（已含）

---

## Changelog

### v1.0.0（2026-06-26）
- 初始版本（v2.0-kit，提案 P7）
- 三類知識回灌：方法論決策 / 審稿攻防（新 rebuttal-lessons/）/ 跨 paper 新洞察
- 回填 citation_key 串回 paper-summaries，完成資產化閉環
- 單向 ARS → kit，產出待人工確認
