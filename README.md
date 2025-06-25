# 小红书话术助手

一个基于 Next.js + Supabase + Tailwind CSS 构建的现代化话术管理和搜索系统。

## ✨ 功能特性

### 🔍 智能搜索
- **全文搜索**：支持标题和内容搜索
- **标签过滤**：多标签组合筛选
- **模块分类**：层级化模块导航
- **智能排序**：按时间、热度、标题序号排序

### 📱 响应式设计
- **移动端优化**：紧凑布局，节省空间
- **一行搜索**：搜索框和排序功能合并显示
- **自适应界面**：桌面端和移动端差异化体验

### 📊 数据管理
- **复制统计**：实时统计话术复制次数
- **分类管理**：支持多级模块分类
- **标签系统**：灵活的标签组织方式

### ⚡ 性能优化
- **前端缓存**：localStorage 保存用户偏好
- **懒加载**：按需加载数据
- **实时更新**：复制后即时刷新统计

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 yarn
- Supabase 项目

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/davidwuwu001/xhs-huashu-github.git
cd xhs-huashu-github
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **启动开发服务器**
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📦 部署到 Vercel

### 一键部署
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/davidwuwu001/xhs-huashu-github)

### 手动部署
1. 在 [Vercel](https://vercel.com) 创建新项目
2. 导入此 GitHub 仓库
3. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署！

## 🗄️ 数据库设置

### Supabase 表结构

1. **modules 表** (模块管理)
```sql
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES modules(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. **scripts 表** (话术管理)
```sql
CREATE TABLE scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  module_id UUID REFERENCES modules(id),
  tags TEXT[] DEFAULT '{}',
  copy_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 示例数据

**模块数据：**
```sql
INSERT INTO modules (name, parent_id, sort_order) VALUES
('儿童陪伴跟贴话术', NULL, 1),
('客户服务', NULL, 2),
('产品介绍', NULL, 3),
('修学庆学跟贴话术', '客户服务_id', 1),
('问答sop', '客户服务_id', 2);
```

**话术数据：**
```sql
INSERT INTO scripts (title, content, module_id, tags) VALUES
('1', '还有需要的吗?宝妈幼儿陪伴师完全可以满足，老师积极阳性，正能量，英语4-6级，可以带孩子运动，趣味玩耍，陪伴中将学习的成分融入进来，快乐学习。', '儿童陪伴跟贴话术_id', ARRAY['儿童陪伴', '英语', '趣味学习']),
('2', '您好，我是专业儿童陪伴师，非中介，看到您发的帖子，我知道深圳不少优秀的老师，陪伴1.5岁-6岁的孩子很有经验，可以说，可以做饭做家务...', '儿童陪伴跟贴话术_id', ARRAY['专业陪伴', '深圳', '经验丰富']);
```

## 🛠️ 技术栈

- **前端框架**：Next.js 15+ (App Router)
- **样式框架**：Tailwind CSS
- **数据库**：Supabase (PostgreSQL)
- **部署平台**：Vercel
- **开发语言**：TypeScript
- **图标库**：Lucide React

## 📱 功能亮点

### 智能排序系统
- **多格式识别**：支持 "1."、"1、"、"(1)"、"第1条"、"【1】" 等序号格式
- **用户偏好记忆**：自动保存排序设置
- **实时切换**：排序和筛选条件即时生效

### 移动端优化
- **紧凑布局**：搜索栏和排序合并一行显示
- **响应式文字**：移动端简化，桌面端详细
- **空间节省**：垂直空间利用率提升 30%

### 复制统计功能
- **实时统计**：每次复制自动增加计数
- **数据同步**：复制后立即刷新显示
- **多端支持**：卡片和详情页都支持复制统计

## 📝 开发日志

详见 [log.md](./log.md) 文件，记录了完整的开发过程和问题解决方案。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

此项目基于 MIT 许可证开源。详见 [LICENSE](LICENSE) 文件。

## 📞 联系方式

- 项目地址：[https://github.com/davidwuwu001/xhs-huashu-github](https://github.com/davidwuwu001/xhs-huashu-github)
- 问题反馈：[Issues](https://github.com/davidwuwu001/xhs-huashu-github/issues)

---

⭐ 如果这个项目对你有帮助，请给它一个 Star！
