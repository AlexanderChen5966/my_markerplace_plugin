# 流程 v3 實測報告：02-log-drawer（doubt-check、source-driven）

- 日期：2026-11-10
- Task：`~/GitLab/b2b-manager/.scratch/log-react/issues/02-log-drawer.md`（被 01 擋著，01 仍是 `ready-for-agent`）
- 範圍：**只測兩個機制，不實作**。草稿 diff 只放在暫存資料夾，repo 程式沒有改動
- 依據：〈開發流程與MattPocock截長補短.md〉第 9.5 節

## 1. 結論

| 機制 | 有沒有在對的時機觸發 | 有沒有找到具體問題 | 判讀 |
|---|---|---|---|
| doubt-check | ⚠️ 這次是人工指定觸發，沒有測到「agent 自己會不會觸發」 | ✅ 有。第 1 輪 9 點，其中 2 點高風險；第 2 輪剩實作細節 | 有效果。複查的價值在測試設計，不在 http client 本身的寫法 |
| source-driven | ✅ 有依 lock 檔版本查 | ✅ 有，但其中一點是誤報 | 有效果，但官方文件不全時要回頭看套件型別 |

第 9.2 節第 4 點「doubt-check 靠 agent 自己判斷觸發」的疑慮**這次沒有驗證到**，因為觸發是人工指定的。要驗證，下一張卡要讓 agent 照一般流程做，看它會不會自己叫 doubt-check。

## 2. doubt-check

主張：http client 在 response 攔截器支援 `rawKeys`，只有 logs search 帶，讓 `request_body`／`response_body` 底下的 key 保持原樣，其他頁的行為不變。

- 複查：單一模型 ×2 輪；跨模型由使用者選擇跳過
- 停止原因：第 2 輪沒有推翻設計，也找不到破壞其他頁的路徑；剩下的發現都是草稿還不完整、要在實作時補的東西

### 第 1 輪分類（9 點）

| # | 發現 | 分類 | 處理 |
|---|---|---|---|
| 1 | 測試用了 Spring `Page` 的 `content`，後端實際回 `SearchResult`（`data`／`total`）；外層 `data` 和 body 內 `data` 同名的情況沒測 | 成立，要修 | 改成 `data`，加同名 `data` 的案例 |
| 2 | 只測純函式，沒用 MSW 測 http client 的串接與 401 重送 | 成立，要修 | 加 `logs.test.ts`（MSW） |
| 3 | `rawKeys` 比對 wire 上的 snake 名稱，跟「程式內一律 camelCase」的慣例相反，傳錯會靜默失效 | 成立，要修 | 改成比對轉換後的 camelCase 名稱，並更新檔頭說明 |
| 4 | 任何深度的同名 key 都不轉換，比 spec 寬 | 契約沒寫清楚 | 註解寫明是全樹比對、只給 key 不重複的端點用 |
| 5 | 手寫 API 放在 features 底下，違反放 `src/api/` 的慣例；用 orval 重新產生會掉 `rawKeys` | 成立，要修 | 搬到 `src/api/logs.ts`，加不用 orval 的註解 |
| 6 | 契約寫「Flutter 直接顯示原始 JSON」不對（實際是 Map＋JsonView），`null` 要 fallback 成 `{}` | 契約沒寫清楚（我給的契約寫錯） | 第 2 輪契約改寫；fallback 屬於 Drawer 的工作，任務文件已經寫了 |
| 7 | `JSON.parse` 之後，整數 key 會重排、大於 2^53 的數字會失去精度 | 成立但接受 | 後端資料目前碰不到；Flutter Web 也一樣 |
| 8 | 型別擴充是全域的，但只有 httpClient 生效 | 成立但接受 | 加註解 |
| 9 | 沒測 body 是陣列、字串、空 `rawKeys` 的情況 | 成立，要修 | 補測試 |

### 第 2 輪（8 點）：都留到實作時處理

- `UserLog` 少了 `userId`、`method`、`url`、`remoteAddress`；`statusCode` 不會是 null
- 草稿的新檔少了 import 和 `LogSearchRequest`；`SearchResult` 是 repo 裡第三份重複定義
- 401 重送的測試只寫了佔位註解；MSW 的 URL 會不會對上，要看 `API_BASE_URL` 結尾有沒有 `/`
- 不用 orval 的理由要改寫成「mutator 只收一個參數，傳不了 rawKeys；openapi 把 body 寫成 string」
- 要照慣例提供 `useLogSearch` hook，在註解寫明「一定要經過 searchLogs」
- 測試改用 D5 實際會讀的 `failed`／`total`
- 錯誤回應不經過 rawKeys，註解要寫

兩輪的 reviewer 都用 axios 原始碼確認了三件事：401 重送時 `rawKeys` 不會遺失（`mergeConfig` 會把不認識的 key 一起複製），重送的回應只會轉一次，後端的 body 一定是合法 JSON 或 null。

### 對 doubt-check 本身的觀察

- **「只給產物＋契約」有用**：reviewer 自己去讀了 openapi、後端和 Flutter 原始碼，抓到我在契約裡寫錯的地方（第 6 點）
- **要問跨模型這條規則運作正常**；這次使用者選擇跳過
- 兩輪共約 18 萬 token、7 分鐘。第 2 輪的發現大多是「草稿不完整」，表示**草稿越完整，第 2 輪越有價值**；草稿太粗時，第 2 輪大部分在補細節

## 3. source-driven

lock 檔版本：antd 6.6.8、axios 1.21.0、@fortawesome/free-solid-svg-icons 6.7.2、react 19.3.1、vitest 5.0.5、jsdom 30.1.3

| 項目 | 出處 | 結果 |
|---|---|---|
| antd Drawer 的 `size` 給數字 | https://ant.design/components/drawer | ✅ 可以；`width` 已棄用。現有 `drawer.tsx` 寫法正確 |
| antd Drawer 的 `destroyOnHidden` | 同上 | ✅ 5.25.0 起支援，`destroyOnClose` 已棄用 |
| antd `styles.wrapper` | 同上：文件表格沒有列，但棄用說明又叫人改用它 | ⚠️ 官方文件自相矛盾 → 查 `node_modules/antd/es/drawer/DrawerPanel.d.ts:33`，6.6.8 有這個 key，現有寫法正確 |
| antd 點遮罩關閉 | 同上 | ⚠️ `maskClosable` 已棄用，改用 `mask.closable`（6.3.0 起），預設 true。實作「點遮罩關閉」時不要再用 `maskClosable` |
| axios response 攔截器讀 `response.config` | https://axios.rest/pages/advanced/interceptors（axios-http.com 已 301 轉址到這裡） | ✅ 可以 |
| axios 自訂 config 欄位（module augmentation） | https://axios.rest/pages/advanced/type-script | ⚠️ 官方只示範 symbol key，而且帶 `<D = any, P = any>`；字串 key 沒有官方範例 → **未驗證（官方文件沒寫）**。用 repo 的 tsc 實測：不寫泛型也能通過 |
| `navigator.clipboard.writeText` | https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText | ✅ 回傳 Promise，需要 secure context，失敗時拋 `NotAllowedError`；Firefox／Safari 要在使用者點擊時呼叫。照 Flutter「失敗不提示」要 `.catch` 掉 |
| `new Blob([json], { type: 'text/plain' })` | https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob | ✅ 字串會以 UTF-8 編碼 |
| 現有 `saveBlob`：`click()` 後立刻 `revokeObjectURL` | https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static | ⚠️ 官方沒有說明這樣做的風險 → 未驗證；`download` 屬性對同源 blob: 有效 |

### 對 source-driven 本身的觀察

- **找到 1 個真的要注意的點**（`maskClosable` 已棄用），也確認了現有 Drawer 寫法沒有用到棄用的 API
- **誤報 1 次**：查文件的 agent 建議「照官方範例補上泛型參數」，但用 tsc 實測不補也能通過。官方範例只說明一種寫法可行，不代表別的寫法不行，要用編譯器確認
- **官方文件本身會不全或矛盾**（antd 的 `styles.wrapper`）。這種時候要看 lock 檔版本的套件型別。建議在 requirements 的 source-driven 規則加一條：「官方文件不全或互相矛盾時，以 lock 版本的 `node_modules` 型別或原始碼為準，並註明出處」

## 4. 建議記到第 9.2 節第 2 點的「5 張卡紀錄」

第 1 張：02-log-drawer（只測、未實作）
- doubt-check：人工觸發；找到 2 個高風險問題（都在測試設計）
- source-driven：有觸發；找到 1 個真問題、1 個誤報，另確認現有寫法正確
- 沉澱判斷：沒有測到（沒有走到 doc-update）

## 5. 產物位置

- 草稿 diff 第 1、2 版：`/private/tmp/claude-501/-Users-alexander/b3e85e17-2f03-40e4-af29-3678fa9c5a9a/scratchpad/doubt-artifact-r1.md`、`/private/tmp/claude-501/-Users-alexander/b3e85e17-2f03-40e4-af29-3678fa9c5a9a/scratchpad/doubt-artifact-r2.md`（暫存資料夾會被清掉；要實作時以本報告第 2 節為準）

## 6. 真實實作（2026-11-10，01 → 02，已完成、未 commit）

使用者決定從 01 做到 02 完成。兩張票都實作完；`tsc` 通過，全套測試 262 項通過（原 230 項，新增 32 項）。拿掉 `rawKeys` 做突變測試，明細與 http client 的測試都會失敗，確認測試有效。

### 5 張卡紀錄（續）

| 卡 | doubt-check | source-driven | 沉澱判斷 |
|---|---|---|---|
| 01 列表 | 沒觸發（沒有高風險決定，符合 skill「不要用」） | 沒另外查，沿用第 3 節結果 | 還沒走（doc-update 未跑） |
| 02 Drawer | ⚠️ **agent 沒有在設計時自己觸發**：直接依第 2 節的修正實作，實作完才對成品補跑 1 輪。補跑找到 3 點小修與數點接受項，沒有推翻設計 | 沿用第 3 節（`mask.closable` 預設即可，沒用 `maskClosable`） | 還沒走 |

重點觀察：
- 「agent 會不會自己觸發 doubt-check」的答案是**不會，至少這次是先寫後審**。原因：設計階段已被前次實測審過，我把它當成已複查；但實作時多出的決定（Drawer 新增參數、`toCamelKeys` 簽名）沒有再審。建議：任務文件的 Comments 若寫「已複查」，要標明複查的是哪一版草稿，實作偏離時重審（對應第 9.2 節第 4 點「任務文件標記觸發」）
- 補跑的成品複查找到的都是實作層細節（簽名防呆、註解、預設值差異），與第 1 輪「價值在測試設計」不同；兩次合起來看，複查值得做的是**草稿階段**
- 跨模型：尚未詢問使用者（skill 要求每輪都問）
- 待 03：Chrome 並排比對（內距、標題列高度、矮視窗行為、JSON 區捲動）；瀏覽器擴充功能這次沒連上，沒有目測畫面
- source-driven 的建議（lock 版本型別為準）仍待使用者決定
- 實作與 spec 的一處出入：列表「操作狀態」tag 成功只認 Flutter 的 `httpOkStatusCodes`（300、200、201、202、204），spec 寫「2xx～3xx」；以 Flutter 原始碼為準，spec 需修正

## 7. 結案（2026-11-11：03 比對 → stack-review → commit → doc-update）

使用者把「流程穩定」定義為「這張卡走完」，以下是三個機制在整張卡的最終紀錄。

| 機制 | 有沒有在對的時機觸發 | 有沒有找到具體問題 | 判讀 |
|---|---|---|---|
| doubt-check | ⚠️ 01～03 都沒有自己觸發；02 是草稿階段人工觸發一次、成品補審一次 | ✅ 兩次都有；補審預測的「標題列多出 baseline 空白」在 03 並排比對實際出現（31px → 24px） | 有效。觸發問題已改成由任務文件標記（requirements 1.7.0／stack-review 1.7.0／doubt-check 0.2.0），**新規則還沒有一張卡實際用過** |
| source-driven | ✅ 02 有依 lock 版本查 | ✅ `maskClosable` 已棄用 | 有效；「官方文件不全時以 lock 版本型別為準」的建議仍待決定 |
| 沉澱判斷 | ✅ doc-update Step 7 有走到 | ✅ 提出 1 項：更新跨專案記憶〈reference_flutter_web_ui_compare〉（比對前同字型、M3 字距、zoom 原生解析度、後端結構看實際資料）；另依使用者指示寫一份 bug 紀錄（Flutter 匯入狀態一律顯示成功，`docs/bug_record/log_import_status_always_success_bug.md`） | 有效；門檻有擋掉「看程式就知道」的項目（字距修法、failed 讀法都已在註解） |

stack-review 的 spec 審查第 (e) 項（檢查 doubt-check 紀錄）這次有執行，能對出票 02 的兩次複查紀錄與最終程式一致。

### 這張卡暴露的流程缺口（v3 沒有對應機制）

- **UI 並排比對沒有方法上的護欄**：「日期框窄 6px 是本機字型 404」這個錯誤歸因從額度分配列表一路留到第六頁，根因其實是 M3 字距與 button 不繼承字型。使用者追問「文字大小有檢查過嗎」才翻出來。v3 的三個機制都只管程式，管不到「比對方法對不對」。這次先用沉澱判斷把方法寫進記憶；要不要做成 skill 或檢查清單，留給第 3 項打包時再看
- **「與 Flutter 一致」不等於正確**：Flutter 原始碼讀 `response_body.data.failed`，實際資料沒有這層。spec 照 Flutter 原始碼寫，doubt-check 與 stack-review 也都拿 Flutter 原始碼當契約，三道關都沒抓到；最後是 03 拿 staging 實際資料才發現。對應的記憶草稿已列入沉澱提議
- **跨模型複查整張卡都沒有問**：doubt-check 0.2.0 已改成每次叫用問一次，下一張卡驗證
- **共用樣式改動沒有被標記**：票 03 改了全站字型／字距與共用 SLSelect／Drawer（影響 4 頁），不在當時的風險清單，沒跑 doubt-check。✅ 2026-11-11 使用者決定納入：requirements 1.7.2 風險表加「共用元件／全站樣式」、doubt-check 0.3.0 觸發條件同步（只管會不會讓其他頁壞掉；畫面是否和 Flutter 一致不歸它，留給第 3 項設計並排比對步驟）

## 8. 流程機制退場追蹤（2026-11-11 起）

四個 v3 機制都在試用。每張卡由 doc-update Step 8 在結案時各補一列；某張表滿了就照該表的條件判斷，結論交給使用者決定。

### 8.1 doubt-check（3 張有標記的卡）

條件（doubt-check 0.3.2）：從 0.2.0（任務文件標記觸發、寫程式之前跑）起算，3 張標了「需 doubt-check」的卡都沒找到「成立且要修」的問題，或標記規則沒發揮作用（標了沒跑、該標沒標）→ 移除，檢查點併進 stack-review。至少 1 張找到 → 保留。

| # | 卡 | 有標記的任務 | 照標記觸發？ | 找到要修的問題？ | 備註 |
|---|---|---|---|---|---|
| 1 | 推薦紀錄 01～04（2026-11-11，plugin 補測） | 任務 1：不帶 page／size、前端分頁 | ✅ 寫程式前用草稿跑，2 輪 | ✅ 第 1 輪：匯出擋空條件（全空公司時後端 500）、keepPreviousData 舊資料判斷匯出；另查出後端資料範圍疑似回歸（b7602ffb） | 跨模型使用者跳過；第 2 輪多為實作細節 |
| 2 | | | | | |
| 3 | | | | | |

操作紀錄（01～03）不算：當時還沒有標記規則。

### 8.2 source-driven（5 張有新框架用法的卡）

條件：5 張有新框架／套件用法的卡都沒找到真問題（棄用 API、錯誤用法、文件矛盾需靠 lock 版本解決）→ 移除 requirements Step 2b 的「依版本查官方文件」與任務範本的「框架用法出處」欄，只保留 stack-review 的棄用 API 檢查。至少 1 張找到 → 保留。

| # | 卡 | 新框架用法 | 有附出處？ | 找到真問題？ | 備註 |
|---|---|---|---|---|---|
| 1 | 操作紀錄 02 | antd Drawer、axios 型別擴充、Clipboard、Blob | ✅ | ✅ `maskClosable` 已棄用；`styles.wrapper` 文件矛盾靠 `DrawerPanel.d.ts` 解決 | 另有 1 次誤報（範例泛型），已加「用編譯器實測」 |
| 2 | 推薦紀錄 01～04 | TanStack Query `hashKey`、React `useId`、antd Popover（沿用 DateRangeSelector） | ❌ `hashKey` 是 stack-review 建議後加的，沒附官方文件出處；任務文件只寫 axios `params`「未驗證（依訓練資料）」 | ❌ | 用 `tsc` 與測試驗證可用 |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |

### 8.3 沉澱判斷（5 張卡）

條件：連續 5 張卡的 doc-update Step 7 都是「無需沉澱」，或提議都被使用者否決 → 移除 Step 7（沉澱改回由使用者主動提出）。至少 1 張提議被採用 → 保留。

| # | 卡 | Step 7 結論 | 採用？ | 備註 |
|---|---|---|---|---|
| 1 | 操作紀錄 03 | 更新跨專案記憶〈reference_flutter_web_ui_compare〉4 條 | ✅ | 另依使用者指示寫 bug 紀錄（非 Step 7 提議） |
| 2 | 推薦紀錄 01～04 | 提議 2 項（AGENTS.md／datatable-safety 補 BATCH_SIZE 規則的例外；flutter-ui-compare KNOWN-CAUSES 補 2 條）＋ skill 改善 1 項交給 retro | ✅ A 採用（AGENTS.md 1.11、datatable-safety）；❌ B 未採用 | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

bench v3（SSGS-13687）的提議也被採用，但不是實際任務，不算。

### 8.4 常見藉口表（5 張卡；requirements、stack-review、doc-update、doubt-check 四張表）

藉口表的效果沒辦法直接觀察，只能看「表上明列的行為有沒有還是發生」。

條件（5 張卡後判斷，二擇一）：
- 有 2 張以上卡仍做出表上明列的行為 → 表擋不住，**改成強制步驟或檢查清單**，再移除該條（只寫在表裡沒用）
- 5 張卡都沒有任何一條相關（沒碰到、也沒人引用）→ 表只佔篇幅，**移除整張表**，保留有實際事故出處的條目改寫進對應步驟

| # | 卡 | 做出表上明列的行為？（哪個 skill、哪一條） | 備註 |
|---|---|---|---|
| 1 | 操作紀錄 01～03 | ✅ doubt-check「等最後 stack-review 再一起看」：02 實作完才補審 | 當時 doubt-check 由 agent 自行判斷觸發；0.2.0 已改成標記觸發、寫程式之前跑 |
| 2 | 推薦紀錄 01～04 | ❌ 沒有：requirements 標了「未驗證」、stack-review 指定範圍（使用者要求，非偷懶不 fetch）、doc-update 沒驗到的項目保留未勾 | flutter-ui-compare 漏比主框架（標題、標誌）由使用者發現——不在任何藉口表上 |
| 3 | | | |
| 4 | | | |
| 5 | | | |
