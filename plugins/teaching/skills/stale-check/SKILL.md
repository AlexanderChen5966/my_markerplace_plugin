---
name: stale-check
description: |
  過期衍生物偵測。比對衍生檔案 frontmatter 的 source_hash 與來源素材的實際 hash，
  找出上游教材已更新但下游（單元條目、教案、投影片、題庫）還沒重新生成的檔案。
  防止拿著過期教案去上課。

  Trigger: stale-check, 過期檢查, 哪些要重做, 我改了講義, 有沒有過期的,
           同步檢查, stale
metadata:
  version: 1.0.0
  gate_type: advisory
---

# stale-check

## 這個 skill 存在的理由

論文版 kit 沒有這個問題——**論文有 DOI、永不改版**。

教學版會：教師改了講義、換了課本、修了課綱。改完之後由它衍生的東西全部過期了，
**但檔案還躺在那裡，看起來一切正常。**

這是最危險的失效模式：**拿著過期教案去上課**，講到某一頁發現內容跟講義不一樣。

## 使用方式（純對話）

```
我改了講義，有什麼要重做的
過期檢查
哪些教案需要更新
```

也建議在 `weekly-teaching-brief` 中自動執行，教師不必主動想起來。

---

## 依賴的機制

每個衍生檔案的 frontmatter 帶：

```yaml
source: raw/living/MKT101-U03-講義.md
source_hash: a1b2c3d4              # 生成當時來源檔的 hash 前 8 碼
```

由 `material-ingest`、`unit-organizer`、`lesson-plan-generator`、`slide-builder` 等
在寫入時記錄。

**不依賴 git。** 只需要能算 hash：

```bash
shasum -a 256 "<檔案>" | cut -c1-8
```

---

## 依賴鏈

```
raw/fixed/ 或 raw/living/ 的素材
    ↓
raw/converted/*.md（若為 Office 檔）
    ↓
wiki/unit-notes/<unit_key>.md          ← ODEP 條目
    ↓
wiki/unit-synthesis/<主題>.md          ← 合成（多來源，任一變動都影響）
    ↓
outputs/<課程>-<term>/lesson-plans/    ← 教案
    ↓
outputs/<課程>-<term>/slides/          ← 投影片
outputs/<課程>-<term>/assessments/     ← 題庫、rubric
```

**過期是會傳染的。** 素材改了 → 條目過期 → 教案過期 → 投影片與題庫都過期。
要順著鏈往下報，不能只報第一層。

---

## 執行步驟

### 1. 掃描所有帶 source_hash 的檔案

```bash
grep -rl 'source_hash:' wiki/ outputs/ raw/converted/
```

### 2. 逐一比對

對每個檔案：讀 `source:` 路徑 → 算實際 hash → 比對 `source_hash:`。

三種結果：

| 結果 | 意思 | 處理 |
|------|------|------|
| hash 相符 | 最新 | 跳過 |
| hash 不符 | **過期** | 標記，往下追依賴鏈 |
| 來源檔不存在 | **斷鏈** | 標記為錯誤（素材被刪或改名）|

### 3. 標記過期檔案

在過期檔案的 frontmatter 加：

```yaml
stale: true
stale_since: 2026-08-03
stale_reason: "來源 raw/living/MKT101-U03-講義.md 已更新"
```

並在檔案**開頭第一行**插入醒目警示（教師打開就會看到）：

```markdown
> ⚠️ **此檔案已過期**（2026-08-03 偵測）
> 來源 `raw/living/MKT101-U03-講義.md` 已更新，本檔尚未重新生成。
> 上課前請執行「重做這份教案」。
```

**警示要放在檔案開頭，不是結尾。** 教師打開教案是要看內容，不會滾到最後。

### 4. 回報並提供重做選項

```
⚠️ 找到 5 個過期檔案

你改了 raw/living/MKT101-U03-講義.md（8/1 改的），連帶影響：

  🔴 wiki/unit-notes/MKT101-U03.md（ODEP 條目）
     └─ 🔴 outputs/MKT101-2026F/lesson-plans/MKT101-U03.md（教案）
        ├─ 🔴 outputs/MKT101-2026F/slides/MKT101-U03.md（投影片 + pptx/pdf）
        └─ 🔴 outputs/MKT101-2026F/assessments/MKT101-U03-小考.md（題庫）
  🔴 wiki/unit-synthesis/市場區隔.md（合成，此為 3 個來源之一）

⚠️ 另有 1 個斷鏈：
  outputs/MKT101-2026S/lesson-plans/MKT101-U07.md
  來源 raw/living/MKT101-U07-舊講義.md 不存在（被刪或改名了？）

━━━━━━━━━━━━━━━━━━━━━━

要怎麼處理？

(a) 全部重做（我會依序跑 unit-organizer → lesson-plan-generator →
    slide-builder → quiz-generator，舊版會先存快照）
(b) 只重做 ODEP 條目，教案等你下次要上課時再說
(c) 先讓我看你改了什麼（我列出講義的差異）
(d) 這次改動不影響下游，直接把 hash 更新掉就好
```

**(d) 是重要選項**：教師可能只是修了錯字。這時不需要重做整條鏈，
只要更新 hash。但要確認：

```
確認一下：這次的修改只是錯字或排版嗎？
（如果改了概念、數據或頁碼，教案跟題庫還是要重做。）
```

### 5. 重做後清除標記

移除 `stale: true`、`stale_since`、`stale_reason` 與開頭警示，更新 `source_hash`。

---

## 特殊情況

### 換版課本

舊版移 `archive/`，新版進 `raw/fixed/`，`unit_key` 不變、加 `edition:`。

這會讓整條鏈過期——正常，換課本就是要重做。但要提醒教師一件事：

```
換版會讓 14 個單元的條目全部過期，這是預期的。

好消息：wiki/misconceptions/ 不受影響。
學生卡住的地方通常不因換版而改變——這 6 個迷思條目跨版本仍然有效，
新版教材整理完，D 層會自動掛回去。

要一次全部重做，還是按上課週次分批？（建議分批，一次 3 個單元）
```

### 合成條目的多來源

`unit-synthesis` 有多個 `sources`，frontmatter 用清單記錄各來源 hash：

```yaml
source_hashes:
  - path: wiki/unit-notes/MKT101-U03.md
    hash: a1b2c3d4
  - path: wiki/unit-notes/MKT201-U07.md
    hash: e5f6g7h8
```

**任一來源變動即標過期**，但回報時要指出是哪一個變了。

---

## 不要做的事

- **不要自動重做**。教師可能只是改錯字，重做整條鏈是浪費
- **不要把警示放在檔案結尾**
- **不要只報第一層**。過期會沿依賴鏈傳染，要一次報完
- **不要在斷鏈時猜測**。來源檔不見了就如實報告，不要自己找相似檔名替代
