# TaskMaster React 登入頁面設置指南

## 項目概述
基於提供的 login.html 設計，使用 React 和 Supabase 開發的登入頁面。

## 已完成的功能
- ✅ React 登入組件，完全還原 HTML 設計風格
- ✅ Supabase 認證集成
- ✅ Google OAuth 登入支持
- ✅ 響應式設計與動畫效果
- ✅ 表單驗證與錯誤處理
- ✅ 加載狀態與成功提示
- ✅ 認證狀態管理（Context）

## 安裝依賴
由於 npm 安裝過程中遇到問題，您需要手動安裝以下依賴：

```bash
npm install @supabase/supabase-js
```

## Supabase 設置

### 1. 創建 Supabase 項目
1. 前往 [Supabase](https://supabase.com) 並創建新項目
2. 從項目設置中獲取：
   - Project URL
   - Anon/Public Key

### 2. 配置環境變量
創建 `.env` 文件並添加：

```env
REACT_APP_SUPABASE_URL=你的-supabase-項目-url
REACT_APP_SUPABASE_ANON_KEY=你的-supabase-anon-key
```

### 3. 配置認證提供商
在 Supabase 控制台中：
1. 前往 Authentication > Providers
2. 啟用 Email 提供商
3. 配置 Google OAuth（可選）：
   - 啟用 Google 提供商
   - 添加 Google Client ID 和 Secret
   - 設置重定向 URL

## 文件結構
```
src/
├── components/
│   ├── Login.js          # 主登入組件
│   └── Login.css         # 登入頁面樣式
├── config/
│   └── supabase.js       # Supabase 配置與 helper 函數
├── context/
│   └── AuthContext.js    # 認證狀態管理
└── App.js               # 主應用組件
```

## 主要組件說明

### Login.js
- 完整實現 HTML 設計的 React 組件
- 支持電子郵件/密碼登入
- 支持 Google OAuth 登入
- 包含表單驗證和錯誤處理
- 響應式設計和動畫效果

### AuthContext.js
- 全局認證狀態管理
- 提供登入、登出、註冊等方法
- 監聽認證狀態變化
- 自動處理 session 持久化

### supabase.js
- Supabase 客戶端配置
- 認證相關的 helper 函數
- 統一的錯誤處理

## 使用方式

### 啟動開發服務器
```bash
npm start
```

### 訪問應用
- 未登入用戶將看到登入頁面
- 成功登入後會顯示歡迎頁面
- 支持自動登入狀態保持

## 設計特點
- 🎨 完全還原原始 HTML 設計
- 📱 響應式設計，支持移動設備
- ⚡ 流暢的動畫效果和過渡
- 🔒 完整的認證流程
- 🌐 多語言支持（繁體中文）
- 🎯 用戶體驗優化

## 下一步開發建議
1. 添加忘記密碼功能
2. 添加用戶註冊頁面
3. 實現用戶個人資料管理
4. 添加更多認證提供商
5. 實現主應用功能（任務管理等）

## 故障排除
如果遇到依賴安裝問題：
1. 清除 npm 緩存：`npm cache clean --force`
2. 刪除 node_modules 文件夾
3. 重新安裝：`npm install`

如果 Supabase 連接問題：
1. 檢查環境變量是否正確設置
2. 確認 Supabase 項目狀態
3. 檢查瀏覽器控制台錯誤信息