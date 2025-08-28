-- TaskMaster 資料庫快速設定
-- 請在 Supabase SQL Editor 中執行此檔案

-- 1. 創建任務表
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMP WITH TIME ZONE,
  priority INTEGER DEFAULT 4,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. 創建標籤表
CREATE TABLE IF NOT EXISTS public.labels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 3. 創建任務標籤關聯表
CREATE TABLE IF NOT EXISTS public.task_labels (
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (task_id, label_id)
);

-- 4. 啟用RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;

-- 5. 建立RLS政策 - Tasks表
CREATE POLICY "用戶只能查看自己的任務" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用戶只能新增自己的任務" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用戶只能更新自己的任務" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用戶只能刪除自己的任務" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- 6. 建立RLS政策 - Labels表
CREATE POLICY "用戶只能查看自己的標籤" ON public.labels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用戶只能新增自己的標籤" ON public.labels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用戶只能更新自己的標籤" ON public.labels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用戶只能刪除自己的標籤" ON public.labels FOR DELETE USING (auth.uid() = user_id);

-- 7. 建立RLS政策 - Task_Labels表
CREATE POLICY "用戶只能查看自己任務的標籤" ON public.task_labels FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid()));
CREATE POLICY "用戶只能新增自己任務的標籤" ON public.task_labels FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid()));
CREATE POLICY "用戶只能刪除自己任務的標籤" ON public.task_labels FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid()));

-- 8. 建立索引
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON public.tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_labels_user_id ON public.labels(user_id);

-- 9. 建立觸發器 - 更新時間戳
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. 建立觸發器 - 任務完成時間
CREATE OR REPLACE FUNCTION public.update_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
    NEW.completed_at = NOW();
  ELSIF NEW.is_completed = FALSE AND OLD.is_completed = TRUE THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_task_completed_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_task_completed_at();

-- 11. 為現有用戶建立預設標籤
INSERT INTO public.labels (user_id, name, color)
SELECT 
  id,
  unnest(ARRAY['重要', '學習', '工作']),
  unnest(ARRAY['#dc2626', '#059669', '#2563eb'])
FROM public.profiles
WHERE id NOT IN (SELECT DISTINCT user_id FROM public.labels)
ON CONFLICT (user_id, name) DO NOTHING;