-- Insert some default tags for testing
-- Note: Replace 'user-uuid-here' with actual user UUIDs when running

-- Sample tags that users might want
INSERT INTO public.tags (user_id, name, color) VALUES
('00000000-0000-0000-0000-000000000000', '工作', '#EF4444'),
('00000000-0000-0000-0000-000000000000', '個人', '#10B981'),
('00000000-0000-0000-0000-000000000000', '學習', '#3B82F6'),
('00000000-0000-0000-0000-000000000000', '健康', '#8B5CF6'),
('00000000-0000-0000-0000-000000000000', '購物', '#F59E0B'),
('00000000-0000-0000-0000-000000000000', '重要', '#DC2626')
ON CONFLICT (user_id, name) DO NOTHING;

-- Sample task for demonstration (replace user_id with actual UUID)
INSERT INTO public.tasks (user_id, title, description, priority, due_date) VALUES
('00000000-0000-0000-0000-000000000000', 
 '歡迎使用 TaskMaster', 
 '探索所有強大功能，讓工作更有條理', 
 2, 
 NOW() + INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Note: This is sample data. In production, replace the UUID with actual user IDs
-- You can also remove this file after initial setup