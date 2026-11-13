# design：UI/UX 設計

三個 skill，銜接「規格、畫、檢查」：

- `design-md-init`：專案或作品還沒有 `DESIGN.md` 時，先把色彩、字型、間距、圓角、元件與 icon 規格定下來
- `anti-ai-look`：做完或改完畫面、icon、文案後，逐條檢查有沒有沒經過選擇的 AI 預設值（含 icon 規格）
- `design-review`：唯讀的畫面 review，對照 `DESIGN.md` 與去 AI 味清單，產出分級的發現，不改任何檔案

這三個 skill 目前是**試用中**（版本 0.1.0）：清單初稿來自角色規劃，要在第一次實際改畫面或做 icon 後回頭修條目。

## 搭配

不含畫圖或前端實作的 skill；方向發散、掃描、拋光等工具（例如 `frontend-design`、`impeccable`）請另外安裝，一個階段只開一個。有瀏覽器工具時，`design-review` 會實際開頁截圖。依賴 `core`（`design-md-init` 會用到 `grilling`）。
