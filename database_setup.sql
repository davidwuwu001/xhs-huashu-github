-- 小红书话术管理系统数据库设置
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
SELECT '销售技巧', '销售相关的话术技巧'
WHERE NOT EXISTS (SELECT 1 FROM modules WHERE name = '销售技巧');

INSERT INTO modules (name, description) 
SELECT '常见问题', '常见问题解答话术'
WHERE NOT EXISTS (SELECT 1 FROM modules WHERE name = '常见问题');

-- 插入示例话术数据
INSERT INTO scripts (title, content, module_id, tags)
SELECT 
  '产品特色介绍',
  '我们的产品具有以下特色：\n1. 高品质材料制作\n2. 精美的设计风格\n3. 优质的用户体验\n4. 完善的售后服务\n\n欢迎了解更多详情！',
  (SELECT id FROM modules WHERE name = '产品介绍' LIMIT 1),
  ARRAY['产品', '特色', '介绍']
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE title = '产品特色介绍');

INSERT INTO scripts (title, content, module_id, tags)
SELECT 
  '客户咨询回复',
  '感谢您的咨询！\n\n我们会在第一时间为您提供详细的产品信息。如果您有任何疑问，请随时联系我们的客服团队。\n\n期待为您服务！',
  (SELECT id FROM modules WHERE name = '客户服务' LIMIT 1),
  ARRAY['客服', '咨询', '回复']
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE title = '客户咨询回复');

INSERT INTO scripts (title, content, module_id, tags)
SELECT 
  '促销活动通知',
  '🎉 限时优惠活动开始啦！\n\n现在购买享受8折优惠，还有精美礼品赠送！\n\n活动时间有限，先到先得，快来抢购吧！\n\n#限时优惠 #精美礼品',
  (SELECT id FROM modules WHERE name = '销售技巧' LIMIT 1),
  ARRAY['促销', '优惠', '活动']
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE title = '促销活动通知');

-- 启用行级安全 (RLS)
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Allow anonymous read access" ON modules;
DROP POLICY IF EXISTS "Allow anonymous insert access" ON modules;
DROP POLICY IF EXISTS "Allow anonymous update access" ON modules;
DROP POLICY IF EXISTS "Allow anonymous delete access" ON modules;
DROP POLICY IF EXISTS "Allow anonymous read access" ON scripts;
DROP POLICY IF EXISTS "Allow anonymous insert access" ON scripts;
DROP POLICY IF EXISTS "Allow anonymous update access" ON scripts;
DROP POLICY IF EXISTS "Allow anonymous delete access" ON scripts;
DROP POLICY IF EXISTS "Allow anonymous update copy_count" ON scripts;

-- 创建策略允许匿名用户访问
CREATE POLICY "Allow anonymous read access" ON modules FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert access" ON modules FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON modules FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous delete access" ON modules FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anonymous read access" ON scripts FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert access" ON scripts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON scripts FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous delete access" ON scripts FOR DELETE TO anon USING (true);

-- 特别允许匿名用户更新复制计数
CREATE POLICY "Allow anonymous update copy_count" ON scripts 
FOR UPDATE TO anon 
USING (true) 
WITH CHECK (true);

-- 创建增加复制计数的函数
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