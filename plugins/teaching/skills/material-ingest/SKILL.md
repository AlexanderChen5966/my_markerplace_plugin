---
name: material-ingest
description: |
  教材素材入庫。把教師丟過來的課本 PDF、投影片 pptx、Word 講義、Excel、
  YouTube 連結收進 raw/，自動判斷 fixed/living 分區、用 markitdown 轉換
  Office 檔、用 yt-dlp 抓 YouTube 字幕、依 unit_key 命名、補 frontmatter、
  計算 source_hash，最後交棒 unit-organizer。

  Trigger: material-ingest, 收教材, 收進來, 匯入教材, 教材入庫, 加素材,
           把這份講義收進來, 這個影片加進來, ingest, 轉換教材
metadata:
  version: 1.0.0
  operation: 純對話（教授）
  setup: 工程師一次性安裝 markitdown 與 yt-dlp
---

# material-ingest

備課的第一步：把散在桌面、雲端硬碟、YouTube 上的教材收進 vault，變成後續 skill 能吃的格式。

## 使用方式（純對話）

```
把桌面這幾份講義收進來
這份課本第三章加進行銷管理的第三單元
https://youtube.com/watch?v=xxx 這個影片收進來當補充教材
收一下 raw/ 有沒有還沒處理的東西
```

教師不需要知道 markitdown、yt-dlp 或 hash 是什麼。

---

## 執行步驟

### 1. 判斷分區

| 素材 | 進哪 | 判斷依據 |
|------|------|---------|
| 出版教科書 PDF、期刊論文、法規、他人授權講義 | `raw/fixed/` | 不是教師自己寫的、不會改 |
| 教師自製講義、課綱、案例、題目草稿 | `raw/living/` | 教師自己寫的、會改 |
| pptx / docx / xlsx 的轉換產物 | `raw/converted/` | 自動生成 |
| YouTube 字幕 | `raw/media/` | — |

**不確定時問教師**：「這份是課本還是你自己寫的講義？」一句話就能分清楚。

### 2. 格式轉換

**pptx / docx / xlsx 無法原生讀取**，必須先轉：

```bash
markitdown "<原檔>" > "raw/converted/<unit_key>-<描述>.md"
```

原檔仍留在 `raw/fixed/` 或 `raw/living/`（單一真相源）。

⚠️ **pptx 轉換後必須檢查段落順序**：markitdown 按 XML 順序讀文字框，不按視覺順序。
左右分欄或圖說框多的投影片，轉出的順序可能錯亂。轉完讀一遍，順序不對就在條目開頭標
`⚠️ 轉換順序可能錯亂，建議對照原檔`。

**PDF** 不轉，直接讀（≤10 頁全文；>10 頁讀前 5 後 2 頁並標注）。

**PDF 前處理**（兩種情況需要，工具跨主機通用、全開源）：

*情況一：掃描件（讀不出文字）*

判斷徵兆：PDF 讀出來是空的、或只有零星亂碼。

```bash
ocrmypdf -l chi_tra+eng "掃描.pdf" "raw/fixed/<unit_key>-<描述>.pdf"
```

⚠️ **OCR 出來的文字必然有錯字**，尤其繁中專業術語。條目中該來源的摘錄
**全部標 `[待查證]`**，比照自動字幕處理。並在條目開頭標
`⚠️ 來源為 OCR 掃描件，文字可能有誤`。

*情況二：只要課本的某幾章*

整本課本上傳 NotebookLM 會吃掉來源額度，也讓檢索變雜。抽出需要的章節即可：

```bash
python -c "
from pypdf import PdfReader, PdfWriter
r = PdfReader('課本全冊.pdf'); w = PdfWriter()
for p in range(77, 95): w.add_page(r.pages[p])   # 78-95 頁（0-indexed）
w.write('raw/fixed/MKT101-U03-課本第3章.pdf')
"
```

⚠️ **抽章節會改變頁碼**。抽出後的 PDF 第 1 頁 = 原書第 78 頁。
條目摘錄要標**原書頁碼**（`[課本 p.78]`），不是抽出後的頁碼——否則學生翻課本會對不上。
在條目 frontmatter 記 `page_offset: 77` 供日後換算。

### 3. YouTube 收錄

```bash
yt-dlp --write-auto-sub --sub-lang "zh-TW,zh,en" --skip-download \
       --convert-subs srt -o "raw/media/<unit_key>-%(title)s" "<url>"
```

**前置檢查（缺一不可）**：
- 影片是否公開？非公開的無法處理
- 是否有字幕？沒字幕就完全無法處理，直接告訴教師「這支影片沒字幕，無法收錄」
- 字幕是自動生成還是人工？自動的標 `transcript_quality: auto`

⚠️ **自動字幕品質警告**：中文自動字幕常有錯字、無標點、講者混雜，專業術語尤其會錯
（「邊際效用」→「編輯效用」）。標 `auto` 的內容**不得直接當教材引用**，需教師核對。

**另一條路**：若只是要問答不需落地，直接把 URL 給 NotebookLM 更快（見 `notebooklm-skill`）。

### 4. 命名

```
<unit_key>-<簡短描述>.<副檔名>
例：MKT101-U03-課本第3章.pdf
    MKT101-U03-案例-統一超商.md
```

`unit_key` 格式 `<課號>-U<兩位數>`。**不含學期**——教材跨學期沿用，學期只出現在 `outputs/`。

若教師還沒說是哪個單元，問一句：「這份是哪門課的第幾單元？」

### 5. 補 frontmatter

```yaml
---
unit_key: MKT101-U03
course: 行銷管理
source: raw/fixed/MKT101-U03-課本第3章.pdf
source_hash: a1b2c3d4
source_format: pdf
license: "課本｜授權教學使用"
redistributable: false
transcript_quality:            # 僅影音素材
status: inbox
---
```

**`source_hash` 算法**（供 `stale-check` 用）：

```bash
shasum -a 256 "<檔案>" | cut -c1-8
```

`raw/fixed/` 的非 `.md` 檔無法加 frontmatter，改在 `raw/converted/` 或 wiki 條目記錄。

### 6. 標記處理狀態

| 分區 | 標記方式 |
|------|---------|
| `raw/fixed/`（非 .md）| 處理完 `touch 'raw/fixed/<檔名>.processed'` |
| `raw/living/` `converted/` `media/` | frontmatter `status: inbox` → `processed` |

### 7. 交棒

入庫完成後告訴教師：

```
收好了 3 份：
  ✓ MKT101-U03-課本第3章.pdf（fixed，12 頁）
  ✓ MKT101-U03-我的講義.md（living）
  ✓ MKT101-U03-案例影片.srt（media，⚠️ 自動字幕，術語需核對）

要現在整理成單元條目嗎？（會跑 unit-organizer）
```

---

## 隱私閘門（強制）

若素材看起來是**學生作業、作答、成績、名單**：

🛑 **停下來，先跑 `privacy-guard`。** 不得直接入庫。

判斷徵兆：檔名含「學生」「作業」「成績」「名單」「繳交」；內容含姓名、學號、分數欄位。

---

## 掃描積壓

```bash
# fixed/ 未處理（無同名 .processed）
find raw/fixed -type f ! -name "*.processed" \
  | while read f; do [ ! -f "${f}.processed" ] && echo "$f"; done
# ⚠️ 不可省略 pipe 後的存在性檢查——前半段 find 只排除標記檔本身，
#    不會排除「已有配對 .processed」的原始檔，等於把 fixed/ 全部素材誤報為積壓

# 其他分區未處理
grep -rl 'status: *"\?inbox"\?' raw/living raw/converted raw/media
```

積壓 ≥ 10 份時分批處理，一批 5 份，每批完成後回報進度。

---

## 工程師一次性安裝

```bash
pip install 'markitdown[all]'
pip install yt-dlp          # 或 brew install yt-dlp
```

驗證：`markitdown --help` 與 `yt-dlp --version` 都有輸出即可。
