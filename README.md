# 小红书话术管理系统

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

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/davidwuwu001/xhs-huashu-github.git
cd xhs-huashu-github
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 3. 配置环境变量

复制 `.env.local.example` 为 `.env.local` 并填入你的配置：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 管理员配置
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

# JWT密钥（用于管理员认证）
JWT_SECRET=your_jwt_secret_key
```

### 4. 设置 Supabase 数据库

在你的 Supabase 项目中执行 `database_setup.sql` 文件中的 SQL 语句来创建必要的表和函数。

### 5. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 6. 访问管理后台

访问 [http://localhost:3000/admin](http://localhost:3000/admin) 进入管理后台。

## 📝 使用说明

### 用户端功能

1. **浏览话术**: 在主页可以看到所有话术，按模块分类显示
2. **搜索话术**: 使用顶部搜索框搜索话术标题或内容
3. **筛选标签**: 点击标签快速筛选相关话术
4. **复制话术**: 点击复制按钮一键复制话术内容
5. **查看详情**: 点击话术卡片查看完整内容

### 管理员功能

1. **登录管理后台**: 使用配置的管理员邮箱和密码登录
2. **管理话术**: 创建、编辑、删除话术内容
3. **管理模块**: 创建和管理话术分类模块
4. **标签管理**: 为话术添加和管理标签
5. **数据统计**: 查看话术的复制次数和使用情况

## 🔧 开发指南

### 项目架构

- **前端**: 使用 Next.js 15 的 App Router 架构
- **样式**: Tailwind CSS 提供现代化的苹果风格设计
- **数据库**: Supabase PostgreSQL 数据库
- **状态管理**: React Hooks 进行本地状态管理
- **类型安全**: 完整的 TypeScript 类型定义

### 核心组件说明

- **CopyButton**: 复制按钮组件，支持复制计数和状态反馈
- **ScriptCard**: 话术卡片组件，展示话术基本信息
- **ModuleNav**: 模块导航组件，支持模块筛选
- **SearchBar**: 搜索栏组件，支持实时搜索
- **ScriptModal**: 话术详情模态框，展示完整内容

### 数据库设计

#### modules 表
- `id`: UUID 主键
- `name`: 模块名称
- `description`: 模块描述
- `created_at`: 创建时间

#### scripts 表
- `id`: UUID 主键
- `title`: 话术标题
- `content`: 话术内容
- `module_id`: 所属模块ID
- `tags`: 标签数组
- `copy_count`: 复制次数
- `created_at`: 创建时间
- `updated_at`: 更新时间

### API 接口

项目使用 Supabase 的 REST API 和实时功能：

- **话术查询**: 支持分页、搜索、筛选
- **模块管理**: CRUD 操作
- **复制计数**: 自动更新复制次数
- **实时更新**: 支持数据实时同步

## 🚀 部署

### Vercel 部署（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署完成

### 其他平台部署

项目支持部署到任何支持 Next.js 的平台，如：
- Netlify
- Railway
- Heroku
- 自托管服务器

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 📄 许可证

MIT License

## 🙏 致谢

感谢以下开源项目：
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Lucide React](https://lucide.dev/)

---

如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！