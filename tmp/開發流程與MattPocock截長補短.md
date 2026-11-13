# 開發流程 × Matt Pocock skills 截長補短方案

- 建立日期：2026-11-09
- 依據：本機盤點（`~/.agents/skills`、`~/.claude`、`~/GitLab/*/.claude`）、對話紀錄 2026-09-23～11-09 的叫用次數、使用者確認的主流程
- 流程地圖（網頁版）：https://claude.ai/artifact/CED2Exg268jahwbtTwgkPD
- 狀態：✅ 截長補短完成（2026-11-09）：第 6 節步驟 1～5 已落地，流程版本頁更新為 v2，v1／v2 比對已完成；步驟 6 是 React 遷移結束後的回顧，不擋第 8 節第 2 項
- 整體進度（2026-11-09）：第 8 節第 1、2 項完成，流程版本頁為 v3；第 3 項等 v3 在實際任務用過、流程穩定後再開始；第 4 項的角色分類草案已先做（8 個角色、5 類；App 工程師為通用行動 App 工程師，涵蓋 Flutter、iOS、Android、React Native，公司專案預設 Flutter），正式規劃仍等第 1～3 項
- 同步狀態（2026-11-09）：知識庫 `rules/decision-framework`、`research/dev-workflow-optimization-tools`、`wiki/concepts/ai-dev-workflow-taxonomy`、`outputs/fable-workflow-institutionalization-plan-2026-07-08` 已更新為流程 v3，`research/claude-pilot-suite-single-agent-workflow` 加註；b2b-manager 的 `list-page-header.md` 與 `AGENTS.md` 1.10 已加清除鍵規則
- ⚠️ 待使用者決定（2026-11-09 發現）：`my_develop_skill_file`（`~/.agents` 備份，含 `memory/projects`、`memory/shared`）、`ai--agent-file-store`（含公司專案 onboarding）、`my_llm_wiki` 三個 GitHub repo 是 public，內有公司相關內容，建議改 private；尚未變更。2026-11-10 用 `gh` 複查，三個都還是 PUBLIC，建議排在所有後續工作之前（見第 9 節）
- 相關文件都在本資料夾：借來的做法整合方案、workflow-bench試跑報告、角色盤點、角色分類草案、AI開發工作流框架分類與選用建議；網頁版 [AI 設計工作流選用指南](https://claude.ai/artifact/QC192r6VRfP2upwWbMpHHD)

---

## 1. 結論

**以自己的主流程為骨幹，把 Matt 的 skill 當零件插進固定位置；不另開一條平行流程，也不整套換掉。**

主流程綁著公司環境（Jira 票號、`docs/shared/`、後端契約 hook、DESIGN.md token、三層記憶），Matt 的 skill 都沒有這些，整套換掉代價很大。Matt 補的是主流程裡沒有的工程紀律：需求追問、測試先行、除錯流程、MR 說明格式、對照 spec 的 review。

---

## 2. 目前的主流程（2026-11-09 確認）

| 步驟 | 工具 | 產出 |
|---|---|---|
| ① 確認需求 | Jira MCP | — |
| ② UI 需求（有設計稿才做） | figma-to-requirements | UI 任務草稿 |
| ③ 任務文件 | requirements | `docs/shared/{feature}.md` |
| ④ 開發 | Claude | 程式碼、測試 |
| ⑤ Review | stack-review | 審查結果 |
| ⑥ 收尾 | doc-update | 任務文件標完成、CHANGELOG、索引 |
| — | 人工 | commit、push、開 MR |

不在主流程裡、需要時才啟動的：

| 工具 | 什麼時候用 |
|---|---|
| ai-pair dev-team | 比較複雜的開發需求與 review，取代 ④⑤ |
| multiagent-handoff | 已完成可用；Claude 額度快用完時交給其他平台 agent 接手 |
| project-documentation | 背景維護現況文件（架構、API、變更歷程），`check_docs_lag.py` 提醒時才跑；產出給 ③ 讀 |
| Matt 整套拆票流程 | 測試中（b2b-manager React 遷移） |

---

## 3. 重合比較

| 階段 | 我的 | Matt | 我的長處 | 我的短處 | Matt 的長處 | Matt 的短處 |
|---|---|---|---|---|---|---|
| 需求釐清 | requirements | grill-me、grilling | 自己查證：讀既有文件、上游後端、程式碼 | 不會追問，需求不清楚就照猜的寫 | 逐題追問到沒有模糊地帶 | 不懂公司後端，只問人不查程式碼 |
| 寫規格 | requirements | to-spec | 固定格式進 `docs/shared/`，有索引與 doc-update 收尾 | 一份文件塞全部，大型功能很長 | 直接整理已討論內容，很快 | 放 `.scratch/` 不進版控，沒有後端契約欄位 |
| 拆任務 | requirements 任務清單 | to-tickets | 附 code snippet，交給外部 CLI 就能做 | 沒有相依關係，無法平行或跨 session 排程 | 一票一檔、標 blocking，可平行實作 | 一般 Jira 票用太重 |
| 開發 | Claude／ai-pair | implement、tdd | ai-pair 多家模型互補盲點 | 沒有測試先行的紀律 | 紅燈、綠燈、重構的回饋迴路 | 舊 Flutter 程式缺測試時難套 |
| 除錯 | 無 | diagnosing-bugs | — | **缺口** | 先建能重現的回饋迴路再修 | — |
| Review | stack-review／ai-pair | matt-code-review | 依技術棧的規範清單、先 fetch 遠端 | 一般任務不對照 spec | 規範與 spec 兩方面平行審 | 規範要靠 repo 自己寫好；單一模型 |
| 交接 | multiagent-handoff | handoff | 跨平台 save、delegate、report、review | 流程較長 | 一個指令壓縮對話 | 只有壓縮，與我的重複 |
| MR 說明 | 無（寫在交接檔「下一步」） | pr | — | **缺口** | 摘要、前後對照、合併風險 | — |
| 寫給 agent 的文件 | 記憶裡的規則 | writing-for-agents | 規則來自實際踩坑 | 寫 skill 時不會自動套用 | 寫 skill／CLAUDE.md 時自動觸發 | 不知道我的跨 agent 架構 |
| 回顧 | 三層記憶、knowledge-retro | retro | 寫哪一層有明確規則 | 沒有固定時機 | session 結束就提出改善 | 只提建議不寫記憶 |

---

## 4. 截長補短後的流程

```
① Jira MCP 確認需求
     └─ 需求模糊 → grilling 追問              ← Matt
② figma-to-requirements（有設計稿才做）
③ requirements → docs/shared/
     └─ 大型、跨多個 session → to-tickets 拆票  ← Matt
④ Claude 開發
     ├─ 新程式 → tdd                          ← Matt
     └─ bug 卡住 → diagnosing-bugs             ← Matt
⑤ stack-review（加上「對照 spec」）            ← 吸收 matt-code-review
⑥ doc-update
     └─ pr 寫 MR 說明 → 人工開 MR              ← Matt

複雜需求：④⑤ 改走 ai-pair dev-team
額度快用完：multiagent-handoff save → 其他平台接手 → resume、review
```

---

## 5. 逐項決定

### 5.1 採用（插進主流程）

| Matt skill | 插在哪 | 怎麼接 | 需要 repo 設定？ |
|---|---|---|---|
| grilling／grill-me | ① 之後 | requirements Step 1 加一條：需求有模糊處時先叫 grilling | 不需要 |
| diagnosing-bugs | ④ | 卡住時手動叫；description 已能自動觸發 | 不需要（GLOSSARY 可有可無） |
| tdd | ④ | 新程式（例如 `next/`）用；舊 Flutter 程式視情況 | 不需要 |
| pr | ⑥ 之後 | doc-update 完成後叫 pr 寫 MR 說明 | 不需要 |
| writing-for-agents | 改 skill、AGENTS.md 時 | 自動觸發 | 不需要 |
| retro | session 結束 | 手動叫；結論依三層記憶規則決定寫哪 | 不需要 |
| to-tickets | ③ 之後（大型工作） | requirements 產出後，工作跨多個 session 才拆 | **需要** `/setup-matt-pocock-skills` |

### 5.2 合併（把長處吸收進自己的 skill）

| 對象 | 吸收什麼 | 改法 |
|---|---|---|
| stack-review | matt-code-review 的「對照 spec」 | 有 `docs/shared/` 任務文件時，多派一個 subagent 專門比對「有沒有照任務文件做、有沒有多做或漏做」，跟規範審查平行跑 |
| requirements | grilling 的追問 | Step 1 理解需求時，發現模糊處就叫 grilling，而不是自己猜 |

### 5.3 不採用或移除

| Matt skill | 理由 |
|---|---|
| handoff | 與 multiagent-handoff 重複且功能少；兩個並存容易叫錯。從 b2b-manager 移除 |
| to-spec | 與 requirements 重複；requirements 有後端契約與 `docs/shared/` 收尾 |
| implement／implement-spec | 一般任務由 Claude 直接開發；大型工作若繼續用 Matt 流程才保留 |
| triage | 票在 Jira，不在本機 `.scratch/` |

### 5.4 留著備用（不放進流程，需要時再叫）

wayfinder、prototype、improve-codebase-architecture、codebase-design、domain-modeling、research、teach、wizard、to-questionnaire、wait-what、ask-matt。

---

## 6. 落地步驟

1. **搬到共用位置**：把 5.1 中「不需要 repo 設定」的 7 個 skill（grilling、grill-me、diagnosing-bugs、tdd、pr、writing-for-agents、retro）複製到 `~/.agents/skills/`，連同 `LICENSE-mattpocock`（MIT，需保留授權聲明），再跑 `~/.agents/link-skills.sh`。這樣所有 repo 和其他 agent 都讀得到。
2. **處理同名衝突**：b2b-manager 的 `.claude/skills/` 留著同名副本的話，專案層會優先，改共用版時記得刪專案版，或只留一份。
3. **改 requirements**：Step 1 加上「需求模糊 → grilling」。
4. **改 stack-review**：加「對照 spec」的平行 subagent（見 5.2）。
5. **移除 Matt handoff**：從 b2b-manager `.claude/skills/` 刪除。
> ✅ 1～5 已於 2026-11-09 完成：
> - 共用位置多了 7 個 skill＋`LICENSE-mattpocock`＋`MATTPOCOCK-SOURCE.md`（記來源與本機修改）；`link-skills.sh` 已連到 Claude Code 與 agy
> - tdd 本機修改：`codebase-design` 改成「repo 有才叫」、重構歸屬改指 stack-review
> - b2b-manager 已刪同名副本 7 個與 handoff；`.mattpocock-source` 已記錄。ask-matt 內文仍提到 `/handoff`（備用 skill，未改）
> - requirements 1.5.0：Step 1 加「需求模糊 → grilling」，只問查不到、只有人能決定的事
> - stack-review 1.5.0（存檔版本歷程原為 1.4.0，本體檔頭一直停在 1.1.0，已一併校正）：新增 Step 4b，有 `docs/shared/` 任務文件時平行派 spec subagent，結果獨立一節、不跟規範審查混排

> - 同步到 Skill存檔（`dev/requirements`、`dev/stack-review`、新增 `dev/mattpocock-skills/`）、`SKILL_INDEX.md`、`my-technical-notes/agent-skills/skills-list.md`
> - 驗證：workflow-bench 回放 SSGS-13687，v1、v2 都 14/14；v2 多了 spec 審查與 pr，費用 +18%（見〈workflow-bench試跑報告_SSGS-13687.md〉）

6. ⏸️ **React 遷移結束後回顧**（延後，不擋後續工作）：決定 to-tickets、implement、matt-code-review 要不要留在大型工作用；結論寫進 `docs/shared/` 的回顧文件，`.scratch/` 只當草稿。

---

## 7. 待決事項

- [ ] 規格存放位置：Spec Kit 已於 2026-11-09 收掉；任務規格剩 `docs/shared/`（主流程）與 `.scratch/`（Matt 大型工作）。ZeroSpec（app11-double）是 Layer 0 導覽與契約文件，要另外釐清它跟 project-documentation、手寫 AGENTS.md、Matt ADR 的分工。
- [x] `docs/shared/` 是否進版控 → 2026-11-10 決定：不進版控（本來就被 `.gitignore` 的 `/docs/` 涵蓋）。to-tickets 產出放 `.scratch/`，同樣不進版控。
- [x] stack-review 加 spec 審查後，一般任務與 ai-pair 的分界要不要重新定義。→ 2026-11-09 決定：一般任務走主流程，遇到高風險決定用 doubt-check；一開始就知道要動多個風險區塊才走 ai-pair（見〈借來的做法整合方案.md〉第 7 節）

---

## 8. 後續工作（依序進行，前一項完成才開始下一項）

| 順序 | 工作 | 開始條件 | 產出 | 狀態 |
|---|---|---|---|---|
| 1 | 完成本文件的截長補短（第 6 節落地步驟） | — | 改好的 requirements、stack-review；搬好的 Matt skill | ✅ 2026-11-09（步驟 6 延後到 React 遷移結束） |
| 2 | 把「借來的做法」整合進現有流程 | 第 1 項完成 | 桌面新文件：借來的做法整合方案（反合理化表、source-driven、doubt-driven、外科式修改、/ce-compound 各自改在哪裡） | ✅ 2026-11-09 完成（requirements 1.6.0、stack-review 1.6.0、doc-update 1.2.0、新增 doubt-check 0.1.0、個人層記憶〈外科式修改〉）；版本頁已更新為 v3；bench v3 完成（14/14，$4.79，沉澱判斷有作用）；v3 提議的規則已採用，加進 b2b-manager `.claude/rules/list-page-header.md` 與 `AGENTS.md` 1.10 |
| 3 | 把自己的 workflow 包成 plugin、建個人 marketplace | 第 2 項完成、流程穩定 | 依功能分組的 plugin；本機目錄 marketplace | ▶️ 可以開始（2026-11-11 開始條件達成；**一併設計「畫面與 Flutter 並排比對」步驟**（使用者決定，方法見跨專案記憶〈reference_flutter_web_ui_compare〉，v3 沒有對應機制）；操作紀錄 01～03 走完 stack-review＋doc-update，三個 v3 機制各有實際紀錄，見〈v3實測報告_02-log-drawer.md〉第 7 節）；🚧 2026-11-11 進行中（細節見〈plugin分組草案.md〉第 9～14 節）：個人 marketplace `alexanderchen5966-marketplace` 已建在本資料夾，拆成 `core`（6 skill）、`dev`（9 skill＋code-reviewer）、`dev-app`（figma-to-requirements）、`dev-web`（新寫的 flutter-ui-compare，即「畫面與 Flutter 並排比對」）四包，只在本資料夾以 local scope 啟用；只留 plugin 版的叫用測試 9 項通過；stack-review 升到 v1.8.0（加 `ios.md`、`react-native.md`）；slc marketplace 借鑒 8 項已規劃（第 11.1 節）。**尚未取代 `~/.claude/skills` 的 symlink**。角色啟用清單已回填（第 4 節，還沒寫進資料夾）；只做 Claude Code，其他 agent 先不處理；plugin 仍是實驗，效果不好就退回 symlink＋記憶。切換前置已完成（2026-11-11）：查證設定只在 git repo 根目錄與子資料夾生效、`~/GitLab` 層級無效；還原腳本在假家目錄演練通過（〈plugin分組草案.md〉第 15 節）。順序：正式切換 → 補測（第 12.6 節，含 flutter-ui-compare 與新清單實跑）→ 調整 slc 借鑒項目。✅ 2026-11-11 已正式切換、補測 8 項全過（〈plugin分組草案.md〉第 12.6、16 節），流程版本頁更新為 v4；補測發現的待辦與 workflow-bench v4 快照見該文件開頭「下次接手」 |
| 4 | 角色切換 | 現有流程都改良完成（第 1～3 項） | 桌面新文件：角色切換規劃（role.yaml 格式、三層架構、跨平台與非終端機使用者的擴充點） | 📋 前置已先做（2026-11-09）：〈角色盤點_角色切換前置.md〉（盤點與決定）、〈角色分類草案.md〉（8 個角色、5 類；功能包、role.yaml 草稿、去 AI 味清單、創新創業的反問規則與一頁決策；待定 14 項）；正式規劃（啟動器、轉接層）仍等第 1～3 項；草案列的工具都還沒安裝 |

> **2026-11-10 使用者決定（明天接續）**：
> - 第 3 項的「流程穩定」定義為：操作紀錄這張卡（01～03）走完 stack-review＋doc-update，三個 v3 機制在實際任務各有一次紀錄，就可以開始做 plugin
> - 採用第 9.2 節第 4 點：requirements 對碰到風險清單的任務標「需 doubt-check」、stack-review 檢查有沒有複查紀錄、doubt-check 的跨模型改成每次叫用問一次。✅ 2026-11-11 已改：requirements 1.7.0、stack-review 1.7.0、doubt-check 0.2.0，存檔與兩份清單已同步
> - 票 03：使用者開 Chrome（Claude in Chrome）並登入 Flutter staging 後開始並排比對
> - 接續順序：改三個 skill → 03 比對 → stack-review → doc-update（沉澱判斷）→ 開始第 3 項。✅ 2026-11-11 前四步完成，下一步是第 3 項
> - 01～03 已 commit（`383d1c3e`、`eb70d3f2`、`10a41b89`，未 push）；02 的 doubt-check 跨模型一直沒問

> 2026-11-09 與使用者討論後排定。第 2、4 項的文件到時候由 Claude 撰寫並放在桌面。
>
> 流程版本頁（artifact）：https://claude.ai/artifact/TVWdDupHzBGXhF8nusPHPz 。v1 是整合 Matt 前的基準版；第 1、2、3 項完成後分別更新成 v2、v3、v4（從新對話更新時，把這個網址交給 Claude）。
> 2026-11-09 已更新成 v2（第 6 節步驟 1～5 完成；to-tickets 標「待 React 遷移結束回顧」），同日再更新成 v3（第 2 項完成）。2026-11-11 更新成 v4（第 3 項切換與補測完成）。原始 HTML 在暫存資料夾，會被清掉；下次改請 Claude 先讀線上版。
>
> 版本比對：`~/.agents/experiments/workflow-bench/`，每版只用 SSGS-13687 跑一次。v1、v2、v3 結果見〈workflow-bench試跑報告_SSGS-13687.md〉（都是 14/14；費用 v1 $4.18、v2 $4.94、v3 $4.79）。第 2、3 項完成後，先把新版 skill 快照放進 `versions/`，再跑一次比對。

---

## 9. 檢視後的改進建議（2026-11-10）

- 狀態：📝 第 9.2、9.3 節的改進建議仍待決定、尚未實作；已選定一張實際 task（`02-log-drawer`），2026-11-10 已只測不實作地跑過一次 v3 的 doubt-check 與 source-driven（見第 9.5 節）
- 依據：2026-11-10 讀完本資料夾六份文件，對照 `~/.agents/skills/` 的 doubt-check 0.1.0、doc-update 1.2.0 原文、`~/.agents/experiments/workflow-bench/`，並用 `gh` 查三個備份 repo 的公開狀態
- 整體判斷：「不另開流程、把借來的做法拆成零件塞進既有 skill」的方向維持不變

### 9.1 三個 repo 仍是公開的（2026-11-10 使用者決定：維持 PUBLIC，不再詢問）

`my_develop_skill_file`、`ai--agent-file-store`、`my_llm_wiki` 在 2026-11-10 都還是 PUBLIC，內有公司專案記憶與 onboarding。`~/.agents` 另有一批未提交的記憶修改，改成 private 之前不要再 push。

### 9.2 對流程 v3 的建議

| # | 問題 | 建議 | 要改的地方 |
|---|---|---|---|
| 1 | bench 三版都 14/14，v3 比 v2 便宜 3% 在只跑 1 次的情況下是雜訊，卻仍是每版的驗收依據 | 二選一：換一張 v1 會失分的卡當固定題目（候選 SSGS-12729、SSGS-13504；三版重跑一次約 15 美元），或明講 bench 只看費用與觸發、不當品質依據 | workflow-bench、試跑報告第 5 節 |
| 2 | 第 8 節第 3 項的開始條件「流程穩定」沒有定義 | 改成可檢查的條件：跑完 5 張實際的卡，每張記下 doubt-check、source-driven、沉澱判斷各自有沒有觸發、有沒有找到真問題。這份紀錄同時補上 bench 測不到的三個機制 | 本文件第 8 節 |
| 3 | 只加不減：requirements 376 行、stack-review 410 行；藉口表的效果「無法直接觀察」；ai-pair 期間內 0 次 | 每個新機制附一條退場條件（例：5 張卡都沒觸發或沒找到東西就移除） | 借來的做法整合方案。✅ 2026-11-11 四個機制都已加（doubt-check 3 張標記的卡；source-driven、沉澱判斷、藉口表各 5 張卡），條件與追蹤表在〈v3實測報告〉第 8 節，由 doc-update 1.3.0 Step 8 結案時補 |
| 4 | doubt-check 靠 agent 自己判斷要不要觸發，但它要對付的正是過度自信 | requirements 寫任務文件時，把碰到風險清單的任務標「需 doubt-check」；stack-review 檢查有沒有複查紀錄。跨模型從「每一輪都問」改成「每次叫用問一次」（現在一個決定最多問 3 次） | requirements、stack-review、doubt-check |
| 5 | 沉澱判斷的順序從「測試」開始，少了原文的第一級「讓錯誤寫法不可能存在」，lint 也漏了 | doc-update Step 7b 在最前面加一級：改共用元件或型別的預設行為、加 lint。這一級只提議另開任務，不在當下改，才不和外科式修改衝突。例：SSGS-13687 是 14 處同樣的錯，根因是共用元件要每個呼叫端自己記得清欄位並重抓 | doc-update |

### 9.3 對順序的建議：第 3、4 項合併設計

- 〈角色分類草案.md〉的功能包（core、dev、company、design 等）和第 3 項「依功能分組的 plugin」是同一件事，分開做會分兩次組。建議包的邊界定一次，角色就是「啟用哪幾個 plugin」
- ⚠️ 未查證：Claude Code 能否依資料夾分別啟用 plugin。能的話 Claude Code 這邊可能不需要自寫啟動器；設計前要先確認
- 先做少數角色：8 個角色、14 項待定、6 個沒實測的外部工具，範圍已超出開發流程升級。建議先做公司與非公司的隔離，以及兩個開發角色；其餘等有實際任務再加
- 第 7 節的「`docs/shared/` 是否進版控」建議在第 3 項開始前定案：它是 ③⑤⑥ 的骨幹

### 9.4 已順手修正的文件小問題（2026-11-10）

- 〈角色盤點〉結論補註角色已增加到 8 個
- 〈角色分類草案〉第 7 節待定項目依編號重新排列（編號與內容不變）
- 〈workflow-bench試跑報告〉檔頭的原始資料路徑補上 v3
- 未解：v3 新增測試從 15 項變 14 項，報告沒有記錄原因，待查

### 9.5 已選定的 v3 實測 task（2026-11-10）

- **Task**：`.scratch/log-react/issues/02-log-drawer.md`（Log Drawer；目前 `ready-for-agent`）
- **執行者／時機**：2026-11-10 由 Claude 只測不實作地執行一次；task 本身仍未實作（被 01 擋著）
- **結果（2026-11-10）**：只測、未實作；兩個機制都找到具體問題，但 doubt-check 是人工觸發，「agent 會不會自己觸發」沒有測到。見〈v3實測報告_02-log-drawer.md〉
- **檢測目標**：
  - **doubt-check**：評估共用 HTTP client 僅對 logs 的 `request_body`／`response_body` 保留原始 JSON key，且不改變其他頁面行為的決策。
  - **source-driven**：依 `next/package-lock.json` 的實際版本查核 Drawer、剪貼簿與 Blob 下載等套件／平台 API 用法，記錄文件出處；查不到的部分明確標為未驗證。
- **後續（2026-11-10）**：使用者決定從 01 做到 02 完成，v3 流程用真實實作再測一次，結果見〈v3實測報告_02-log-drawer.md〉第 6 節
- **判讀**：分別記錄兩項機制是否在適當時機觸發、是否找到具體問題或確認契約；未觸發時記下原因，不把「有跑流程」當成有效果。
