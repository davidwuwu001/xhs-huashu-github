# 话术助手 - 话术复制网页系统

一个基于 Next.js、Tailwind CSS 和 Supabase 构建的现代化话术管理和复制系统，采用苹果风格设计，支持模块分类、标签管理和一键复制功能。

## 🚀 功能特性

### 用户功能
- **话术浏览**: 按模块分类浏览所有话术内容
- **一键复制**: 点击即可复制话术到剪贴板，自动统计复制次数
- **智能搜索**: 支持标题和内容的全文搜索
- **标签筛选**: 通过标签快速筛选相关话术
- **详情查看**: 模态框展示话术完整内容
- **响应式设计**: 完美适配桌面端和移动端

### 管理员功能
- **话术管理**: 创建、编辑、删除话术内容
- **模块管理**: 创建层级化的模块分类系统
- **标签系统**: 为话术添加多个标签便于分类
- **数据统计**: 查看话术复制次数和创建时间
- **Unicode支持**: 完整支持表情符号和特殊字符

## 🛠 技术栈

- **前端框架**: Next.js 15.3.4 (App Router)
- **样式框架**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **图标库**: Lucide React
- **开发语言**: TypeScript
- **部署平台**: Vercel

## 📦 项目结构

```
xhs-huashu/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 用户主页 - 话术浏览和复制
│   └── admin/             # 管理后台
│       └── page.tsx       # 管理员页面 - 话术和模块管理
├── components/            # React 组件
│   ├── CopyButton.tsx     # 复制按钮组件
│   ├── ScriptCard.tsx     # 话术卡片组件
│   ├── ModuleNav.tsx      # 模块导航组件
│   ├── SearchBar.tsx      # 搜索栏组件
│   └── ScriptModal.tsx    # 话术详情模态框
├── lib/                   # 工具库和配置
│   ├── supabase.ts        # Supabase 客户端和数据服务
│   └── utils.ts           # 通用工具函数
├── .env.local.example     # 环境变量模板
└── README.md              # 项目说明文档
```

## 🗄 数据库设计

### 模块表 (modules)
- `id`: 主键 (UUID)
- `name`: 模块名称
- `description`: 模块描述
- `parent_id`: 父模块ID (支持层级结构)
- `created_at`: 创建时间

### 话术表 (scripts)
- `id`: 主键 (UUID)
- `title`: 话术标题
- `content`: 话术内容 (支持Unicode和表情)
- `module_id`: 所属模块ID
- `tags`: 标签数组
- `copy_count`: 复制次数
- `created_at`: 创建时间

## 🚀 快速开始

### 1. 环境准备

确保你的系统已安装:
- Node.js 18+ 
- npm 或 yarn
- Git

### 2. 克隆项目

```bash
git clone <repository-url>
cd xhs-huashu
```

### 3. 安装依赖

```bash
npm install
# 或
yarn install
```

### 4. 配置环境变量

复制环境变量模板并填入你的配置:

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，填入以下信息:

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 管理员配置 (可选)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

# JWT 密钥 (可选)
JWT_SECRET=your_jwt_secret
```

### 5. 设置 Supabase 数据库

在 Supabase 控制台中执行以下 SQL 创建数据表:

```sql
-- 创建模块表
CREATE TABLE modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建话术表
CREATE TABLE scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  copy_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提升查询性能
CREATE INDEX idx_scripts_module_id ON scripts(module_id);
CREATE INDEX idx_scripts_tags ON scripts USING GIN(tags);
CREATE INDEX idx_modules_parent_id ON modules(parent_id);
```

### 6. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📱 使用指南

### 用户端使用

1. **浏览话术**: 在主页左侧选择模块分类，右侧显示对应话术
2. **搜索话术**: 使用顶部搜索框输入关键词搜索
3. **标签筛选**: 点击标签进行筛选，可多选
4. **复制话术**: 点击话术卡片上的复制按钮一键复制
5. **查看详情**: 点击"查看详情"按钮在模态框中查看完整内容

### 管理员使用

1. **访问管理后台**: 点击右上角"管理后台"按钮
2. **话术管理**:
   - 点击"新增话术"创建话术
   - 填写标题、选择模块、输入内容、添加标签
   - 支持表情符号和特殊字符
   - 可编辑和删除现有话术
3. **模块管理**:
   - 点击"新增模块"创建分类
   - 支持创建子模块形成层级结构
   - 可编辑模块名称和描述

## 🎨 设计特色

- **苹果风格**: 采用现代化的苹果设计语言
- **毛玻璃效果**: 使用 backdrop-blur 实现精美的毛玻璃背景
- **渐变背景**: 蓝紫色渐变营造优雅氛围
- **圆角设计**: 统一使用圆角元素提升视觉体验
- **微交互**: 丰富的悬停和点击动画效果
- **响应式布局**: 完美适配各种屏幕尺寸

## 🔧 开发说明

### 核心组件说明

- **CopyButton**: 处理文本复制和复制次数统计
- **ScriptCard**: 展示话术卡片，包含标题、内容预览、标签等
- **ModuleNav**: 模块导航，支持层级展示和选择
- **SearchBar**: 搜索和标签筛选功能
- **ScriptModal**: 话术详情模态框

### 数据服务

- **scriptService**: 话术相关的 CRUD 操作
- **moduleService**: 模块相关的 CRUD 操作
- **工具函数**: 文本处理、日期格式化、筛选等

### 状态管理

使用 React Hooks 进行状态管理:
- `useState`: 组件状态
- `useEffect`: 副作用处理
- 无需额外状态管理库，保持简洁

## 🚀 部署指南

### Vercel 部署 (推荐)

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 自动部署完成

### 其他平台部署

项目支持部署到任何支持 Next.js 的平台:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔒 安全考虑

- 环境变量安全存储
- Supabase RLS (行级安全) 配置
- 输入验证和 XSS 防护
- HTTPS 强制使用

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如有问题或建议，请:
- 创建 Issue
- 发送邮件到 [your-email@example.com]
- 查看文档和 FAQ

---

**话术助手** - 让话术管理更简单，让复制更高效！ 🚀
