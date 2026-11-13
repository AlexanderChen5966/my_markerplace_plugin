---
name: office-export
description: |
  套校方模板的 Office 輸出。當系上要求統一 .potx/.dotx 格式、需要追蹤修訂、
  或題庫要輸出成含圖表的 xlsx 時使用。包裝 python-pptx / pandoc / openpyxl / pypdf，
  全開源、跨主機（Codex 與 Claude Code 共用同一份），不依賴 Anthropic document-skills。
  一般投影片與教案仍走 Marp / pandoc 預設路徑，不需要本 skill。

  Trigger: office-export, 套模板, 校方模板, 系上格式, 學校的 ppt 模板,
           追蹤修訂, 輸出 word, 輸出 excel, potx, dotx
metadata:
  version: 1.0.0
  hosts: Codex desktop / Claude Code（跨主機，SKILL.md 規格通用）
  setup: 工程師一次性安裝 python-pptx / openpyxl / pandoc / pypdf
  fallback: OfficeCLI（第三方，見最後一節）
---

# office-export

## 什麼時候需要這個 skill

**多數時候不需要。** 先確認是不是真的要用：

| 情境 | 用什麼 |
|------|-------|
| 一般上課投影片 | `slide-builder`（Marp）✓ 預設 |
| 教案輸出 Word | `pandoc` ✓ 預設，已內建於 `lesson-plan-generator` |
| **系上要求統一 `.potx` / `.dotx` 模板** | **本 skill** |
| **教案要用追蹤修訂交系上審** | **本 skill** |
| **題庫／成績要輸出含圖表、樞紐分析的 xlsx** | **本 skill** |
| **課本 PDF 抽章節、掃描件 OCR** | **本 skill** |

> Marp 產出的 pptx 版面是 Marp 主題決定的，**無法套校方母片**。
> 這是 Marp 唯一的硬限制，也是本 skill 存在的理由。

## 為什麼不用 Anthropic document-skills

授權限定 Anthropic 服務內使用，明文禁止「retain copies outside the Services」與
「distribute to any third party」。本 kit 主機是 Codex desktop，且 kit 要能打包散布，
兩個條件都不符。

本 skill 用的全是開源工具，**Codex 與 Claude Code 共用同一份 SKILL.md**。

## 使用方式（純對話）

```
用系上的模板做這份投影片
教案輸出成 word，要能追蹤修訂
題庫轉成 excel
把課本第三章抽出來
這份掃描的舊講義要 OCR
```

---

## 一、pptx 套校方模板

### 原則：Markdown 仍是單一真相源

流程是 `slides.md` → python-pptx 套模板 → `.pptx`。
**不是**直接寫 pptx。改內容永遠改 `.md`，重新輸出即可。

### 模板放哪

```
templates/school/
├── 校方簡報模板.potx      ← 系上給的
└── 校方文件模板.docx      ← pandoc reference-doc 用
```

第一次使用時要求教師提供，並**先分析模板結構**再開始套：

```
我讀了 校方簡報模板.potx，它有 6 個版面配置：

  0 標題投影片（標題 + 副標）
  1 標題及物件（標題 + 內文框）
  2 章節標題
  3 兩項物件（左右分欄）
  4 只有標題
  5 空白

你的投影片有 14 張，我打算這樣對應：
  封面 → 版面 0
  學習目標、講述 → 版面 1
  兩個概念並列的 2 張 → 版面 3
  活動指令 → 版面 4（自己排版，指令要大字）

這樣可以嗎？
```

### 中文字型（硬規則，且有陷阱）

```python
from pptx import Presentation
from pptx.util import Pt
import copy

prs = Presentation('templates/school/校方簡報模板.potx')

def set_zh_font(run, name='微軟正黑體', size=24):
    run.font.name = name          # 這只設了 latin typeface
    run.font.size = Pt(size)
    # ⚠️ 中文字必須另外設 East Asian typeface，否則仍會 fallback
    rPr = run._r.get_or_add_rPr()
    for tag in ('a:ea', 'a:cs'):
        el = rPr.makeelement(
            '{http://schemas.openxmlformats.org/drawingml/2006/main}'
            + tag.split(':')[1], {'typeface': name})
        rPr.append(el)
```

🛑 **只設 `run.font.name` 對中文無效。** python-pptx 的 `font.name` 只寫入 `a:latin`，
中文字走的是 `a:ea`（East Asian）。不補這一步，投影片在別台電腦會 fallback 成細明體。

這是繁中場景最常踩、又最難自己發現的坑——在你自己的電腦上看起來正常，因為本機有那個字型。

### 輸出後檢查

- [ ] 母片有正確套用（不是白底預設版面）
- [ ] 中文字型正確（`a:ea` 有設）
- [ ] 講者備忘稿有帶過去（`slide.notes_slide.notes_text_frame.text`）
- [ ] 校方的頁碼／logo／頁尾沒被覆蓋掉

---

## 二、docx 套模板與追蹤修訂

### 套模板

```bash
pandoc outputs/MKT101-2026F/lesson-plans/MKT101-U03.md \
  -o outputs/MKT101-2026F/lesson-plans/MKT101-U03.docx \
  --reference-doc=templates/school/校方文件模板.docx
```

⚠️ `--reference-doc` **只吃 `.docx`，不吃 `.dotx`**。系上若給 `.dotx`，
先用 Word 另存成 `.docx` 再用。

樣式對應：pandoc 會把 Markdown 的 `#`/`##` 對到 reference doc 的
「標題 1」「標題 2」樣式。**所以要確認校方模板裡那些樣式真的有定義**，
否則輸出會是預設樣式。

### 追蹤修訂

pandoc 不產生追蹤修訂。兩種做法：

| 需求 | 做法 |
|------|------|
| 交出去讓別人改 | pandoc 產乾淨 docx，對方在 Word 開啟追蹤修訂 |
| 要標示 AI 改了哪裡 | 用 `python-docx` 寫入 `w:ins`/`w:del`，或改用「修訂前後兩份 + 說明」 |

**建議選前者。** 程式產生的追蹤修訂在不同 Word 版本相容性不佳，
交出去對方打不開比沒有追蹤修訂更麻煩。

---

## 三、xlsx 輸出

用途：雙向細目表、rubric 評分表、試題分析。

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook(); ws = wb.active; ws.title = '雙向細目表'
zh = Font(name='微軟正黑體', size=11)     # xlsx 沒有 a:ea 問題，設 name 即可
```

三個實用要點：

| 項目 | 做法 |
|------|------|
| 中文欄寬 | 中文字寬約為英文 2 倍。`ws.column_dimensions['A'].width` 要按中文字數 × 2.2 估 |
| 凍結表頭 | `ws.freeze_panes = 'B2'`（評分表往下捲時看得到面向名稱）|
| 分數不要寫死 | 用公式讓教師改權重時自動重算：`ws['E2'] = '=B2*0.4+C2*0.2+D2*0.4'` |

🛑 **rubric 輸出 xlsx 時，`adjusted_by_teacher: false` 的一樣不得輸出**
（沿用 `rubric-builder` 的閘門）。

---

## 四、PDF 前處理

### 掃描件 OCR

```bash
ocrmypdf -l chi_tra+eng "掃描.pdf" "raw/fixed/<unit_key>-<描述>.pdf"
```

需要繁中語言包：`brew install ocrmypdf tesseract-lang`。

⚠️ **OCR 出來的文字必然有錯字**，尤其繁中專業術語。該來源的摘錄
**全部標 `[待查證]`**，比照自動字幕處理。

### 抽章節

```python
from pypdf import PdfReader, PdfWriter
r = PdfReader('課本全冊.pdf'); w = PdfWriter()
for p in range(77, 95): w.add_page(r.pages[p])    # 原書 78-95 頁
w.write('raw/fixed/MKT101-U03-課本第3章.pdf')
```

⚠️ **抽章節會改變頁碼。** 抽出後第 1 頁 = 原書第 78 頁。
條目摘錄**必須標原書頁碼** `[課本 p.78]`，否則學生翻課本對不上。
在 frontmatter 記 `page_offset: 77` 供換算。

用途：整本課本上傳 NotebookLM 會吃掉來源額度、也讓檢索變雜，抽需要的章節即可。

---

## 工程師一次性安裝

```bash
pip install python-pptx openpyxl pypdf
brew install pandoc ocrmypdf tesseract-lang    # macOS
```

驗證：

```bash
python3 -c "import pptx, openpyxl, pypdf; print('ok')"
pandoc --version && ocrmypdf --version
```

---

## 備案：OfficeCLI（第三方）

若上述路線在你的環境不順（例如校方模板結構複雜、python-pptx 套不好），
可評估 [officecli/officecli](https://github.com/officecli/officecli)：

```bash
npm install -g officecli
officecli new pptx / docx / xlsx
```

**優點**：MIT、npm 一行安裝、有直接發佈給 Codex 風格 agent 的 skill 檔、
一個工具涵蓋 pptx/docx/xlsx。

**但列為備案而非主線，理由要說清楚**：

| 風險 | 說明 |
|------|------|
| 新專案 | 2026-04 建立，83 stars |
| 更新停滯 | 最後推送 2026-06（撰寫時已約 2 個月）|
| 商業成分 | README 提到 hosted trial。本機 CLI 是 MIT，但要確認哪些功能需要連雲端 |
| 資料外流風險 | **若某功能走雲端，就不能拿來處理學生資料**——落入 `privacy-guard` 的雲端禁令 |

**採用前必做**：確認你要用的功能是純本機執行。方法是斷網跑一次，
或檢查它有沒有對外連線。

相較之下 python-pptx（2013 至今）、pandoc（2006 至今）、openpyxl 都是十年以上的成熟專案，
純本機、無帳號、無雲端。這是主線選它們的原因。

---

## 不要做的事

- **不要因為裝了本 skill 就放棄 Marp**。一般投影片走 Marp 比較快、可 diff、可版控
- **不要直接產生二進位檔而不留 Markdown 原稿**
- **不要只設 `run.font.name` 就以為中文字型設好了**（要補 `a:ea`）
- **不要用程式產生追蹤修訂**（相容性問題）
- **不要用未確認是否走雲端的第三方工具處理學生資料**
