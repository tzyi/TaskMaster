# Database Setup Instructions

## 設置 Supabase 資料庫表格

為了使 Google 登入功能正常運作並將用戶資料插入到 Supabase，您需要在 Supabase 控制台中執行以下 SQL 腳本。

### 步驟：

1. 登入您的 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的專案
3. 在左側導航欄中點擊 "SQL Editor"
4. 建立新查詢並複製貼上以下 SQL 腳本：

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  provider TEXT DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

5. 點擊 "Run" 執行腳本

### 功能說明：

- **profiles 表格**: 儲存用戶的詳細資訊
- **Row Level Security (RLS)**: 確保用戶只能查看和修改自己的資料
- **自動觸發器**: 當新用戶註冊時（包括 Google 登入），會自動建立對應的 profile 記錄
- **自動更新時間戳**: 當 profile 更新時會自動更新 updated_at 欄位

### Google OAuth 設定

確保在 Supabase 專案設定中已經：

1. 在 `Authentication > Providers` 中啟用 Google provider
2. 設定正確的 Google OAuth 憑證
3. 在 `Site URL` 和 `Redirect URLs` 中添加您的應用程式 URL

完成以上設定後，Google 登入功能將會自動將用戶資料插入到 `profiles` 表格中。