# AI 開發工作流框架：分類、使用情境與整合建議

- 建立日期：2026-11-09
- 範圍：使用者列出的 11 個框架，加上 Claude 補充的主流方案
- 資料來源：各 repo 的 README 與 docs；星數與最後更新日於 2026-11-09 以 `gh api` 抓取。標「未查證」者為無法從一手資料確認的內容
- 搭配閱讀：`開發流程與MattPocock截長補短.md`（同在桌面）

---

## 0. 先講結論

| 你的情境 | 建議 |
|---|---|
| 一般 Jira 票、改既有程式（大多數工作） | **維持自己的主流程**，不導入框架；借 Addy 的「反合理化表」、Karpathy 的「外科式修改」補強 |
| 複雜功能、需要多模型把關 | **ai-pair**；可參考 Addy `doubt-driven-development` 補一個較輕的中間層 |
| 大型、跨多個 session 的工作（如 React 遷移） | **Matt 的 to-tickets＋implement**（已在測）；若想換規格框架，候選是 **OpenSpec** |
| Claude 額度用完要交給其他平台 | **multiagent-handoff**；若希望其他平台也遵守同一套紀律，Superpowers／Addy 的跨平台支援最完整 |
| 從零做新產品（想法 → 上線） | 目前沒有這種工作；有的話才看 gstack、BMAD |
| 讓 agent 整晚自己跑 | **不採用**（Ralph、Ruflo 等），與「agent 不自動 commit」衝突 |

**原則：** Spec Kit 已於 2026-11-09 收掉，任務規格只剩 `docs/shared`（主流程）與 `.scratch`（Matt 大型工作）；ZeroSpec 是 Layer 0 的導覽與契約文件，不算任務規格。**不再整套導入任何框架**，只借做法；真要換規格框架，一次只換一套。

---

## 1. 分類總覽

| 類別 | 解決什麼問題 | 你列的 | 補充的 |
|---|---|---|---|
| **A. 規格驅動（SDD）** | 先寫規格再寫程式，規格與任務存成檔案 | OpenSpec、Spec Kit、GSD Core | Kiro、Conductor、cc-sdd、Agent OS、PRPs |
| **B. skill 紀律包** | 讓 agent 遵守工程紀律：追問、TDD、除錯、review | Superpowers、Matt Pocock、Addy agent-skills | Compound Engineering、ECC |
| **C. 角色團隊** | 用 PM、架構師、QA 等角色分工 | BMAD-Method、gstack、agency-agents | wshobson/agents、SuperClaude |
| **D. 多 agent 編排／自主迴圈** | 多個 agent 平行或長時間自己跑 | — | oh-my-claudecode、oh-my-openagent、Ruflo、Ralph loop |
| **E. 任務管理** | PRD 拆任務、接 issue tracker | — | Task Master、CCPM |
| **F. 準則與 context 標準** | 一份規則檔或記憶格式，可疊在任何流程上 | Karpathy 準則 | AGENTS.md、Cline Memory Bank、12-factor-agents |
| **G. 研究與平台** | 不是日常流程：研究工具或團隊平台 | Harness² | HumanLayer、Tessl |
| **H. 官方範例與目錄** | 找 skill、學寫法 | — | anthropics/skills、openai/skills、awesome-copilot、claude-plugins-official |

BMAD 同時屬於 A 和 C；gstack 同時屬於 B 和 C。

---

## 2. 判斷維度

挑框架時看這六件事：

| 維度 | 選項 | 你的現況 |
|---|---|---|
| 工作規模 | 小改／單一功能／多票大型工作／整個新產品 | 多數是單一功能 Jira 票，偶有大型（React 遷移） |
| 程式新舊 | 新專案（greenfield）／既有程式（brownfield） | 幾乎都是既有程式 |
| 協作人數 | 個人／小組／多團隊 | 個人為主 |
| 跨平台需求 | 只用 Claude／多個 agent 平台 | Claude 為主，額度用完交給 Codex、Copilot、agy、opencode |
| 自主程度 | 每步確認／批准計畫後自動跑／整晚自己跑 | 每步確認，commit 一律人工 |
| 環境依賴 | 只要 Markdown／要 Node／要 Python＋uv／要 Bun | macOS，Node、Python 都有 |

---

## 3. 逐項分析

格式：**規模** 指最適合的工作大小；**對你** 是整合建議：
- ✅ 借做法：只挑其中的概念或片段，併進自己的 skill
- 🔍 觀察：目前不導入，條件改變時再評估
- ❌ 不採用

### A. 規格驅動（SDD）

#### OpenSpec — `Fission-AI/OpenSpec`（74k 星，11-09 更新，MIT）
- **流程**：explore → propose → apply → archive；每個變更放 `openspec/changes/<name>/`，archive 後併入 `openspec/specs/`
- **規模**：單一功能～中型；**主打既有程式**
- **優點**：輕量、沒有硬性階段關卡；archive 讓規格持續反映現況；支援 30 多種工具；Stores（beta）可把規劃放在獨立 repo 跨 repo 共用
- **缺點**：Stores 還在 beta；需要 Node 22.12 以上
- **對你**：🔍 **規格框架的首選候選**。形狀跟「requirements → 開發 → doc-update」一樣；若之後想讓規格跨 b2b-backend 與 b2b-manager 共用，Stores 值得試

#### Spec Kit — `github/spec-kit`（149k 星，11-07 更新，MIT）
- **流程**：constitution → specify → plan → tasks → implement → converge（反覆到收斂）；另有 clarify、analyze、checklist；擴充有 bug、assess
- **規模**：中型～大型功能
- **優點**：GitHub 官方；整合約 45 種工具（含 claude、codex、copilot、agy、opencode）；可客製層次最多
- **缺點**：較重，階段多；需要 Python 3.11 以上與 uv
- **對你**：❌ 曾在 app01-double 試用，2026-11-09 已收掉

#### GSD Core — `open-gsd/gsd-core`（11k 星，11-09 更新，MIT；原 repo 64k 星已封存）
- **流程**：每個階段 discuss → plan → execute（平行）→ verify → ship；狀態存在 `.planning/`
- **規模**：大型、跨多個 session 的專案
- **優點**：用新 context 的 subagent 做重活，處理長時間工作的 context 劣化；跨 session 狀態都存在檔案裡
- **缺點**：71 個指令，學習成本高；剛搬新 repo
- **對你**：❌ 太重；你的大型工作已有 Matt to-tickets 在測

#### Kiro（AWS，閉源 IDE）
- **規模**：中型～大型；**對你**：❌ 要換 IDE。規格檔結構未查證

#### Conductor — `gemini-cli-extensions/conductor`（3.8k 星，09-01 更新）
- **流程**：context → spec 與 plan → implement，產物放 `conductor/`；支援 agy、Claude Code
- **對你**：🔍 若 agy 用量變大可參考；目前不需要

#### cc-sdd — `gotalab/cc-sdd`（3.8k 星，10-22 更新）
- Kiro 式規格流程，支援 Claude、Codex、Copilot、agy。**對你**：❌ 與 OpenSpec、Spec Kit 重複

#### Agent OS — `buildermethods/agent-os`（5.6k 星，10-07 更新）
- 從現有程式萃取規範並注入 agent。**對你**：🔍 想法跟你的 `.claude/rules/` 相同；詳細流程未查證

#### PRPs — `Wirasm/prp`（2.3k 星，10-02 更新）
- Product Requirement Prompts。**對你**：❌ 與 requirements 重複

### B. skill 紀律包

#### Matt Pocock skills — `mattpocock/skills`（319k 星，11-05 更新，MIT）
- **流程**：grill → to-spec → to-tickets → implement＋tdd → code-review；另有 diagnosing-bugs、pr、wayfinder
- **規模**：小改～大型都有對應 skill；小而可組合
- **優點**：每個 skill 都小、好改；追問與拆票做得好；不搶走控制權
- **缺點**：spec 和票要接 issue tracker（要先 setup）；不懂公司環境；官方多平台支援少於 Superpowers、Addy
- **對你**：✅ **已在測，繼續用**。採用清單見《開發流程與MattPocock截長補短》

#### Superpowers — `obra/superpowers`（315k 星，11-03 更新，MIT）
- **流程**：brainstorming → git worktree → writing-plans → subagent 開發 → TDD → code review → 收尾；另有 systematic-debugging、verification-before-completion
- **規模**：中型功能
- **優點**：TDD 最嚴格（測試前寫的程式碼會被刪）；**官方支援 Copilot CLI、Codex、agy、Gemini、opencode 等十多種**
- **缺點**：skill 會自動觸發，流程較強制；預設會從其網站載入 logo（可用環境變數關閉）
- **對你**：🔍 與 Matt 功能重疊，**兩者擇一**。只有在「額度用完交給其他平台時也要同一套紀律」變成重點時才換

#### Addy Osmani agent-skills — `addyosmani/agent-skills`（114k 星，11-01 更新，MIT）
- **流程**：/spec → /plan → /build → /test → /review → /ship；25 個 skill、4 個 reviewer 角色、7 份檢查清單
- **規模**：中型功能～上線；涵蓋最廣（含安全、效能、CI/CD、可觀測性）
- **優點**：每個 skill 有「反合理化表」與「必須拿出證據」；`doubt-driven-development` 可經同意找另一家模型複查；`source-driven-development` 要求附官方文件出處；附 routing eval；Codex、Copilot CLI、agy、Gemini 都有原生安裝
- **缺點**：**實作 skill 每完成一段就 commit**，`/build auto` 逐任務 commit，與你的規則衝突；測試與效能內容偏 JS/TS 網頁；Copilot、agy 叫不出 9 個流程指令
- **對你**：✅ **借做法**：反合理化表（加進 requirements、stack-review）、doubt-driven（ai-pair 與一般開發之間的中間層）、source-driven（呼應「不確定就查後端」）。不整套安裝

#### Compound Engineering — `EveryInc/compound-engineering-plugin`（26k 星，11-08 更新）
- **流程**：brainstorm → plan → work → code-review → **compound**（把學到的東西沉澱成下次可用的知識）
- **對你**：✅ 借 `/ce-compound` 的做法，對照你的三層記憶與 knowledge-capture

#### ECC（原 everything-claude-code）— `affaan-m/ECC`（300k 星，11-06 更新）
- skill、記憶、安全設定的大合集。**對你**：❌ 太大太雜；需要時當素材庫翻

### C. 角色團隊

#### BMAD-Method — `bmad-code-org/BMAD-METHOD`（55k 星，11-08 更新；README 寫 MIT，另有商標條款）
- **流程**：小改直接 build；大工作走分析師 → PM（PRD）→ UX → 架構 → PO 拆 story → 逐 story build
- **規模**：從點子到 epic 的**新產品或大型改版**
- **優點**：會依工作大小調整流程；角色清楚
- **缺點**：v7 還是 alpha（README 寫 11 月中正式版），會有破壞性變更；依賴 Node、Python、uv
- **對你**：❌ 你的工作多是既有程式的 Jira 票，用不到這麼多角色。若之後要從零規劃新系統再觀察

#### gstack — `garrytan/gstack`（141k 星，11-09 更新，MIT）
- **流程**：office-hours → CEO review → autoplan → 實作 → review → qa（開真瀏覽器）→ ship → deploy → canary → retro
- **規模**：新創產品從想法到上線
- **優點**：涵蓋 QA、安全稽核、發布、上線後監看
- **缺點**：只有 Claude Code 完整支援，其他平台都是實驗性；外部 review 預設會把程式碼送到 Codex 或 Claude；需要 Bun
- **對你**：❌ 偏產品決策與部署，跟公司 MR 流程不合

#### agency-agents — `msitarzewski/agency-agents`（167k 星，11-09 更新，MIT）
- 上百個有個性的專家角色，沒有流程。**對你**：✅ 只當 prompt 素材（例：Minimal Change Engineer 的規則）

#### wshobson/agents（42k 星）、SuperClaude（24k 星）
- 角色與指令集合。**對你**：❌ 與 agency-agents 同性質

### D. 多 agent 編排／自主迴圈

#### Ralph loop（官方 plugin `ralph-loop` 與多個社群實作）
- 同一個 prompt 一直餵給 agent，直到 PRD 完成
- **規模**：定義清楚、可長時間無人值守的大量工作
- **對你**：❌ 與「agent 不自動 commit、要人判斷」衝突

#### Ruflo（原 claude-flow，81k 星）、oh-my-claudecode（41k 星）、oh-my-openagent（71k 星）
- 多 agent 群體編排、平行執行。**對你**：❌ 你已用 ai-pair 與 Claude Code subagent 處理多 agent；這些更自主、更難控管

### E. 任務管理

#### CCPM — `automazeio/ccpm`（8.4k 星，11-04 更新）
- PRD → epic → GitHub Issues → 用 worktree 平行跑 agent
- **規模**：多人、多 issue 的團隊工作
- **對你**：❌ 綁 GitHub Issues，你的票在 Jira

#### Task Master — `eyaltoledano/claude-task-master`（28k 星，2026-04 後沒更新）
- PRD 拆任務＋MCP。**缺點**：半年沒更新；授權有 Commons Clause 限制。**對你**：❌

### F. 準則與 context 標準

#### Karpathy 準則 — `multica-ai/andrej-karpathy-skills`（231k 星，2026-04 後沒更新，**沒有授權檔**）
- 四原則：先想再寫、簡單優先、外科式修改、目標導向
- **規模**：任何規模，可疊在任何流程上
- **優點**：極輕量，一份 CLAUDE.md
- **缺點**：沒有流程與產物管理；沒有授權，不宜整份複製
- **對你**：✅ 用自己的話把「外科式修改」「多步任務先寫 step → verify」寫進 AGENTS.md

#### AGENTS.md（25k 星）
- **對你**：✅ 已在用

#### Cline Memory Bank、12-factor-agents
- **對你**：❌ 你的三層記憶已涵蓋 Memory Bank；12-factor 是打造 LLM 產品的原則，不是開發流程

### G. 研究與平台

#### Harness² — `google-research/harness2`（23k 星，11-02 更新，Apache-2.0）
- 研究工具：提出 → 實測 → 組合，自動改 harness
- **對你**：🔍 不導入；借方法手動 A/B 測試 reviewer prompt

#### HumanLayer（13k 星）、Tessl
- 團隊控管平台、skill registry。**對你**：❌ 個人開發用不到；Tessl 的規格框架未查證

### H. 官方範例與目錄

anthropics/skills（190k 星）、openai/skills（29k 星）、awesome-copilot（41k 星）、claude-plugins-official（47k 星）
- **對你**：✅ 寫新 skill 時參考格式；找 plugin 時先查官方目錄

---

## 4. 依情境選用

| 情境 | 規模 | 推薦 | 備選 | 不要用 |
|---|---|---|---|---|
| 一行修正、設定、i18n | 極小 | 直接改＋Karpathy 原則 | — | 任何框架（成本大於效益） |
| 一般 Jira 票，改既有程式 | 小～中 | **你的主流程** | OpenSpec | BMAD、gstack、GSD |
| 複雜功能、高風險修改 | 中～大 | **ai-pair** | Addy doubt-driven | Ralph |
| 困難 bug | 不定 | Matt diagnosing-bugs | Superpowers systematic-debugging、Addy debugging | — |
| 大型、跨多 session（如 React 遷移） | 大 | **Matt to-tickets＋implement** | OpenSpec、GSD Core | Ralph、Ruflo |
| 新產品從零到上線 | 很大 | BMAD | gstack | Karpathy 單用 |
| 多人團隊、GitHub Issues | 中～大 | CCPM | Spec Kit | — |
| 額度用完交給其他平台 | 不定 | **multiagent-handoff** | 搭配 Superpowers／Addy 讓紀律跨平台一致 | gstack（非 Claude 平台只到實驗性） |
| 無人值守批次工作 | 大 | — | Ralph（僅限個人實驗 repo） | 公司 repo 一律不用 |

---

## 5. 整合優先順序

| 順序 | 動作 | 來源 | 成本 |
|---|---|---|---|
| 1 | requirements、stack-review 加「反合理化表」 | Addy | 低 |
| 2 | AGENTS.md 加「外科式修改」「step → verify」 | Karpathy（用自己的話改寫） | 低 |
| 3 | Matt 的 7 個免設定 skill 搬到 `~/.agents/skills/` | Matt | 低 |
| 4 | stack-review 加「對照 spec」平行審查 | Matt matt-code-review | 中 |
| 5 | 評估 doubt-driven 當 ai-pair 的輕量版 | Addy | 中 |
| 6 | Spec Kit 已收掉；釐清 ZeroSpec 與 project-documentation 的分工，再決定要不要試 OpenSpec | — | 中 |
| 7 | 參考 `/ce-compound` 檢視知識沉澱時機 | Compound Engineering | 低 |

---

## 6. 未查證

- Kiro 目前的規格檔結構
- Tessl 是否還有獨立的規格驅動框架
- Ruflo 是否保留 SPARC
- Agent OS 的詳細流程與產物位置（細節在官網，README 只有連結）
