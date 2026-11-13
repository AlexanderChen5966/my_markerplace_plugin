# plugin 補測：推薦紀錄頁 React 遷移（2026-11-11）

- 目的：確認切換到 plugin 後（〈plugin分組草案.md〉第 16 節），開發主流程每個 skill 都能正常運作。**重點是測 plugin，不是頁面本身**
- 卡片：b2b-manager 的推薦紀錄 `ReferralRecordPage`（`lib/page/order/referral/referral_record_page.dart`）遷移到 React，第一張卡**只做列表**，明細頁 `ReferralRecordDetailPage` 不做
- 分支：`FlutterToReactPOC`（沒有上游、不 push）
- 結果寫回〈plugin分組草案.md〉第 12.6 節（每項標日期與 ✅／❌），本檔只當說明
- 狀態：✅ 2026-11-11 已完成，8 項全過；結果與發現見〈plugin分組草案.md〉12.6.1～12.6.3

## 限制

- agent 不 `git add`／`commit`／`push`；每一步要 commit 時停下來，由使用者 commit
- stack-review **必須指定範圍**：`<這張卡第一個 commit>^..HEAD`，不可用預設的 `origin/main...HEAD`（POC 有 41 個本機 commit 沒 push）
- pr 的產出只存成 `.scratch/referral-record-react/pr-body.md`，不開 MR
- 遷移照既有慣例：先讀 `docs/shared/react_migration_report_schedule_retrospective.md`，共用元件放 `next/src/design-system/`

## 流程與每步要記的

| # | 步驟 | 叫用方式 | 要記錄的 |
|---|---|---|---|
| 0 | 互動模式（12.6 第 1 項） | 使用者在終端機輸入 `/req`，看選單 | 選單顯示的是 `dev:requirements` 還是 `requirements`？有沒有重複？ |
| 1 | requirements | `/requirements` | 實際載入的名稱；有沒有不帶前綴叫到 `core:grilling`（跨包） |
| 2 | 開發 | 一般對話 | 有沒有在高風險決定時**自己**叫 `dev:doubt-check`（v3 實測報告第 8.1 節要的紀錄） |
| 3 | 並排比對 | `/flutter-ui-compare` | `dev-web` 第一次實跑：8 步是否走得完、KNOWN-CAUSES 有沒有用上；需要使用者的 Chrome |
| 4 | stack-review | `/stack-review` 指定範圍 | 有沒有叫到 `dev:code-reviewer`；React 用哪份清單 |
| 5 | doc-update | `/doc-update` | 有沒有叫到 `core:retro`（跨包）；沉澱判斷有沒有出現 |
| 6 | pr | `/pr` | 產出存檔 |
| 7 | 權限規則（12.6 第 6 項，可選） | `/ai-pair` 只確認權限詢問，不跑完 | `Skill(ai-pair)` 規則是否還對得到，有沒有多一次詢問 |

## 結束時

- 跑 `~/Desktop/開發流程升級_2026-11-09/alexanderchen5966-marketplace/scripts/sync-plugins.sh check`，確認測試中沒有人改到 plugin 複本
- 第 12.6 節沒測到的（tdd、diagnosing-bugs、figma-to-requirements、project-documentation、multiagent-handoff、user 層、其他 agent）維持 ⬜，寫明原因
