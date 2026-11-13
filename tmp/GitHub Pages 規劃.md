# GitHub Pages 規劃：plugin 介紹首頁＋互動 skill 地圖

- 建立日期：2026-11-11
- 對應：使用者希望把個人 plugin（`alexanderchen5966-marketplace`）放到 GitHub 上，做成類似 <https://erictechpro.github.io/super-board/>（介紹首頁）與 <https://erictechpro.github.io/super-board/impeccable/>（互動地圖子頁）的顯示方式
- 狀態：✅ 2026-11-13 已上線（commit `80c6e7d`）。實際做法與原規劃不同的地方、兩種地圖的實作方法見**第 9 節**；第 1～8 節是動工前的規劃，保留當紀錄
- repo：`AlexanderChen5966/my_marketplace_plugin`（公開；2026-11-13 由 `my_markerplace_plugin` 改名），Pages 來源是 `master` 分支的 `/docs`
- 網址：首頁 <https://alexanderchen5966.github.io/my_marketplace_plugin/>、skill map <https://alexanderchen5966.github.io/my_marketplace_plugin/skill-map/>、階段地圖 <https://alexanderchen5966.github.io/my_marketplace_plugin/map/>
- 本體位置：`~/.agents/marketplace/docs/`（marketplace 2026-11-13 複製到 `~/.agents/marketplace/` 並把 Claude Code 的登記切過去；桌面那份沒動、已不被載入）

---

## 1. 先處理：repo 是公開的，目前已經有公司資訊

網頁發布後，整個 repo 與網頁都是公開的。2026-11-11 掃描 repo 的結果：

| 位置 | 看得到的公司資訊 |
|---|---|
| `scripts/switch-targets.txt` | 20 幾個公司 repo 名稱（b2b-manager、b2b-backend、app01-double、tms-*、cmsportal、各 PMS 服務…）與個人資料夾路徑 |
| `plugins/**/*.md`（requirements、stack-review、ai-pair、multiagent-handoff、project-documentation、flutter-ui-compare、figma-to-requirements 的範例與說明） | b2b-manager、b2b-backend、app01-double、`SSGS-xxxxx` Jira 票號、「山隆」 |

- 這些**早就在公開的 repo 裡**（`scripts/` 是 `8a38223 更新plugin` 那次 commit 進去的），不是這次規劃造成的
- 個人層記憶的規則是「公司 repo 的 AI 檔案不上版控；`~/.agents` 備份到個人 GitHub 可以」，沒有寫到公司 repo 名稱與票號能不能公開
- **要你決定**：
  - A. 接受（repo 名稱與票號不算機密），網頁照樣只放通用內容
  - B. 清掉：`scripts/switch-targets.txt` 改成範本（路徑用佔位符）；各 skill 範例裡的 repo 名稱與票號改成通用寫法。要連 git 歷史一起清的話，需要重寫歷史＋force push（一次性、不可逆，另外確認）
  - C. 把 repo 改成私有（Pages 在免費方案要公開 repo，等於放棄網頁；除非升級方案）
- 網頁本身一律遵守：**不放**公司系統名稱、repo 清單、啟用清單、Jira 票號、內部流程截圖；**只放**通用的開發流程、四個 plugin 的內容、安裝方式

## 2. 兩頁的定位

參考站的兩層結構：

| 層 | 參考站 | 我們的對應 |
|---|---|---|
| 首頁 | 單頁式落地頁：導覽列、標題＋安裝指令、地圖入口、動態示意、子頁縮圖、skill 卡片、安裝分頁、頁尾 | **A. 介紹首頁**：這個 marketplace 是什麼、四個 plugin、流程、安裝 |
| 子頁 | 互動式地圖（skill-map、impeccable…），圖示內嵌、網址帶 `#view=` 切換視圖 | **B. 互動 skill 地圖**：點節點看 skill 說明，可切換「流程／plugin／角色」三種視圖 |

⚠️ 限制：參考站的地圖頁是 JavaScript 畫的，我讀不到它的實際內容，只知道「圖示內嵌、導覽列相對路徑、`#view=` 切換」。以下的互動設計是**依一般做法規劃**，不是照抄。要更貼近的話，需要你在 Chrome 開那兩頁，讓 Claude in Chrome 截圖與讀 DOM，再補一版。

## 3. 技術與目錄

沿用參考站的做法：**純靜態 HTML／CSS／JS，不用建置工具**。理由：不用 Node 與相依套件，GitHub Pages 直接發布，符合「個人備份、少維護」。

```
alexanderchen5966-marketplace/
├── plugins/              ← 不動（Claude Code 載入的部分）
├── scripts/
│   └── gen-site-data.sh  ← 新增：從 plugin 產生 docs/data/skills.json 的骨架並檢查一致
└── docs/                 ← 新增，Pages 發布來源（Settings → Pages → /docs）
    ├── index.html        ← A. 介紹首頁
    ├── map/index.html    ← B. 互動 skill 地圖（#view=flow|plugin|role）
    ├── assets/           ← style.css、site.js、map.js、圖示（SVG）
    └── data/skills.json  ← 地圖與卡片共用的資料
```

- `docs/` 不是 plugin 的一部分，Claude Code 不會載入，也不影響 `sync-plugins.sh check`
- 兩頁共用同一份 `skills.json` 與 `style.css`，導覽列用相對路徑（`../`、`../map/`）
- 深色／淺色模式跟著系統；手機寬度可讀（參考站有手機選單）
- 流程圖與地圖的線用手寫 SVG，不依賴外部圖表函式庫（artifact 現在用的圖表引擎是 claude.ai 提供的，搬出來不能用；要用 Mermaid 的話改從 CDN 載入固定版本）

### 資料怎麼保持同步

`skills.json` 一個 skill 一筆，欄位：`name`、`plugin`、`version`、`kind`（skill／agent）、`summary`（**手寫的公開版一句話**）、`when`（什麼時候用）、`invoke`（指令，如 `/dev:requirements`）、`flow`（流程第幾步）、`roles`、`manualOnly`（只能手動叫的）。

- `summary` 手寫，**不直接抄 SKILL.md 的 description**（那裡面有公司術語）
- `name`、`plugin`、`version` 由腳本從 `plugins/*/skills/*/SKILL.md` 讀，腳本在以下情況報錯：plugin 有 skill 但 `skills.json` 沒有、版本不一致、`summary` 空白。接進 `sync-plugins.sh check`，改 skill 時自然會提醒要改網頁

## 4. A. 介紹首頁

| 區塊 | 內容 | 資料來源 |
|---|---|---|
| 頂部導覽列 | 專案名、版本標籤、錨點（How it works／Plugins／Install）、地圖連結、GitHub 連結 | `marketplace.json` |
| 標題與一行安裝 | 一句話定位＋ `claude plugin marketplace add …` 指令（可複製） | 手寫 |
| 流程示意 | 主流程六步（需求→開發→review→收尾→PR），每步標對應 skill；取代參考站的看板動畫 | 〈本機開發流程〉的通用部分 |
| 地圖入口 | 縮圖＋「全螢幕開啟」連到 B | — |
| 四個 plugin 卡片 | `core`、`dev`、`dev-app`、`dev-web`：內容、依賴、適用角色 | `skills.json` |
| skill 卡片 | 分「你輸入的（slash 指令）」與「模型自動叫的」兩組，每張附指令範例 | `skills.json` |
| 安裝分頁 | 三個分頁：Claude Code plugin、其他 agent（只讀 `~/.agents/skills`）、從 checkout | 手寫 |
| 頁尾 | 授權、來源與致謝（Matt Pocock skills MIT、doubt-check 改寫自 Addy 的 doubt-driven、pr 改寫自 Humanlayer show-me）、GitHub | `MATTPOCOCK-SOURCE.md`、各 `LICENSE-*` |

致謝是必要的：repo 內含 Matt Pocock 的 skill（MIT）與其他改寫來源，網頁要列出來源與授權。

## 5. B. 互動 skill 地圖

三種視圖，同一份資料，用網址 `#view=` 切換：

| 視圖 | 畫面 | 用途 |
|---|---|---|
| `flow`（預設） | 主流程由左到右，skill 掛在對應步驟下；虛線表示「有條件才叫」（grilling、doubt-check、diagnosing-bugs） | 看一張票怎麼走 |
| `plugin` | 四個 plugin 為群組，內含 skill；依賴方向用箭頭（dev-app／dev-web → dev → core） | 看怎麼拆包、該裝哪幾包 |
| `role` | 角色（App 工程師、網頁前端、讀後端、一般）× plugin 的啟用矩陣；只放通用角色，不放公司資料夾 | 看不同角色該啟用什麼 |

互動：
- 點節點 → 右側（手機是底部）說明面板：一句話、什麼時候用、指令、版本、是否只能手動叫、連到 GitHub 上的 SKILL.md
- 圖例：常用／偶爾／只能手動叫／Claude 專屬
- 鍵盤可操作（Tab 選節點、Enter 開面板、Esc 關）
- 網址帶 `#view=plugin&skill=dev:stack-review` 可直接分享某個節點

## 6. 內容來源與不放進網頁的

| 放 | 不放 |
|---|---|
| 主流程六步與 skill 的通用說明 | 公司 repo 名稱、各 repo 的 plugin 啟用清單（第 4.2 節） |
| 四個 plugin 內容與依賴 | slc 公司知識 plugin 的說明 |
| 安裝與切換方式（通用） | 備份路徑、個人資料夾、`~/.claude` 內部細節 |
| 補測方法的通用結論（可選） | Jira 票號、推薦紀錄等實際卡片內容 |

〈本機開發流程〉artifact 的第 1～3 節多數可以改寫成通用版；第 4 節（底層設定、公司知識 plugin）整段不放。

## 7. 實作步驟（同意後）

| # | 步驟 | 怎麼驗證 |
|---|---|---|
| 0 | 處理第 1 節（A／B／C 擇一） | B 的話：掃描 repo 不再出現公司 repo 名稱與票號 |
| 1 | 建 `docs/` 骨架、共用 `style.css`、`skills.json`（17 個 skill＋1 個 agent） | `gen-site-data.sh` 通過；`sync-plugins.sh check` 接上後仍 exit 0 |
| 2 | 做 A 首頁 | 本機用 `python3 -m http.server` 開，桌機與手機寬度、深色／淺色都看過；所有連結可點 |
| 3 | 做 B 地圖（先 `flow`，再 `plugin`、`role`） | 每個節點點得開；`#view=` 直接開得到；鍵盤可操作 |
| 4 | 開 Pages（Settings → Pages → `/docs`）、push | 公開網址可開；用沒有登入的視窗再看一次 |
| 5 | 改 skill 的流程加一步：改 `skills.json`；寫進〈plugin分組草案〉第 16 節的維護說明 | 故意改一個 skill 版本，`check` 會報 |

預估：A 與 B 的 `flow` 視圖約 1 個 session；`plugin`、`role` 視圖與打磨再 0.5 個 session。

## 8. 待你決定

1. **第 1 節的 A／B／C**（最優先）
2. 首頁語言：中文、英文、還是中英並列（參考站是英文；你的 skill 內文是中文）
3. 要不要先用 Claude in Chrome 看參考站的地圖頁，讓互動設計更貼近
4. 網頁上要不要放 workflow-bench 的比對結果（v1～v4 的費用與回合數）；那是你自己的實驗數據，沒有公司資訊
5. 網址要不要改成短一點的 repo 名稱（現在 repo 名稱 `my_markerplace_plugin` 有拼字 marketplace 少一個 e；改名後 GitHub 會自動轉址，但要重新加入 marketplace）

---

## 9. 實作紀錄（2026-11-13）

### 9.1 使用者的決定（對應第 1、8 節）

| 項目 | 決定 |
|---|---|
| 第 1 節公開性 | A：接受 repo 現有內容。網頁本身不放實際 repo 名稱與票號，角色對應用通用名稱（「App 專案」「網頁前端專案」「後端專案」） |
| 語言 | 中英並列 |
| workflow-bench 數據 | 不放 |
| 安裝方式 | 不放（暫時不給別人安裝） |
| repo 名稱 | 改成 `my_marketplace_plugin`（補上少的 e） |
| 風格 | 第一版（自訂的綠色文件風格）被否決；改成照參考站：首頁照 <https://erictechpro.github.io/super-board/>、階段地圖照 `…/super-board/impeccable/`、skill map 照 `…/super-board/skill-map/` |

與原規劃不同：沒有做 `scripts/gen-site-data.sh`（第 3 節的一致性檢查，見 9.6 待辦）；地圖不是「一頁三視圖（`#view=flow|plugin|role`）」，而是兩個獨立頁面；plugin 與角色對應改放在首頁的表格。

### 9.2 檔案結構

```
~/.agents/marketplace/docs/
├── index.html            首頁（landing 風格，87 行，頁內 script 產生所有區塊）
├── skill-map/
│   ├── index.html        skill map 的版面與全部 CSS（149 行）
│   └── app.js            skill map 的資料補充、繪圖、相機、互動（182 行）
├── map/index.html        階段地圖的版面（20 行）
├── assets/
│   ├── style.css         首頁與階段地圖共用樣式（98 行）
│   ├── site.js           共用：repo 網址、讀 skills.json、escape、主題切換（15 行）
│   └── map.js            階段地圖的繪圖與互動（91 行）
└── data/skills.json      三頁共用的內容資料
```

共通原則：純靜態 HTML／CSS／JS，**沒有任何外部函式庫、沒有建置步驟**；圖都是 JS 產生的 inline SVG。主題用 `<html data-theme>`＋`localStorage`（讀寫包 try/catch），載入時沒有存過就照系統設定。本機預覽：`python3 -m http.server 8765 --directory docs`（用 `file://` 開會因為 `fetch` 讀不到 JSON 而空白）。

### 9.3 共用資料 `data/skills.json`

| 區塊 | 欄位 | 用在哪 |
|---|---|---|
| `plugins` | `id`、`zh`、`en`、`deps` | 首頁 plugin 卡片 |
| `steps` | `id`（req／build／review／wrap／side）、`zh`、`en`、`color` | 階段地圖的分組與顏色、首頁看板動畫的欄位 |
| `roles` | `zh`、`en`、`plugins` | 首頁「依專案類型啟用」表 |
| `skills` | `id`、`plugin`、`version`、`kind`（skill／agent）、`step`、`cond`（有條件才用）、`manual`（只能手動叫）、`claudeOnly`、`invoke`、`source`、`zh`／`en`（是什麼）、`shortZh`／`shortEn`（節點上的短說明）、`whens`（`{zh,en,to}`：什麼情況 → 該用哪個 skill） | 三頁都用 |

所有文字都是**手寫的公開版**，不直接抄 SKILL.md 的 description（裡面有公司術語）。

### 9.4 skill map 的實作方法（`skill-map/`，照 super-board skill map）

參考頁的做法（讀它的原始碼確認）：單一 HTML 檔、資料是內嵌 JSON、自己算位置畫一張 SVG、不用任何套件；檢視器操作參考 archify（MIT）。我們照同樣的手法重寫，沒有複製它的程式碼。

**圖的資料（都在 `app.js` 開頭，手排）**

- `POS`：每個節點左上角座標。節點固定 168×64；主線在 y=200 這一列（request → requirements → 開發 implement → stack-review → doc-update → pr → MR）
- `FAM`：分組外框（需求、開發、審查、收尾、隨時可用）的 x／y／寬／高
- `EXTRA`：不是 skill 的兩個節點——`implement`（流程步驟）、`mr`（人工），說明文字直接寫在這裡
- `EDGES`：每條連線 `{f, t, w, l, pts, back}`。`w` 是 `calls`（叫用，黑）或 `feeds`（交棒，藍）；`pts` 是**手寫的折線轉折點**，沒有自動繞線；`back:1` 是退回線
- `TOURPATH`、`TOURSTOPS`：跑動圓點的路徑與會脈動的節點
- 節點種類由 `skills.json` 推導：`kind==="agent"` → agent；`manual` → manual；其餘 skill；`cond` 畫虛線框

**繪圖**

- `build()` 把上面的資料組成一張 `<svg>` 字串塞進畫布，順序是：箭頭 marker → 分組外框 → 連線 → 起點 → 跑動圓點 → 節點 → 連線標籤（後畫的蓋在上面，所以圓點只在節點之間看得到）
- `roundPath(pts, r)`：把折線轉成路徑，轉角用二次貝茲曲線（`Q`）做圓角
- 每條連線畫三層同一個路徑：`halo`（畫布底色的粗線，讓交叉處看起來斷開）、`edge`（實際的線＋箭頭）、`flowline`（流動用）
- 連線標籤放在最長那一段的中點；文字寬度用字元數估算（全形 8.6、半形 4.7）

**動態效果（全部是 CSS，定義在 `index.html` 的 `<style id="mapcss">`）**

| 效果 | 做法 |
|---|---|
| 連線上流動的光點 | `.flowline` 設 `stroke-dasharray: 4 36`，`@keyframes flowdash` 持續改 `stroke-dashoffset` |
| 退回線的行進虛線 | `.edge-g.back .edge` 設 `stroke-dasharray: 7 4`＋`@keyframes march` |
| 沿主線跑的圓點 | SVG 原生 `<animateMotion path="…" dur="16s" repeatCount="indefinite">`，不用 JS |
| 圓點經過時節點脈動 | `@keyframes tour-pulse`（16 秒一輪，在 4% 處放大 1.05 倍＋光暈）；每個節點的 `animation-delay` 依它在主線上的 x 位置換算，所以跟圓點同步 |
| 選取節點發光 | `@keyframes select-glow`（`drop-shadow`＋粗邊，0.65 秒淡出） |
| 選取時相連的線加速流動 | `.focusing .edge-g.hot .flowline` 換成 `selected-flow`（更粗、更密、1.1 秒一輪） |
| 開關 | 畫布容器的 `flowing` class 控制全部流動效果（≋ 按鈕、`f` 鍵）；`prefers-reduced-motion` 時全部關掉 |

**相機（拖曳與縮放）**

- 狀態只有三個數：`cx, cy`（畫面中心對應的世界座標）、`k`（倍率）。`cam.apply()` 把它換算成 SVG 的 `viewBox`，同時更新倍率文字、小地圖的視野框、`far` class
- 滾輪：`zoomAt(f, sx, sy)` 讓游標下的世界座標在縮放前後不動；`ctrlKey`（觸控板捏合）用較大的係數
- 拖曳：`pointerdown/move/up`，位移超過 4px 才算拖曳並 `setPointerCapture`（包 try/catch）；沒超過就當點擊
- 雙指：兩個 pointer 的距離比當縮放倍率
- 平滑移動：`cam.to(dest, ms)` 用 `requestAnimationFrame`，位置用 ease-out 內插、**倍率在對數空間內插**（拉近拉遠速度感一致）
- `fit()` 算出剛好放下整張圖的狀態；`center(node)` 移到某節點；`ResizeObserver` 在容器大小改變時重算
- 拉遠到 50% 以下時 `far` class 把 `.depth-read`（節點副標、連線標籤）隱藏；READ 按鈕強制顯示

**選取與面板**

- `select(id)`：畫布加 `focusing`；自己與相連的節點、連線加 `hot`，其餘用 CSS 變淡；左側清單同步；網址改成 `#node=<id>`（`history.replaceState`）
- 下方面板三個分頁：何時用（`whens`，可點過去別的節點）、是什麼、怎麼叫用（指令、上下游、GitHub 原始檔連結）；`‹ ›` 與左右鍵依節點順序切換

**其他**

- 小地圖：第二張 SVG，`viewBox` 是整張圖的範圍，節點畫成色塊，加一個視野框；點擊時把點擊位置換算回世界座標後移過去
- 搜尋：比對 id 與中英說明，Enter 選第一筆；`⌘K`、`/` 聚焦
- 匯出：複製 SVG、`viewBox` 改成整張圖、拿掉跑動圓點與選取狀態，把 `mapcss` 的樣式與目前主題的 CSS 變數值寫進 SVG 內的 `<style>`，用 `XMLSerializer` 轉字串下載；PNG 是把這個 SVG 畫到 2 倍的 `<canvas>` 再 `toBlob`
- `?embed=1` 或寬度小於 760：預設收起左側清單與圖例（首頁的 iframe 用這個）

**跟參考頁的差別**：沒有「雙擊節點進入子圖」（沒有下一層內容）；沒有作者頭像，節點右下角改放所屬 plugin；沒有多個視圖（`#view=`）。

### 9.5 階段地圖的實作方法（`map/`，照 impeccable 頁）

- 版面在 `map/index.html`，邏輯在 `assets/map.js`，樣式在 `assets/style.css` 的「map page」與「modal」段
- **自動排版，不用手排座標**：`render()` 讀 `steps`，每個階段一欄（欄寬 200、間距 44），欄內的節點依 `skills.json` 的順序由上往下排（168×62）；左邊畫起點、右邊畫「MR」，下方 `side` 這一組排成一列（寬度不夠會換行）。`skills.json` 新增一個 skill 只要填對 `step`，圖就會多一格
- 每次互動都**整張重畫**（重新產生 SVG 字串），狀態只有 `collapsed`（哪些階段收合）與 `query`（搜尋字）
- 顏色：每個階段的 `color` 寫成該組的 CSS 變數 `--c`，框線用 `var(--c)`、底色用 `color-mix(in srgb, var(--c) 15%, var(--bg))`，深淺色自動跟著變
- 階段外框是虛線圓角矩形＋「STAGE n · GROUP」＋彩色標題與底線；階段之間用箭頭；上方紫色虛線表示「複雜需求時 ai-pair 取代開發與審查」
- 節點：`cond` 畫虛線框；`manual`、`agent` 在右上角加小標籤；搜尋不符的節點變淡（`dim`）
- 收合：每組右上角的圓形按鈕切換 `collapsed[id]`；「Collapse all」切換全部
- 說明視窗（modal）：`openModal(id)` 產生內容——名稱、標籤、「WHEN TO USE IT」（每列一個情況 → 可點的 skill 按鈕）、「WHAT IT IS」、指令；左邊框用階段顏色；網址改成 `#skill=<id>`，載入時帶這個 hash 會直接開啟；Esc、點背景、✕ 關閉
- 全螢幕用 `requestFullscreen`；`?embed=1` 隱藏導覽列與下方說明
- 底下的「建議順序」卡片：各階段中非 `cond` 的 skill
- 沒有拖曳縮放與動畫（那是 skill map 的功能）；寬度不夠時畫布橫向捲動

### 9.6 維護方式與待辦

**新增或修改 skill 時**

1. 改 `data/skills.json`：加一筆（或改 `version`、說明）。首頁與階段地圖會自動更新
2. skill map 另外要改 `skill-map/app.js`：在 `POS` 加座標；有連線就在 `EDGES` 加一筆並手寫 `pts`；必要時調整 `FAM` 外框。**沒加 `POS` 的 skill 不會出現在 skill map 上**
3. 本機預覽確認後 commit、push，GitHub 約 30 秒內重新建置

**待辦**

- 沒有一致性檢查：plugin 的 skill 清單、版本與 `skills.json` 不一致時不會報錯（原規劃第 3 節的 `gen-site-data.sh` 沒做），目前要靠人記得改
- 沒實測的：匯出 PNG、雙指縮放、小地圖點擊；線上頁面只確認網址回 200
- repo 內 `scripts/switch-targets.txt` 與各 skill 範例裡的公司 repo 名稱、票號仍是公開的（使用者選 A 接受）
- 頁面名稱 `dev-workflow` 與三色方塊圖示是暫定的
