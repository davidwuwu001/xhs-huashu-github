import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// 合并Tailwind CSS类名
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 复制文本到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // 使用现代Clipboard API
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

// 格式化日期
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 截断文本
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// 生成随机颜色（用于标签）
export function generateTagColor(tag: string): string {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-gray-100 text-gray-800'
  ]
  
  // 基于标签名生成一致的颜色
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

// 搜索过滤函数
export function filterScripts(scripts: any[], searchTerm: string, selectedTags: string[] = []) {
  return scripts.filter(script => {
    const matchesSearch = !searchTerm || 
      script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      script.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => script.tags.includes(tag))
    
    return matchesSearch && matchesTags
  })
}

// 构建模块树结构
export function buildModuleTree(modules: any[]) {
  const moduleMap = new Map()
  const rootModules: any[] = []
  
  // 创建模块映射
  modules.forEach(module => {
    moduleMap.set(module.id, { ...module, children: [] })
  })
  
  // 构建树结构
  modules.forEach(module => {
    const moduleNode = moduleMap.get(module.id)
    if (module.parent_id) {
      const parent = moduleMap.get(module.parent_id)
      if (parent) {
        parent.children.push(moduleNode)
      }
    } else {
      rootModules.push(moduleNode)
    }
  })
  
  return rootModules
}