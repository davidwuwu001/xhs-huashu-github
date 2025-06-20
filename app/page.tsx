'use client'

import { useState, useEffect } from 'react'
import { Script, scriptService } from '@/lib/supabase'
import { filterScripts } from '@/lib/utils'
import ModuleNav from '@/components/ModuleNav'
import SearchBar from '@/components/SearchBar'
import ScriptCard from '@/components/ScriptCard'
import ScriptModal from '@/components/ScriptModal'
import { Settings, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取所有可用标签
  const availableTags = Array.from(
    new Set(scripts.flatMap(script => script.tags || []))
  ).sort()

  useEffect(() => {
    loadScripts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [scripts, selectedModuleId, searchTerm, selectedTags])

  const loadScripts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = selectedModuleId 
        ? await scriptService.getScriptsByModule(selectedModuleId)
        : await scriptService.getScripts()
      setScripts(data)
    } catch (err) {
      console.error('加载话术失败:', err)
      setError('加载话术失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = scripts

    // 模块过滤
    if (selectedModuleId) {
      filtered = filtered.filter(script => script.module_id === selectedModuleId)
    }

    // 搜索和标签过滤
    filtered = filterScripts(filtered, searchTerm, selectedTags)

    setFilteredScripts(filtered)
  }

  const handleModuleSelect = async (moduleId: string | null) => {
    setSelectedModuleId(moduleId)
    setLoading(true)
    try {
      const data = moduleId 
        ? await scriptService.getScriptsByModule(moduleId)
        : await scriptService.getScripts()
      setScripts(data)
    } catch (err) {
      console.error('加载话术失败:', err)
      setError('加载话术失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">话术助手</h1>
            </div>
            
            <Link 
              href="/admin"
              className="
                flex items-center gap-2 px-4 py-2 rounded-xl
                bg-gray-100 hover:bg-gray-200 text-gray-700
                transition-all duration-200
              "
            >
              <Settings className="w-4 h-4" />
              管理后台
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧边栏 - 模块导航 */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">模块分类</h2>
              <ModuleNav 
                selectedModuleId={selectedModuleId || undefined}
                onModuleSelect={handleModuleSelect}
              />
            </div>
          </div>

          {/* 主内容区 */}
          <div className="lg:col-span-3">
            {/* 搜索栏 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                availableTags={availableTags}
                placeholder="搜索话术标题或内容..."
              />
            </div>

            {/* 话术列表 */}
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={loadScripts}
                  className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors"
                >
                  重试
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-3" />
                      <div className="h-3 bg-gray-200 rounded mb-2" />
                      <div className="h-3 bg-gray-200 rounded mb-4 w-3/4" />
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 bg-gray-200 rounded-lg w-16" />
                        <div className="h-6 bg-gray-200 rounded-lg w-20" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-3 bg-gray-200 rounded w-24" />
                        <div className="h-8 bg-gray-200 rounded-xl w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredScripts.length > 0 ? (
              <>
                {/* 结果统计 */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600">
                    找到 <span className="font-semibold text-gray-900">{filteredScripts.length}</span> 条话术
                    {selectedModuleId && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">
                        当前模块
                      </span>
                    )}
                  </p>
                </div>

                {/* 话术网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredScripts.map((script) => (
                    <ScriptCard
                      key={script.id}
                      script={script}
                      onView={setSelectedScript}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedTags.length > 0 ? '未找到匹配的话术' : '暂无话术'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedTags.length > 0 
                    ? '尝试调整搜索条件或清除筛选器' 
                    : '请联系管理员添加话术内容'
                  }
                </p>
                {(searchTerm || selectedTags.length > 0) && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedTags([])
                    }}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors"
                  >
                    清除筛选器
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 话术详情模态框 */}
      <ScriptModal
        script={selectedScript}
        isOpen={!!selectedScript}
        onClose={() => setSelectedScript(null)}
      />
    </div>
  )
}
