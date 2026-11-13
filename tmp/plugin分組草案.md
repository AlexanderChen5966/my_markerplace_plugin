# plugin 分組草案（第 3 項：把 workflow 包成 plugin、建個人 marketplace）

- 建立日期：2026-11-11
- 對應：〈開發流程與MattPocock截長補短.md〉第 8 節第 3 項，並採用第 9.3 節「第 3、4 項合併設計」
- 狀態：✅ 2026-11-11 已正式切換（第 16 節），切換後補測 8 項全部通過（第 12.6 節）。四包 `core`、`dev`、`dev-app`、`dev-web`（第 14 節）已依第 4 節寫進各資料夾；`~/.claude/skills` 的 symlink 已拿掉，Claude Code 只從 plugin 載入。plugin 仍可退回 symlink＋記憶（第 4.5 節、第 16 節的備份）。artifact 兩頁（流程版本頁 v4、流程地圖第 4 節）已更新到「已切換、補測全過」
- **2026-11-11 收工紀錄**：plugin 切換、補測 8 項、補測發現的修正都完成並已 push；推薦紀錄頁（列表＋匯出）處理完；明細頁另開卡、尚未開始
- **明天（2026-11-12）接續**：
  1. workflow-bench v4 跑比對：`scripts/setup_run.sh SSGS-13687 v4 1` → `run.sh runs/SSGS-13687-v4-r1` → `analyze.py`（約 $5；結果補進〈workflow-bench試跑報告_SSGS-13687.md〉，與 v1～v3 比）
  2. slc 借鑒（第 11.1 節）：`plugin.json` 的 `version`、SKILL.md 薄入口、規則只放一份、記憶查證欄位、回顧提議編號
  3. artifact 兩頁還沒更新到「補測待辦已處理」：〈本機開發流程〉的「補測發現的待辦」那一節要把已改的項目標 ✅（上次更新被中斷，頁面維持前一版；內容見下面第 2 點的清單）
  4. 可選：`~/.agents` 裡 `memory/projects/b2b-manager/` 兩個檔案是另一個 session 改的專案記憶，還沒 commit；b2b-manager 明細頁（`ReferralRecordDetailPage`）另開卡
- **下次接手**：
  1. 先讀第 16 節（切換做了什麼、備份路徑）、第 12.6 節（補測結果與發現）
  2. 補測發現的待辦（見 12.6.1～12.6.3）：
     - ✅ 2026-11-11 headless 讀不到 plugin 內 `reference/*.md`：user 層 `~/.claude/settings.json` 加 `Read(~/Desktop/開發流程升級_2026-11-09/alexanderchen5966-marketplace/**)`，headless 實測讀得到。slc 借鑒解決不了這件事（薄入口反而更依賴 reference）。**marketplace 搬位置時這條要跟著改**
     - ✅ 2026-11-11 已改（本體→plugin 同步、存檔與兩份索引已更新）：stack-review 1.9.0 加 `react-web.md`＋子資料夾偵測；project-documentation 2.2.2 `bug-record.md` 補 `updated`／`source-commit`；flutter-ui-compare 0.1.1 畫面清單含頁面外框；requirements 1.7.3、figma-to-requirements 1.0.2、stack-review 註明 plugin 名稱（`core:grilling`、`dev:requirements`、`dev:code-reviewer`），沒有直接改成全名，因為其他 agent 讀同一份本體、沒有前綴；doc-update 1.3.1 註明 retro 只能手動叫；tdd 加「一寫就綠不算紅燈」的處理（記在 `MATTPOCOCK-SOURCE.md`）
     - ✅ 不用改：ai-pair 的 developer 模型本來就是動態選擇（`resolve_model` 從當下可用清單依偏好序挑），`gpt-5.4-mini` 不在清單時自動用下一個，補測時就是這樣跑完的；偏好序要改得先過 A/B 准入
     - ✅ 2026-11-11 家目錄 `~/.claude/settings.local.json` 的 slc 三包已拿掉（權限設定保留）；`~` 與 `~/Desktop` 開 session 都只剩 core、telegram
  3. 改 skill 時：改本體（`~/.agents/skills/` 或 `~/.agents/claude-only/`）→ `scripts/sync-plugins.sh sync` → `check`；再照個人層記憶〈skill／MCP 變更要同步三處〉
  4. 效果不好：`scripts/switch-restore.sh ~/.claude/backups/plugin-switch-20261111-141317`，再開一個 session 確認 skill 清單；`link-skills.sh` 用 `~/.agents` 的 git 還原
  5. 待使用者決定、不急：marketplace 先留在桌面（2026-11-11 使用者決定）；2026-11-11 已 commit 並 push 到主線：`~/.agents` main `5a0fa55`（不含另一個 session 改的 b2b-manager 專案記憶）、marketplace master `2b7293f`；`slc-system-map` 補 b2b-manager／b2b-backend 歸 PMS（使用者說先不開 MR）；第 11.1 節 slc 借鑒項目；workflow-bench v4 快照已建（2026-11-11，`versions/v4/`：v3 的 10 個開發 skill 換成目前本體，加 flutter-ui-compare；補測後的修正也已併入），**還沒跑比對**（每版跑一次 SSGS-13687，約 $5；使用者決定額度夠再跑，不然隔天）
- 依據：2026-11-11 本機盤點 `~/.agents/skills`（15 個 skill）、`~/.claude/skills`、`~/.claude/agents`、`~/.claude/settings.json`、`~/GitLab/*/.claude`、`slc` marketplace 的目錄結構；`claude plugin install --help`
- 使用者決定（2026-11-11）：
  - plugin 先做在本資料夾，驗證後再搬到正式位置
  - 依功能分成多個小 plugin；角色只是「啟用哪幾個 plugin」的清單
  - 角色包不放公司資訊；公司資訊由資料夾決定要不要加上去（UI 設計師、行銷都適用）
  - 之後新增角色（例：後端工程師）只加該角色專屬的一包，不動現有的包

---

## 1. 結論

- **先做 2 個 plugin：`core`、`dev`**；`dev-app`、`dev-web` 的邊界現在定好，第二步再做
- **角色不是 plugin**：角色＝某個資料夾的 `enabledPlugins` 清單
- **公司資訊沿用現有的 `slc-*` plugin**，不另外做公司包
- **`~/.agents/skills/` 繼續當本體**：其他 agent（Codex、Copilot CLI、opencode、agy）照舊讀它，plugin 只是 Claude Code 這邊的包裝
- 有 3 件事沒查證（第 6 節），所以先用 `core` 一包試做，確認後才做其他包

盤點後要修正我先前口頭講的分法：`doubt-check` 歸 `dev` 不歸 `core`（它的觸發條件全是程式決定）；`dev-app`、`dev-web` 目前各只有 1 個 skill，所以排到第二步。

---

## 2. 已查證：Claude Code 可以依資料夾啟用 plugin

- `claude plugin install` 有 `-s, --scope user|project|local`（預設 user）
- 專案的 `.claude/settings.json` 可以寫 `enabledPlugins`；`~/GitLab/cmsportal`、`~/GitLab/workspace-setup` 已經這樣用（`slc-core@slc`、`slc-fms@slc`）
- 結論：Claude Code 這邊**不需要自寫啟動器**。主文件第 9.3 節的「未查證」可以改成已查證

公司 repo 的 `.claude/settings.json` 有的進版控（cmsportal 那份是團隊共用的）。個人 plugin 的啟用要寫在 `.claude/settings.local.json`（local scope），才不會進公司 repo，符合「AI 檔案不上版控」。

---

## 3. 分組

### 3.1 `core`：所有角色都用（user 層啟用）

| 零件 | 類型 | 現在在哪 |
|---|---|---|
| multiagent-handoff | skill | `~/.agents/skills/` |
| cross-platform-archive-agent | skill | 同上 |
| retro | skill（Matt） | 同上 |
| writing-for-agents | skill（Matt） | 同上 |
| grilling、grill-me | skill（Matt） | 同上 |

`grilling` 從草案的開發包移到這裡：它是追問想法用的，創新創業、行銷角色也用得到。

### 3.2 `dev`：開發主流程（開發類角色的資料夾啟用）

| 零件 | 類型 | 現在在哪 |
|---|---|---|
| requirements、stack-review、doc-update | skill（主流程） | `~/.agents/skills/` |
| pr、tdd、diagnosing-bugs | skill（Matt） | 同上 |
| doubt-check | skill | 同上 |
| project-documentation | skill | 同上 |
| ai-pair | skill（Claude 專屬） | `~/.claude/skills/ai-pair`（實體資料夾，不在 `~/.agents`） |
| code-reviewer | agent | `~/.claude/agents/code-reviewer.md` |

不分平台。stack-review 自己會偵測技術棧（Flutter、Spring Boot、Android），所以後端 repo 啟用 `dev` 就能用。

### 3.3 `dev-app`：行動 App 專屬（第二步）

| 零件 | 類型 | 狀態 |
|---|---|---|
| figma-to-requirements | skill | 已有；說明寫明是給 Flutter 專案、讀 `DESIGN.md` |
| stack-review 的 `ios.md` 清單 | 待補 | 角色分類草案第 7 節第 12 項 |

### 3.4 `dev-web`：網頁前端專屬（第二步）

| 零件 | 類型 | 狀態 |
|---|---|---|
| 畫面與 Flutter 並排比對 | **新 skill，要寫** | 方法在跨專案記憶〈reference_flutter_web_ui_compare〉 |

並排比對放 `dev-web` 的理由：被檢查的是 React 畫面，Flutter 是對照組。`b2b-manager` 同時是 Flutter repo 又有 `next/`，兩包都啟用即可。

### 3.5 之後擴充（現在不做）

| plugin | 何時做 | 內容 |
|---|---|---|
| `dev-backend` | 要加後端工程師角色時 | Spring Boot 專屬規則 |
| `design` | UI/UX 角色有實際任務時 | 去 AI 味清單、icon 規格、設計流程；不含公司資訊 |
| `marketing`、`maker`、`venture` | 各自有實際任務時 | 見〈角色分類草案.md〉第 3 節 |

### 3.6 不放進 plugin 的

| 東西 | 留在哪 | 理由 |
|---|---|---|
| 三層記憶、`~/.claude/CLAUDE.md` | 原位 | 記憶是「你」，不是工作方式；所有角色讀同一份 |
| 各 repo 的 `.claude/`（rules、hook、ZeroSpec、Matt 大型工作組、pilot） | 各 repo | 進那個資料夾自然生效 |
| 公司知識 | `slc-core`、`slc-pms`、`slc-tms`、`slc-fms` | 已經是 plugin，由 RD 共用 repo 維護 |
| MCP（Atlassian、basic-memory、playwright 等） | 使用者層設定 | 第一版先不動，避免一次改太多 |
| 官方 plugin（figma、swift-lsp、example-skills） | 官方 marketplace | 只在啟用清單裡指定 |
| workflow-bench | `~/.agents/experiments/` | 是工具不是 skill |

---

## 4. 角色＝啟用清單（2026-11-11 回填）

依〈角色分類草案〉第 7 節的決定與 `slc-core:slc-system-map` 的系統對照回填。2026-11-11 正式切換時已照這張表安裝；表外的資料夾怎麼判斷見第 16 節。

### 4.1 user 層（所有資料夾）

| 現在 | 切換後 | 理由 |
|---|---|---|
| `slc-core` | **移出 user 層**，改到公司 repo | 公司與非公司隔離；個人資料夾不該載入 slc 規則 |
| `figma` | 移到用得到的資料夾 | 只有 App、網頁前端、UI/UX 用 |
| `swift-lsp` | 移到 App 資料夾 | 只有 iOS／Swift 用 |
| `gopls-lsp`、`rust-analyzer-lsp` | **停用** | 沒有角色用到（角色分類草案第 7 節第 5 項） |
| `example-skills` | 移到網頁前端與 UI/UX 資料夾 | 裡面的 frontend-design 只有這兩個角色用 |
| `telegram` | 保留 | 個人通知管道，和角色無關 |
| — | 新增 `core` | 所有角色共用 |

### 4.2 公司 repo（寫進 `.claude/settings.local.json`，不進版控）

| 角色 | 資料夾 | 個人 plugin | 公司 plugin | 官方 plugin |
|---|---|---|---|---|
| App 工程師（PMS） | `app01-double`、`app01-double UITest`、`app11-double` | `dev`、`dev-app` | `slc-core`、`slc-pms` | `figma`、`swift-lsp` |
| App 工程師（TMS） | `tms-driver-app`（React Native） | `dev`、`dev-app` | `slc-core`、`slc-tms` | `figma` |
| App＋網頁前端 | `b2b-manager`（Flutter＋`next/`） | `dev`、`dev-app`、`dev-web` | `slc-core`、`slc-pms` ※ | `figma`、`example-skills` |
| App＋網頁前端（FMS） | `cmsportal`（`cms-app` Flutter＋`cms-webapp` Next） | `dev`、`dev-app`、`dev-web` | `slc-core`、`slc-fms`（repo 的 `settings.json` 已啟用） | `figma`、`example-skills` |
| 網頁前端（TMS） | `tms-frontend`、`tms-system-manager-frontend` | `dev`、`dev-web` | `slc-core`、`slc-tms` | `figma`、`example-skills` |
| 讀後端（還沒有後端角色） | TMS：`tms-backend`、`db-scripts`；PMS：`03ManageCenter`、`04CustomerAppServer`、`05SmartAppServer`、`08Station`、`10Car`、`12Mediator`、`deployrelated`、洗車機家族；`b2b-backend` ※ | `dev` | `slc-core`＋該系統的 `slc-*` | — |
| 公司其他 repo | `aiworkflow`、`design-docs`、`workspace-setup`、`dw-*` 等 | 視需要 `dev` | `slc-core`（`workspace-setup` 的 `settings.json` 已啟用四個） | — |

- ※ `b2b-manager`、`b2b-backend` 不在 `slc-system-map` 的對照表裡，歸 PMS（2026-11-11 使用者確認）
- `cmsportal` 和 `b2b-manager` 一個 repo 同時有 App 與網頁，在 repo 根目錄一起啟用（子資料夾的行為見第 15.1 節：只能加、不能關）
- 沒列到的公司 repo（ERP 相關的 `slc-system-dev` repo 等）切換時再逐一判斷。**`~/GitLab` 層級寫一份設定不會套用到底下的 repo**（第 15.1 節），每個 repo 要各自設

### 4.3 個人資料夾（不載入任何公司 plugin）

| 角色 | 資料夾 | 個人 plugin | 官方 plugin |
|---|---|---|---|
| 個人專案、創作與實驗（`maker`） | `~/Desktop/test/maker/`、`~/Desktop/Speckit Project`、`~/Desktop/Agentic RAG測試專案`、`~/Desktop/RAG測試專案原形`、`~/PycharmProjects` | 寫程式的資料夾加 `dev`；`maker` 包還沒做 | Pixelorama、Blender、Godot 是 MCP，不在 plugin 範圍 |
| UI/UX 設計師（個人） | `~/Desktop/test/uiux/` | `design` 包還沒做 | `figma`、`example-skills` |
| 行銷策略 | `~/Desktop/test/marketing/` | `marketing` 包還沒做 | — |
| 創新創業 | `~/Desktop/test/venture/`（每個點子一個子資料夾） | `venture` 包還沒做 | — |
| 教授做研究、備課 | 還沒定 | 工具包（notebooklm）還沒裝 | — |
| plugin 測試 | `~/Desktop/開發流程升級_2026-11-09` | `core`、`dev`、`dev-app`、`dev-web`（現在就是這樣） | — |

- `~/Desktop/test/` 的四個子資料夾還沒建。現有的 `test/reader.ebookservice.tw` 不動
- 個人資料夾寫程式時加 `dev`（不加 `slc-*`），等於 App 工程師的「個人模式」：有開發流程、沒有公司規則
- `design`、`marketing`、`maker`、`venture` 四包照第 3.5 節，等各自有實際任務時再做；在那之前這些資料夾只有 `core`

### 4.4 其他 agent

只做 Claude Code。Codex、Copilot CLI、opencode、agy 照舊讀 `~/.agents/skills/` 全部的 skill，沒有角色隔離（2026-11-11 使用者決定：主要都用 Claude，其他先不處理）。

### 4.5 退路

plugin 還在實驗。效果不好時，本機改回原本的做法：user 層 symlink（`~/.agents/link-skills.sh`）＋三層記憶，不用 plugin。所以正式切換前要先確認還原步驟（2026-11-11 使用者決定）。

## 5. 目錄結構（先放本資料夾）

```
開發流程升級_2026-11-09/
└── my-marketplace/                  ← 名稱待定
    ├── .claude-plugin/marketplace.json
    └── plugins/
        ├── core/
        │   ├── .claude-plugin/plugin.json
        │   └── skills/…
        └── dev/
            ├── .claude-plugin/plugin.json
            ├── skills/…
            └── agents/code-reviewer.md
```

結構照 `slc` marketplace 的做法（`plugins/<名稱>/` 底下放 `skills`、`agents`、`commands`）。

---

## 6. 還沒查證的三件事（決定本體放哪）

| # | 問題 | 為什麼重要 | 怎麼查 |
|---|---|---|---|
| 1 | plugin 的 `skills/` 放 symlink 指向 `~/.agents/skills/<名稱>`，安裝後還讀得到嗎 | 讀得到，本體就維持一份；讀不到，要用腳本把本體複製進 plugin（多一個同步步驟） | 用 `core` 試裝一次 |
| 2 | 包成 plugin 後 skill 名稱會變成 `dev:requirements`。skill 之間互相用名稱叫用（四個主流程 skill 裡有 37 處提到彼此），還叫得到嗎 | 叫不到就要改 skill 內文，而其他 agent 讀的是同一份，沒有前綴 | 試裝後實際叫一次 `/requirements` 與互相叫用 |
| 3 | `~/.claude/skills/` 的 symlink 和 plugin 同時存在會不會重複載入 | 會的話要拿掉 symlink，`link-skills.sh` 的 Claude Code 目標也要移除 | 試裝後看 skill 清單 |

三件事都用 `core` 一包試裝就能回答，所以實作順序是先試 `core`，再決定本體放哪。

**其他 agent 不受影響也不受益**：plugin 是 Claude Code 的機制，Codex、Copilot CLI、opencode、agy 照舊讀 `~/.agents/skills/` 的全部 skill，不會依角色分組。它們的角色切換是第 4 項轉接層的工作。

---

## 7. 待你決定

1. **marketplace 名稱與正式位置**：驗證後搬到哪（建議 `~/.agents/marketplace/`，跟 skill 本體一起備份）
2. **`dev-app`、`dev-web` 要不要第一步就做**：建議第二步。現在各只有 1 個 skill，其中並排比對還要新寫
3. **`slc-core` 要不要從 user 層移到公司 repo 的專案層**：要做到非公司資料夾不載入公司知識就得移；建議 `core`、`dev` 穩定後再動
4. **`gopls-lsp`、`rust-analyzer-lsp` 要不要從 user 層拿掉**：沒有角色用到（角色分類草案第 7 節第 5 項；2026-11-11 決定：沒用到就不啟用，切換時拿掉）
5. **第 4 節的資料夾對照**：請確認或修正
6. **並排比對 skill 放 `dev-web` 是否同意**

---

## 8. 實作步驟（你同意後）

| # | 步驟 | 怎麼驗證 |
|---|---|---|
| 1 | 建 marketplace 骨架與 `core`（先用 symlink） | `claude plugin` 能加入本機 marketplace、裝得起來 |
| 2 | 回答第 6 節三件事 | 新 session 看 skill 清單、實際叫用一次；結果寫回本文件 |
| 3 | 依結果決定本體放哪，做 `dev` | 在 `b2b-manager` 用 local scope 啟用，跑一次 requirements → stack-review |
| 4 | 拿掉重複來源（`~/.claude/skills` 的 symlink 或調整 `link-skills.sh`） | `link-skills.sh check` 無異常；其他 agent 仍讀得到 |
| 5 | 寫並排比對 skill，做 `dev-web`、`dev-app` | 下一張有畫面的卡實際用一次 |
| 6 | 同步：Skill存檔、`SKILL_INDEX.md`、`skills-list.md`；流程版本頁更新為 v4；workflow-bench 加 v4 快照 | 照個人層記憶〈skill／MCP 變更要同步三處〉 |

步驟 4 會改到現有設定，動手前會先備份並再問你一次。workflow-bench 現在是靠替換 repo 的 `.claude/skills/` 比版本，plugin 化後快照方式要跟著調整，步驟 6 時一起處理。

---

## 9. 第一版實作與試裝結果（2026-11-11）

使用者決定（2026-11-11）：marketplace 名稱 `alexanderchen5966-marketplace`；**先整包成一個 plugin**，第 3 節的分組留到之後拆；打包方式用複製，不用 symlink。

已做：

- `alexanderchen5966-marketplace/plugins/workflow/`（plugin 名稱 `workflow`，0.1.0）：16 個 skill（`~/.agents/skills` 的 15 個＋ai-pair）＋code-reviewer agent，全部是複製品；與本體逐檔比對無差異；`claude plugin validate` 通過
- marketplace 已加入 user 設定；plugin **只在本資料夾**以 local scope 啟用（`.claude/settings.local.json`），其他資料夾不受影響
- `~/.agents/skills`、`~/.claude/skills` 的 symlink、`link-skills.sh` 都沒動

第 6 節三件事的結果：

| # | 問題 | 結果 |
|---|---|---|
| 1 | symlink 還是複製 | 改用複製，沒測 symlink。代價是有兩份，本體改了要重新複製並升版本號（之後寫同步腳本） |
| 2 | 名稱前綴 | 新 session 實測：plugin 版叫 `workflow:requirements`、agent 叫 `workflow:code-reviewer`。互相叫用是否能自動對到，還沒實測（要在只剩 plugin 版的環境跑一張卡） |
| 3 | 重複載入 | **會重複**：新 session 同時看到 `requirements` 與 `workflow:requirements`。正式啟用前要拿掉 `~/.claude/skills` 的 symlink |

另外發現：新 session 的 skill 清單裡沒有 `ai-pair`（原本的和 plugin 版都沒有）。原因已查到：它的 frontmatter 設了 `disable-model-invocation: true`，模型看不到，只能手動叫。包成 plugin 後的手動叫法還沒測。

---

## 10. 只留 plugin 版的叫用測試（2026-11-11，b2b-manager）

條件：user 層 15 個 skill symlink 與 `~/.claude/agents/code-reviewer.md` 暫時移走（備份在 `~/.claude/backups/skills-symlink-test-20261111/`），plugin 以 local scope 在 b2b-manager 啟用；用非互動 session 執行，從工具呼叫紀錄讀實際載入的名稱。每項只跑 1 次。

| # | 測試 | 實際載入 | 結果 |
|---|---|---|---|
| 1 | 新 session 的 skill／agent 清單 | 只有 `workflow:` 前綴版 | ✅ 沒有重複 |
| 2 | 不加前綴的 `/grill-me` | `workflow:grilling` | ✅ 舊叫法可用 |
| 3 | requirements 處理模糊需求（skill 叫 skill） | `workflow:requirements` → `workflow:grilling` | ✅ 內文寫沒前綴的 `grilling` 有對到（$1.31） |
| 4 | stack-review 審 commit `10a41b89`，唯讀（skill 叫 agent） | `workflow:stack-review` → `workflow:code-reviewer` ∥ general-purpose | ✅ 兩個 subagent 都回報，權限拒絕 0 次（$3.09） |

第 6 節第 2 點的答案：**互相叫用是通的，skill 內文不用改**。

測完已還原：symlink 15 個、code-reviewer agent、b2b-manager 的 `settings.local.json`（與備份逐位元相同）；`link-skills.sh check` 無異常；plugin 在 b2b-manager 已移除，只剩本資料夾啟用。

測試中另外看到：

- Claude Code 直接從本資料夾讀 plugin（`claude plugin list` 的 Read from 是桌面路徑），資料夾搬位置後要重新加入 marketplace
- 測試 4 的 stack-review 回報 React 沒有專用清單、用 `common.md`；對應〈角色分類草案〉第 7 節的清單缺口

還沒做：正式切換（拿掉 symlink、user 層或各 repo 啟用 plugin）、依功能拆包、並排比對 skill、同步腳本。

---

## 11. slc marketplace（`~/GitLab/aiworkflow`）值得借的做法（2026-11-11 檢視）

檢視範圍：README、marketplace.json、各 plugin.json、`docs/knowledge-standards.md`、MR 範本、slc-core 的部分 agent／command／SKILL.md、`docs/reviews` 一份。`scripts/*.mjs` 只讀檔頭註解，沒讀實作；`knowledge-curator`、`design-reader`、`grill`、`knowledge-retro`、`slc-working-rules`、`slc-workspace-setup` 沒打開。

| # | 做法 | 出處 | 對我們的用處 | 成本 |
|---|---|---|---|---|
| 1 | `plugin.json` 不寫 `version`：寫了會被釘住，更新只比對該字串；不寫時用 git commit SHA。slc 曾因此四個 plugin 停在 0.1.0 | `scripts/lint-knowledge.mjs` 第 5 條、README | 我們的 `workflow` 寫了 0.1.0，本體重新複製後沒升版號就收不到更新。⚠️ 未實測；對本機目錄型、非 git 的 marketplace 是否成立沒查到 | 低 |
| 2 | 安裝一律 `--scope local`：專案已 commit `.claude/settings.json` 時，project scope 會改寫該檔 | README | 在公司 repo 啟用個人 plugin 正好是這個情況；我們已經這樣做 | 低 |
| 3 | SKILL.md 做成薄入口，大檔放同一個 skill 目錄（例：`slc-atlassian-ops/SKILL.md` 30 行，指向同目錄的操作手冊） | `plugins/slc-core/skills/` | requirements 387 行、stack-review 414 行、project-documentation 625 行可照此瘦身，每次叫用少載入 | 中 |
| 4 | 流程放 `commands/`、查核放 `agents/`、規則只放一份讓兩邊去讀 | `commands/knowledge-capture.md`、`docs/knowledge-standards.md` | 藉口表、風險清單現在分散在四個 skill，可集中成一份 | 中 |
| 5 | frontmatter 加 `metadata.confidence` 與 `verified-by`（哪天、在哪、跑了什麼、看到什麼）；`uncertain` 是合法選項 | `docs/knowledge-standards.md` 第 2 節 | 適合記憶與沉澱判斷，例：agy 路徑實測這類紀錄 | 低 |
| 6 | lint 腳本配腳本自己的測試 | `scripts/lint-knowledge.mjs`、`scripts/test/` | 做一支小 lint：檢查 plugin 複製品與本體一致、frontmatter 齊全 | 中 |
| 7 | 定期回顧只補重複出現兩次以上的錯；每條提議有編號，下次追蹤狀態 | `commands/knowledge-retro.md`（內容來自 README 的描述）、`docs/retros/` | 與退場追蹤表同思路，可借「提議編號＋下次追蹤」 | 低 |
| 8 | 雙向門／單向門：改到「煞車本身」的路徑一律算單向門 | `.gitlab/merge_request_templates/Default.md` | 當作「改 skill 前要不要先問使用者」的判準 | 低 |

不適合借：MR 描述檢查與 mr-door CI、`retro-collect.mjs`（都靠 GitLab MR）；Confluence 白名單與引用格式（公司專用）；`check-quotes.mjs`；兩個知識審查 agent 平行跑（審的是事實型知識的引用，我們的 skill 是流程型）。

### 11.2 v5 實作結果（2026-11-13）

依 11.1 的順序，已做：#3 薄入口（requirements 1.8.0、stack-review 1.10.0）、#5 查證欄位（doc-update 1.4.0 的記憶附 `驗證：`、`memory-guide.md` 的建議記憶格式）、#7 提議編號、#8 單向門判準（皆在 doc-update 1.4.0）。#2 同步檢查早已完成（`sync-plugins.sh`），#6 已併入。**沒做**：#4 規則只放一份（藉口表追蹤才 2 張卡，11.1 寫明要等）、project-documentation 瘦身（bench 不會用到、沒法測）、#1 `plugin.json` 的 `version`（本機目錄型不靠版本號）、`~/.claude/CLAUDE.md` 的記憶格式（使用者全域設定，待決定要不要加驗證欄位）。bench v5：14/14、$4.77、36 回合、拒絕 0，薄入口沒降低品質也沒省錢，見〈workflow-bench試跑報告〉第 9 節。

### 11.1 採用規劃（2026-11-11 使用者決定：先記錄，角色做完再調整）

現在都不動。等角色切換（第 4 項）做完、plugin 依功能拆包定案後，再依下表調整，避免拆包時重做一次。

| 順序 | 項目 | 做法 | 動手前要先確認 |
|---|---|---|---|
| 1 | 版本與更新（#1） | 決定 `plugin.json` 要不要留 `version` | 第 12 節實測：本機目錄型 marketplace 是直接讀來源資料夾，改檔後新 session 立即生效，**不靠版本號**。若之後 marketplace 改放 git repo，再實測「不寫 version 用 commit SHA」 |
| 2 | 同步檢查（#6） | 寫同步腳本＋一致性檢查：本體 → plugin 複製、排除 `.DS_Store`、比對差異 | 排在正式切換之前或同時（第 12 節 doubt-check 的發現）；`ai-pair` 本體不在 `~/.agents/skills`，要先決定它的本體放哪 |
| 3 | 薄入口（#3） | requirements、stack-review、project-documentation 的 SKILL.md 瘦身，大段移到同目錄附屬檔 | 其他 agent 讀同一份本體，附屬檔要它們也讀得到；用 workflow-bench 比對瘦身前後 |
| 4 | 規則只放一份（#4） | 藉口表、風險清單集中成一份，四個 skill 改成引用 | 與退場追蹤表（v3實測報告第 8 節）一起看：藉口表若 5 張卡後被移除就不用集中 |
| 5 | 查證紀錄欄位（#5） | 記憶 frontmatter 加 `confidence`、`verified-by` | 三層記憶格式是所有 agent 共用，改格式前先看 `memory-guide.md` |
| 6 | 回顧提議編號（#7）、單向門判準（#8） | 併進退場追蹤表與「改 skill 前要不要先問」的規則 | 無 |

#2（一律 `--scope local`）已經在做，不用另外排。

---

## 12. 完整測試（2026-11-11）

第 10 節只測了 4 項。這一節補齊，分成「只留 plugin 版」（user 層 symlink、`ai-pair`、`code-reviewer` 都暫時移走）與靜態檢查。每項只跑 1 次；測完已還原，`link-skills.sh check` 無異常。

### 12.1 只留 plugin 版

| # | 測試 | 結果 |
|---|---|---|
| 5 | 不加前綴的斜線指令：`/doubt-check`、`/requirements`、`/retro`、`/multiagent-handoff` | ✅ 都載入 plugin 版 |
| 6 | 只能手動叫的 3 個（`disable-model-invocation`）：`/ai-pair`、`/retro`、`/grill-me`，加前綴與不加前綴 | ✅ 都載得到；模型的清單裡看不到是設計如此 |
| 7 | 13 個可自動觸發的 skill 逐一用 Skill 工具載入 | ✅ 13 個都成功，base directory 都在 plugin 內 |
| 8 | doubt-check 實跑 1 輪（skill 派 general-purpose subagent） | ✅ `workflow:doubt-check` → subagent 有回報、有分類（$0.41） |
| 9 | `handoff.py` 從本體路徑與 plugin 路徑各執行 `--help` | ✅ 兩邊都能跑 |

加上第 10 節：16 個 skill 全部載入過；實際跑過流程的是 requirements、grilling、stack-review、doubt-check 四個。

### 12.2 更新怎麼生效

- 改 marketplace 資料夾裡的 SKILL.md、**不升版本號**，新 session 立即讀到新內容（用標記字串實測，測完已還原）
- 原因：本機目錄型 marketplace 的 plugin 路徑就是來源資料夾（session 啟動資訊的 `plugins[].path` 是桌面路徑）；`~/.claude/plugins/cache/` 另有一份 0.1.0，但不是實際載入的那份
- 所以：同步只要把本體複製進 marketplace 資料夾就生效；資料夾搬位置要重新加入 marketplace

### 12.3 靜態檢查

| 項目 | 結果 |
|---|---|
| plugin 內寫死的路徑 | `multiagent-handoff` 的 SKILL.md／README 指向 `~/.agents/skills/multiagent-handoff/scripts/handoff.py`（本體）；`requirements` 給沒有 Skill 工具的 agent 指向 `~/.agents/skills/grilling/SKILL.md`。本體還在就沒事；**本體不能刪** |
| `handoff.py` | 用 `realpath` 算自己的位置，從 plugin 路徑執行時，派工 prompt 會叫其他 agent 去讀 plugin 內的 SKILL.md（桌面路徑）。能用，但正式位置定案前不要從 plugin 路徑派工 |
| 權限規則 | b2b-manager 的 `settings.local.json` 有 `Skill(ai-pair)`；切換後名稱變 `workflow:ai-pair`，這條可能對不到，會多一次權限詢問。⚠️ 未實測 |
| Matt skill 的 `agents/openai.yaml` | 是給 Codex 用的設定，放在各 skill 目錄內，不會被當成 plugin 的 agent |
| workflow-bench | 靠替換 `repo/.claude/skills/` 比版本，`claude-home` 沒有 plugin；plugin 化不影響它，但它測不到 plugin 版 |

### 12.4 測試中由 doubt-check 找到的問題

| 發現 | 判斷 |
|---|---|
| 「人工重新複製」沒有偵測機制，本體和複製品不一致時沒人知道 | 成立：同步腳本與一致性檢查要排在正式切換之前（已列入 11.1 第 2 項） |
| `ai-pair` 本體在 `~/.claude/skills/ai-pair`，不在 `~/.agents/skills`；切換時拿掉它就只剩 plugin 內的複製品 | 成立：切換前要先決定 ai-pair 的本體放哪 |
| 「互相叫用是通的」只測 1 次，結論偏強 | 成立但接受：寫明每項只跑 1 次 |
| 「第 10 節寫已還原，但 symlink 不在」 | 不成立：是這次測試暫時移走的，測完已還原 |

### 12.5 還沒測的（2026-11-11 使用者決定：先記錄，之後補測）

補測時機：角色拆包做完、正式切換之後，一起補；補測結果寫進本節對應項目並標日期。

- 互動模式（終端機裡手動輸入、選單顯示）：以上全部是非互動 session
- 完整跑一張真實的卡（requirements → 開發 → stack-review → doc-update → pr）
- doc-update、pr、tdd、diagnosing-bugs、figma-to-requirements、project-documentation、multiagent-handoff 的實際流程（只測了載入）
- ai-pair 實際流程（要叫外部 CLI）
- user 層啟用（目前只測過 local scope）
- 其他 agent（Codex、Copilot CLI、agy）：它們不讀 plugin，切換後只要本體還在就不受影響，但沒有實測

### 12.6 補測清單（2026-11-11 八項全部完成）

| # | 項目 | 補測方式 | 狀態 |
|---|---|---|---|
| 1 | 互動模式 | 在終端機手動輸入 `/requirements`、`/workflow:requirements`，看選單顯示與重複名稱 | ✅ 2026-11-11 輸入 `/req` 選單只出現 `dev:requirements`（使用者回報） |
| 2 | 完整跑一張真實的卡 | requirements → 開發 → stack-review → doc-update → pr；同時補 `doubt-check` 照任務文件標記觸發（v3實測報告第 8.1 節要的紀錄） | ✅ 2026-11-11（推薦紀錄列表，見 12.6.1） |
| 3 | 其餘 skill 的實際流程 | doc-update、pr、tdd、diagnosing-bugs、figma-to-requirements、project-documentation、multiagent-handoff（用 `/tmp` 的測試 repo，不碰公司 repo） | ✅ 2026-11-11：doc-update、pr 在 b2b-manager 實跑；tdd、diagnosing-bugs、figma-to-requirements、project-documentation、multiagent-handoff 在 `/tmp/plugin-test` 實跑，見 12.6.2 |
| 4 | ai-pair 實際流程 | 需要外部 CLI（copilot、agy），先確認額度；並確認手動叫 `/workflow:ai-pair` 後內部路徑正確 | ✅ 2026-11-11：`/tmp/plugin-test` 用 headless `claude -p "/dev:ai-pair dev-team --dev=copilot"` 跑完整流程（Level 2），結果 PASS，見 12.6.3 |
| 5 | user 層啟用 | `--scope user` 安裝後，在沒有啟用的資料夾確認 skill 出現且不重複 | ✅ 2026-11-11：`core` 本來就是 user 層啟用（`~/.claude/settings.json`），不用另裝。在沒有 local 設定的 `/tmp/plugin-empty` 開 headless `claude -p`：`core:grilling`／`core:multiagent-handoff`／`core:writing-for-agents` 各出現一次、沒有不帶前綴的重複；沒有任何 `dev:`（dev 只在專案 local 層，符合設計） |
| 6 | b2b-manager 的 `Skill(ai-pair)` 權限規則 | 切換後觸發 `/workflow:ai-pair`，看是否多一次權限詢問；必要時改成 `Skill(workflow:ai-pair)` | ✅ 2026-11-11 使用者輸入 `/dev:ai-pair` 正常啟動，貼回的輸出沒有額外權限詢問（只有 1 個 shell 指令）；使用者手動叫 slash command 不經過 `Skill(...)` 規則，`Skill(ai-pair)` 可保留或刪 |
| 7 | 其他 agent | Codex、Copilot CLI、agy 各確認仍讀得到 `~/.agents/skills/` | ✅ 2026-11-11：Codex 0.167、Copilot CLI 1.0.108、agy 1.5.3 唯讀詢問，三者都列出 13 個共用 skill、找得到 `multiagent-handoff/SKILL.md`，見 12.6.2 |
| 8 | 切換前置 | 同步腳本與一致性檢查；ai-pair 本體搬進 `~/.agents/skills`（第 12.4 節） | ✅ 2026-11-11 補測結束時 `sync-plugins.sh check` 全部一致（exit 0） |

#### 12.6.1 推薦紀錄補測紀錄（2026-11-11，b2b-manager `FlutterToReactPOC`）

卡片：推薦紀錄 React 遷移，只做列表＋匯出。commit `5f395c63`（01 列表）、`c685af9e`（02 匯出）、`261bd535`（03 並排比對修正）、`0caf3385`（主框架標誌）、`d326fa34`（04 stack-review 修正），由使用者授權 agent commit。

| # | 步驟 | 實際載入的 skill | 結果 |
|---|---|---|---|
| 0 | 互動模式 `/req` | —（使用者手動） | ✅ 只出現 `dev:requirements`，沒有重複 |
| 1 | requirements | `dev:requirements` → 跨包叫 `core:grilling` | ✅ 範圍有分歧（明細 icon、匯出、分頁）時依 SKILL.md 叫用 grilling。SKILL.md 寫的是不帶前綴的 `grilling`，實際要用 listing 上的 `core:grilling` 才叫得到；跨包可用 |
| 2 | 開發 | `dev:doubt-check` | ✅ 任務文件標了「需 doubt-check」，**寫程式前由 agent 自己叫用**，2 輪；第 1 輪找到 2 個成立且要修（全空公司時匯出 500、keepPreviousData 舊資料判斷匯出），並查出後端資料範圍疑似回歸；跨模型有問、使用者跳過 |
| 3 | 並排比對 | `dev-web:flutter-ui-compare`＋`claude-in-chrome` | ✅ 8 步走完；KNOWN-CAUSES 用上「行高」；修了 4 個月份選擇器差異。限制：擴充功能對 localhost 的真實點擊與 zoom 時好時壞，改用 JS 觸發，hover 沒驗到。**漏比主框架**（標題列、側選單標誌），由使用者發現 → 建議 Step 1 的畫面清單要包含主框架（交給 retro） |
| 4 | stack-review | `dev:stack-review` → `dev:code-reviewer`＋spec reviewer | ✅ 有叫到 `dev:code-reviewer`（plugin 內的 agent）。**React web 沒有對應清單**（只有 react-native.md），改用 common.md＋react-native.md 的 Hooks 章節 → 建議補 `react-web.md` |
| 5 | doc-update | `dev:doc-update` → 為改 AGENTS.md 叫 `core:writing-for-agents` | ✅ 沉澱判斷有出現（提議 2 項，採用 1 項：AGENTS.md 1.11）。**沒有叫到 `core:retro`**：retro 是 `disable-model-invocation: true`，模型本來就叫不到；doc-update 也只在分工表提到它，沒有叫用步驟 |
| 6 | pr | `dev:pr` | ✅ 存成 `.scratch/referral-record-react/pr-body.md`，沒開 MR |
| 7 | `Skill(ai-pair)` 權限 | —（使用者手動 `/dev:ai-pair`） | ✅ 正常啟動，沒有額外權限詢問；Copilot CLI、agy 都偵測到 |

其他發現：
- `core` 包的 `retro`、`grill-me`，`dev` 包的 `ai-pair` 都是 `disable-model-invocation: true`，不會出現在模型的 skill 清單；流程文件寫「有沒有叫到 core:retro」這種預期時，要先確認它是不是只能由使用者叫
- skill 之間互相引用時寫的是不帶前綴的名稱（requirements → `grilling`、doc-update → `retro`），plugin 化之後實際名稱是 `core:grilling`；目前模型能自己對應，但寫明全名比較穩


---

## 13. 目前決定的順序（2026-11-11）

1. 先做角色拆包（第 3、4 節的分組，與〈角色分類草案.md〉合併設計）
2. 角色與拆包定案後，才做正式切換（拿掉 user 層 symlink、啟用 plugin）
3. 切換後補測第 12.6 節清單
4. 第 11.1 節的 slc 借鑒項目，等 1 完成再調整

這段期間日常仍用 `~/.claude/skills` 的 symlink，plugin 只在本資料夾啟用。

---

## 14. 拆包結果（2026-11-11）

整包 `workflow` 已拆成三包，舊包備份在 `~/.claude/backups/workflow-plugin-0.1.0-20261111/`。

| plugin | 內容 | 依賴 |
|---|---|---|
| `core`（6 個 skill） | multiagent-handoff、cross-platform-archive-agent、retro、writing-for-agents、grilling、grill-me | 無 |
| `dev`（9 個 skill＋1 個 agent） | requirements、stack-review、doc-update、doubt-check、tdd、diagnosing-bugs、pr、project-documentation、ai-pair；agent code-reviewer | `core` |
| `dev-app`（1 個 skill） | figma-to-requirements | `dev` |
| `dev-web`（1 個 skill） | flutter-ui-compare（2026-11-11 新寫，v0.1.0；第 14.1 節） | `dev` |

- **檢查**：拆分後三包的檔案與舊包逐檔相同，無遺漏、無多出；`claude plugin validate` 通過
- **實測**：本資料夾（local scope）啟用 `core`、`dev`、`dev-app`，session 載入 16 個 skill 與 `dev:code-reviewer`；不帶前綴叫用 `grilling`、`requirements`、`figma-to-requirements` 都成功。**限制**：目前 user 層 symlink 還在，這個測試分不出是 plugin 還是 symlink 解析的；跨包不帶前綴叫用要等正式切換、symlink 移除後補測（併入第 12.6 節）
- **跨包引用**（依賴方向都是往下）：`requirements` 叫 `grilling`、`doc-update` 叫 `retro`（`dev`→`core`）；`figma-to-requirements` 交棒 `requirements`（`dev-app`→`dev`）。所以啟用 `dev` 一定要有 `core`（`core` 本來就是 user 層）
- `MATTPOCOCK-SOURCE.md`、`LICENSE-mattpocock` 在 `core` 與 `dev` 各放一份（兩包都有 Matt 的 skill）
- `plugin.json` 沒有宣告依賴欄位（沒查證 Claude Code 是否支援），依賴只寫在 marketplace 的 description 與本節
- 2026-11-11 已補：stack-review v1.8.0 加 `ios.md`、`react-native.md`。清單放在 `dev` 包的 stack-review 裡（不是 `dev-app`）：stack-review 會自己偵測技術棧，清單要跟著它走。本體 `~/.agents/skills/`、`dev` 包、Skill存檔三份相同，兩份索引已更新。⬜ 還沒在實際專案跑過，併入第 12.6 節補測（iOS 個人專案、`tms-driver-app` 各一次）

### 14.1 `dev-web` 的 flutter-ui-compare（2026-11-11）

- 位置：`plugins/dev-web/skills/flutter-ui-compare/`，`SKILL.md`（8 步流程，每步有完成條件）＋`KNOWN-CAUSES.md`（12 種已知差異原因：症狀、原因、驗算、修法）
- 來源：跨專案記憶〈reference_flutter_web_ui_compare〉與 b2b-manager〈react_migration_report_schedule_retrospective〉第 6.3、11.3、11.4 節；只收跨專案成立的做法，b2b-manager 專屬的數值（欄寬、staging 網址、localStorage key）沒有收
- 已做：`claude plugin validate` 通過；本資料夾啟用後 session 載入 `dev-web:flutter-ui-compare`
- ⬜ **還沒實際跑過**：要在 b2b-manager 拿一頁已遷移的畫面實跑一次（需要使用者的 Chrome），併入第 12.6 節補測
- ✅ 2026-11-11 本體放在 `~/.agents/claude-only/skills/flutter-ui-compare/`（Claude 專屬，不放 `~/.agents/skills/`）；0.1.1 起已做「skill 變更同步三處」
- ⬜ 記憶〈reference_flutter_web_ui_compare〉和這個 skill 內容重複；skill 實跑通過後，建議把記憶縮成一行指向 skill（要使用者同意才改）

---

## 15. 切換前置（2026-11-11）

### 15.1 查證：上層與子資料夾的設定怎麼生效

做法：在 scratchpad 建測試資料夾，用 `.claude/settings.local.json` 啟用 `dev-web`，以非互動 session（haiku）讀 session 初始化列出的 plugin。每種情況跑 1 次。

| 情況 | 結果 |
|---|---|
| 上層資料夾（不是 git repo）啟用，在子資料夾開 session | ❌ 不生效 |
| 上層資料夾啟用，子資料夾本身是 git repo | ❌ 不生效 |
| git repo 根目錄啟用，在 repo 裡的子資料夾開 session | ✅ 生效 |
| git repo 的子資料夾自己啟用（根目錄沒設） | ✅ 生效 |
| git repo 根目錄啟用、子資料夾寫 `false` 想關掉 | ❌ 關不掉，仍然啟用 |

結論：
- **`~/GitLab` 不是 git repo，在那裡寫一份設定沒用**；每個 repo 要各自寫 `settings.local.json`
- 在 repo 裡任何子資料夾開 session，都會吃到 repo 根目錄的設定，所以根目錄一次啟用就好
- 子資料夾只能**多加**、不能**關掉**根目錄已啟用的 plugin。`cmsportal` 若想在 `cms-app` 只用 App 的包，只能根目錄不放 `dev-web`、改在 `cms-webapp` 加；第一版不這樣做，根目錄三包一起開
- `~/Desktop/test/` 不是 git repo，四個子資料夾各自設定，彼此不會互相影響，符合第 4.3 節的分層

### 15.2 還原腳本與演練

放在 `alexanderchen5966-marketplace/scripts/`：

| 檔案 | 用途 |
|---|---|
| `switch-targets.txt` | 切換會動到的 28 個項目：user 層 `settings.json`、`installed_plugins.json`、`known_marketplaces.json`、`~/.claude/skills/`、`~/.claude/agents/`、`~/.gemini/config/skills/`，以及第 4 節每個 repo 的 `settings.local.json` |
| `switch-backup.sh` | 照清單快照到 `~/.claude/backups/plugin-switch-<時間>/`；資料夾用 tar 保留 symlink；不存在的檔案也記下來；同時存一份指紋 |
| `switch-restore.sh <備份資料夾>` | 換回備份；備份時不存在的檔案移走（不直接刪，放在備份裡的 `replaced-<時間>/`）；最後比對指紋，完全相同才印「還原完成」，不同就 exit 2 |
| `switch-fingerprint.sh` | 印出每個項目的指紋（檔案 md5、symlink 目標） |

**演練（假的家目錄，沒碰真實設定）**：把真實的 28 個項目複製到 scratchpad 的假家目錄（指紋 705 行，與真實環境相同）→ 備份 → 模擬切換（刪掉全部 skill symlink、移走 code-reviewer、清空 user 層 `settings.json`、刪掉 agy 的 skills 資料夾、新增和修改 repo 的設定）→ 還原 → **指紋與切換前完全相同**。跑了兩輪：第一輪還原內容正確，但結尾訊息有一個變數寫法錯誤（`$R` 後面緊接中文字），修正後第二輪 exit 0。

**還原沒涵蓋的**（不影響退回，記下來）：
- `claude plugin install` 會在 `~/.claude/plugins/cache/` 留下 plugin 複本；還原後沒有任何設定指向它們，不會被載入
- 只比對檔案，沒有開 session 確認還原後的 skill 清單；正式切換時退回的話，要再開一個 session 確認
- 第 4 節沒列到的 repo 若切換時有改，要先加進 `switch-targets.txt` 再備份

**正式切換的順序**：先跑 `switch-backup.sh` 記下備份路徑 → 切換 → 補測；效果不好就跑 `switch-restore.sh <備份路徑>`。

---

## 16. 正式切換（2026-11-11）

- 備份：`~/.claude/backups/plugin-switch-20261111-141317/`（`switch-targets.txt` 已補第 4 節沒列到的 26 個 repo、個人資料夾、家目錄的 `settings.local.json`，共 67 項，補的部分併進同一份備份）。退回：`scripts/switch-restore.sh <該路徑>`，`~/.agents/link-skills.sh` 另用 `~/.agents` 的 git 還原
- 本體：共用 skill 照舊在 `~/.agents/skills/`；Claude 專屬的放 `~/.agents/claude-only/`（`skills/ai-pair`、`skills/flutter-ui-compare`、`agents/code-reviewer.md`），其他 agent 不讀這裡。**不放 `~/.agents/skills/` 的理由**：Codex、Copilot 會直接讀到 ai-pair
- 同步：`scripts/sync-plugins.sh check|sync`（本體 → plugin；check 有差異 exit 1；也會列出本體有、但沒有任何一包收的 skill）。負向測試：改壞一個檔能抓到，sync 後修回
- 拿掉：`~/.claude/skills` 的 15 個 symlink、`~/.claude/skills/ai-pair`、`~/.claude/agents/code-reviewer.md`（後兩者移到備份的 `moved-out/`）；`link-skills.sh` 拿掉 Claude 目標，只剩 agy，check 無異常
- user 層：啟用 `core`、`telegram`；`slc-core`、`figma`、`swift-lsp`、`example-skills`、`gopls-lsp`、`rust-analyzer-lsp` 設為 false
- 各資料夾（`claude plugin install -s local`，第 4 節以外的判斷原則：切換前後能用的 skill 不變）：
  - 第 4.2 節的表照做；洗車機家族（`risenxicheji`、`iot-service`、`car-wash-kiosk`、`wash-car`）照 slc-system-map 歸 PMS：`dev`＋`slc-core`＋`slc-pms`
  - 其他 slc-dev repo（authserver、dw-*、lambda 類、car-wash-gateway、washordercleaner、carbonledger-assessment、slc-in-house 等）：`dev`＋`slc-core`
  - 非公司 repo（claude-pilot-suite、cognitive-hub、google-workspace-admin-project-workflow、ZeroSpec）、第 4.3 節的個人資料夾、`~/PycharmProjects` 每個子專案：`dev`
  - 家目錄的 `~/.claude/settings.local.json` 原本就有 `slc-pms`／`slc-tms`／`slc-fms`，**這次沒動**（在 `~` 開 session 仍會載入，待決定）
- 公司 repo 的 `settings.local.json` 都沒有出現在 git status；個人專案 `DownloadVideoPythonProject` 原本就把它放進版控，會多一行修改
- 驗證（非互動 session，各跑 1 次）：b2b-manager 載入 17 個 skill＋`dev:code-reviewer`＋slc-core／slc-pms／figma／example-skills；個人資料夾與非公司 repo 只有 `core`＋`dev`、沒有 slc；`~` 只有 `core`（另有家目錄 local 的 slc 三包）；四處都**沒有不帶前綴的重複 skill**

#### 12.6.2 其餘 skill 與其他 agent（2026-11-11，`/tmp/plugin-test`）

拋棄式 Node 專案（`node --test`，無相依），只在該資料夾的 `.claude/settings.local.json` 啟用 `dev` 包。

| skill | 實際載入 | 測法 | 結果 |
|---|---|---|---|
| tdd | `dev:tdd` | 新功能 `shipping()`（未滿 500 加 60） | ✅ 寫測試前先確認 seam（skill 要求）；cycle 1、2 都是紅燈轉綠燈。cycle 3 一寫就綠：前一輪的實作已涵蓋，不是真的 red→green |
| diagnosing-bugs | `dev:diagnosing-bugs` | 預埋 bug：滿 1000 用了 `>` | ✅ 6 個 phase 走完：迴圈穩定紅燈 3 次 → 最小化成 `discounted(1000)` → 4 個可推翻的假設 → 帶 `[DEBUG-7c1e]` 標記逐一驗 → 回歸測試先紅後綠 → 清掉 debug、commit 寫明成立的假設 |
| figma-to-requirements | `dev-app:figma-to-requirements` | b2b 主框架截圖＋複製來的 DESIGN.md | ✅ 依截圖路徑往上找 DESIGN.md（不是 CWD）；產出 token 對應表、狀態矩陣（5 個「截圖未涵蓋」）、待新增 token 2 項，停在交棒 requirements |
| project-documentation | `dev:project-documentation` | 替上面的修正寫 bug 修復紀錄 | ✅ 照 Step 0 判定用形式 A；**範本 frontmatter 缺 `updated`／`source-commit`**，以 frontmatter-spec 為準補上；自檢回報已驗證 11／推導 0／留空 0 |
| multiagent-handoff | `core:multiagent-handoff` | save → resume | ✅ init／snapshot／log 正常；**resume 比對時抓到交接檔寫錯測試數**（寫 9，實際 6），流程有效 |

其他 agent（唯讀詢問「列出可用 skill＋multiagent-handoff 的 SKILL.md 路徑」）：

| agent | 指令 | 結果 |
|---|---|---|
| Codex 0.167 | `codex exec --sandbox read-only` | ✅ 13 個共用 skill；路徑 `~/.agents/skills/multiagent-handoff/SKILL.md` |
| Copilot CLI 1.0.108 | `copilot -p … --deny-tool=write --deny-tool=shell` | ✅ 13 個；靠**列目錄**找到（不是 session 預先載入）；`Changes +0 -0` |
| agy 1.5.3 | `agy --mode plan -p` | ✅ 13 個；路徑 `~/.gemini/config/skills/`，都是 symlink 到 `~/.agents/skills/` |

三者都沒有 `ai-pair`、`flutter-ui-compare`（claude-only，符合設計），也沒有 `retro`、`grill-me`（`disable-model-invocation`）。

發現：
- project-documentation 的 `templates/bug-record.md` frontmatter 範例少了必填的 `updated`、`source-commit`，和 `frontmatter-spec.md` 矛盾，建議補進範本
- tdd：「每個 slice 都要先紅燈」在已涵蓋的邊界上做不到，skill 沒說遇到這種情況怎麼辦（刪掉這個 test，或標成「規格確認」）

#### 12.6.3 ai-pair 完整流程（2026-11-11，`/tmp/plugin-test`，用 Copilot CLI）

任務：`docs/shared/cart_coupon_task.md`（折扣碼 `applyCoupon`）。叫用方式：headless `claude -p "/dev:ai-pair dev-team plugin-test --dev=copilot …"`，`--permission-mode acceptEdits`，只開 copilot／agy／mktemp／唯讀 git／`npm test`，禁止 git add／commit／push。花費約 US$1.48。

| 角色 | 引擎／模型 | 結果 |
|---|---|---|
| Team Lead | headless Claude Code | ✅ 讀需求、派工、核對 diff、驗收 |
| explorer | 沒派（專案只有 1 個 10 行檔，Team Lead 判斷不值得） | — |
| developer | Copilot CLI 1.0.109／`claude-sonnet-5`／medium | ✅ 預設 `gpt-5.4-mini` 不在 copilot 模型清單，照偏好順序改用下一個 |
| copilot-reviewer | Copilot CLI／`gpt-5.3-codex`／medium | ✅ PASS |
| claude-reviewer | native subagent | ✅ PASS，6 個 INFO（負數、型別、空白 trim 等需求外行為） |

我另外驗收（不採信回報）：只動 `src/cart.js`（+9）與新檔 `test/coupon.test.js`（9 個測試）；`npm test` 15/15；沒有 commit；暫存 `.ai-pair-tmp/` 已清。

發現：
- 🔴 **headless 下讀不到 skill 的 `reference/*.md`**：plugin 本體在 `~/Desktop/開發流程升級_2026-11-09/alexanderchen5966-marketplace/`（本機目錄型 marketplace 直接讀來源），不在專案目錄，Read／Bash 都被權限擋下 → 這次 CLI 指令細節、回報格式、prompt 範本都沒套用，只照 SKILL.md 本文跑。互動模式應該會跳權限詢問；建議在 user 層加 `Read(~/Desktop/開發流程升級_2026-11-09/alexanderchen5966-marketplace/**)`，或把 marketplace 搬到不需要額外授權的位置
- SKILL.md 的預設 developer 模型 `gpt-5.4-mini` 已不在 Copilot CLI 清單（1.0.109），fallback 有發揮作用。2026-11-11 判斷**不用改**：developer 本來就是動態選擇（`resolve_model` 依偏好序從當下可用清單挑），換偏好序要先過 A/B 准入
- `Write(//tmp/**)` 有開，但 `mktemp`＋重導向、`tee`、`cd … &&` 複合指令仍被擋，Team Lead 改用 repo 內的暫存資料夾
- 使用者手動 `/dev:ai-pair`（第 6 項）與 headless 叫用都正常，沒有因為 `Skill(ai-pair)` 規則多問權限
