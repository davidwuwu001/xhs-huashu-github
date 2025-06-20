-- 小红书话术管理系统数据库结构
-- 请在 Supabase 控制台的 SQL Editor 中执行此脚本

-- 创建模块表
CREATE TABLE IF NOT EXISTS modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加缺失的列（如果表已存在但缺少某些字段）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'modules' AND column_name = 'description') THEN
        ALTER TABLE modules ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'modules' AND column_name = 'parent_id') THEN
        ALTER TABLE modules ADD COLUMN parent_id UUID REFERENCES modules(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'modules' AND column_name = 'created_at') THEN
        ALTER TABLE modules ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 创建话术表
CREATE TABLE IF NOT EXISTS scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  copy_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_scripts_module_id ON scripts(module_id);
CREATE INDEX IF NOT EXISTS idx_scripts_tags ON scripts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_modules_parent_id ON modules(parent_id);

-- 插入初始模块数据
INSERT INTO modules (name, description) 
SELECT '产品介绍', '产品相关的介绍话术'
WHERE NOT EXISTS (SELECT 1 FROM modules WHERE name = '产品介绍');

INSERT INTO modules (name, description) 
SELECT '客户服务', '客户服务相关话术'
WHERE NOT EXISTS (SELECT 1 FROM modules WHERE name = '客户服务');

INSERT INTO modules (name, description) 
SELECT '营销推广', '营销和推广相关话术'
WHERE NOT EXISTS (SELECT 1 FROM modules WHERE name = '营销推广');

INSERT INTO modules (name, description) 
SELECT '售后服务', '售后服务相关话术'
WHERE NOT EXISTS (SELECT 1 FROM modules WHERE name = '售后服务');

-- 插入示例话术数据
INSERT INTO scripts (title, content, module_id, tags) 
SELECT 
  '产品特色介绍',
  '我们的产品具有以下特色：\n1. 高品质材料制作\n2. 精美的设计风格\n3. 优质的用户体验\n4. 贴心的售后服务\n\n欢迎了解更多详情！',
  m.id,
  ARRAY['产品', '特色', '介绍']
FROM modules m WHERE m.name = '产品介绍'
ON CONFLICT DO NOTHING;

INSERT INTO scripts (title, content, module_id, tags)
SELECT
  '客户咨询回复',
  '您好！感谢您的咨询。\n\n我们会尽快为您提供详细的产品信息和报价。如果您有任何疑问，请随时联系我们的客服团队。\n\n期待与您的合作！',
  m.id,
  ARRAY['客服', '咨询', '回复']
FROM modules m WHERE m.name = '客户服务'
ON CONFLICT DO NOTHING;

-- 设置 RLS (行级安全) 策略
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Allow anonymous read on modules" ON modules;
DROP POLICY IF EXISTS "Allow anonymous read on scripts" ON scripts;
DROP POLICY IF EXISTS "Allow anonymous insert on modules" ON modules;
DROP POLICY IF EXISTS "Allow anonymous update on modules" ON modules;
DROP POLICY IF EXISTS "Allow anonymous delete on modules" ON modules;
DROP POLICY IF EXISTS "Allow anonymous insert on scripts" ON scripts;
DROP POLICY IF EXISTS "Allow anonymous update on scripts" ON scripts;
DROP POLICY IF EXISTS "Allow anonymous delete on scripts" ON scripts;
DROP POLICY IF EXISTS "Allow anonymous update copy_count on scripts" ON scripts;

-- 允许匿名用户读取数据
CREATE POLICY "Allow anonymous read on modules" ON modules
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow anonymous read on scripts" ON scripts
  FOR SELECT TO anon
  USING (true);

-- 允许匿名用户插入、更新和删除数据（开发环境）
CREATE POLICY "Allow anonymous insert on modules" ON modules
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on modules" ON modules
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on modules" ON modules
  FOR DELETE TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert on scripts" ON scripts
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on scripts" ON scripts
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on scripts" ON scripts
  FOR DELETE TO anon
  USING (true);

-- 允许匿名用户更新复制次数
CREATE POLICY "Allow anonymous update copy_count on scripts" ON scripts
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- 创建增加复制次数的函数
CREATE OR REPLACE FUNCTION increment_copy_count(script_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE scripts 
  SET copy_count = copy_count + 1 
  WHERE id = script_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 授权匿名用户执行此函数
GRANT EXECUTE ON FUNCTION increment_copy_count(UUID) TO anon;