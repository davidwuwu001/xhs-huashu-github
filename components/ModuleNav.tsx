'use client'

import { useState, useEffect } from 'react'
import { Module, moduleService } from '@/lib/supabase'
import { buildModuleTree } from '@/lib/utils'
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react'

interface ModuleNavProps {
  selectedModuleId?: string
  onModuleSelect: (moduleId: string | null) => void
}

interface ModuleTreeNodeProps {
  module: Module & { children: Module[] }
  level: number
  selectedModuleId?: string
  onModuleSelect: (moduleId: string | null) => void
  expandedModules: Set<string>
  onToggleExpand: (moduleId: string) => void
}

function ModuleTreeNode({ 
  module, 
  level, 
  selectedModuleId, 
  onModuleSelect, 
  expandedModules,
  onToggleExpand 
}: ModuleTreeNodeProps) {
  const isExpanded = expandedModules.has(module.id)
  const isSelected = selectedModuleId === module.id
  const hasChildren = module.children && module.children.length > 0

  return (
    <div className="">
      <div 
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer
          transition-all duration-200 group
          ${isSelected 
            ? 'bg-blue-100 text-blue-700 shadow-sm' 
            : 'hover:bg-gray-50 text-gray-700'
          }
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onModuleSelect(module.id)}
      >
        {/* 展开/收起按钮 */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(module.id)
            }}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
        ) : (
          <div className="w-5" /> // 占位符保持对齐
        )}

        {/* 文件夹图标 */}
        {hasChildren ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-blue-500" />
          ) : (
            <Folder className="w-4 h-4 text-gray-500" />
          )
        ) : (
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
        )}

        {/* 模块名称 */}
        <span className="text-sm font-medium truncate flex-1">
          {module.name}
        </span>
      </div>

      {/* 子模块 */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {module.children
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((child) => (
              <ModuleTreeNode
                key={child.id}
                module={child as Module & { children: Module[] }}
                level={level + 1}
                selectedModuleId={selectedModuleId}
                onModuleSelect={onModuleSelect}
                expandedModules={expandedModules}
                onToggleExpand={onToggleExpand}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export default function ModuleNav({ selectedModuleId, onModuleSelect }: ModuleNavProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [moduleTree, setModuleTree] = useState<(Module & { children: Module[] })[]>([])
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      const data = await moduleService.getModules()
      setModules(data)
      const tree = buildModuleTree(data) as (Module & { children: Module[] })[]
      setModuleTree(tree)
    } catch (error) {
      console.error('加载模块失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleExpand = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* 全部话术选项 */}
      <div 
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer
          transition-all duration-200
          ${!selectedModuleId 
            ? 'bg-blue-100 text-blue-700 shadow-sm' 
            : 'hover:bg-gray-50 text-gray-700'
          }
        `}
        onClick={() => onModuleSelect(null)}
      >
        <div className="w-5" />
        <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded" />
        <span className="text-sm font-medium">全部话术</span>
      </div>

      {/* 模块树 */}
      {moduleTree.map((module) => (
        <ModuleTreeNode
          key={module.id}
          module={module}
          level={0}
          selectedModuleId={selectedModuleId}
          onModuleSelect={onModuleSelect}
          expandedModules={expandedModules}
          onToggleExpand={handleToggleExpand}
        />
      ))}

      {/* 空状态 */}
      {moduleTree.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无模块</p>
          <p className="text-xs mt-1">请联系管理员添加模块</p>
        </div>
      )}
    </div>
  )
}