# 高雄英語冒險 (Kaohsiung English App)

高雄在地化英語學習應用 - 一個互動式的語言學習平台。

## 部署到 GitHub Pages（完整步驟）

### 步驟 4️⃣：安裝 gh-pages

```bash
npm install --save-dev gh-pages
```

### 步驟 5️⃣：更新 package.json

確保 `package.json` 中有以下內容：

```json
{
  "homepage": "https://yourusername.github.io/kaohsiung-english-app",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build",
    ...
  }
}
```

將 `yourusername` 改成你的 GitHub 用戶名。

### 步驟 6️⃣：構建並部署

```bash
# 構建應用
npm run build

# 部署到 GitHub Pages
npm run deploy
```

### 步驟 7️⃣：啟用 GitHub Pages

1. 進入你的倉庫設定
2. 左側菜單選擇 **Pages**
3. 在 **Source** 選擇 **gh-pages** 分支
4. 保存

### 步驟 8️⃣：存取你的應用

稍等幾分鐘，你的應用會在以下網址提供：

```
https://yourusername.github.io/kaohsiung-english-app/
```

---

## 更新應用

每次修改代碼後：

```bash
# 提交本地更改
git add .
git commit -m "描述你的更改"
git push origin main

# 構建並部署新版本
npm run build
npm run deploy
```

---

## 專案結構

```
kaohsiung-english-app/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx          # 主應用程式
│   └── index.jsx        # 進入點
├── package.json
└── README.md
```

---

## 技術堆疊

- **React 18** - UI 框架
- **Lucide React** - 圖標
- **GitHub Pages** - 部署平台

---

## 功能

- 🌍 三個高雄地區：美濃、駁二、柴山
- 📍 每個地區有多個景點
- 📚 互動式英語學習課題
- 📊 進度追蹤和成就系統
- 🎯 多種題型：選擇題、配對、語音任務

---

## 備註

- 目前使用 Mock 數據（假資料）
- 語音錄音功能在第 2 階段實裝
- 可以連接 Supabase 數據庫進行完整功能

---

## 授權

MIT License
