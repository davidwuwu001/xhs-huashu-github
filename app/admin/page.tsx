'use client'

import { useState, useEffect } from 'react'
import { Script, Module, scriptService, moduleService } from '@/lib/supabase'
import { Plus, Edit, Trash2, Save, X, ArrowLeft, FolderPlus, Tag } from 'lucide-react'
import Link from 'next/link'

interface ScriptForm {
  title: string
  content: string
  module_id: string | null
  tags: string[]
}

interface ModuleForm {
  name: string
  description: string
  parent_id: string | null
}

export default function AdminPage() {
  // 密码验证状态
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  
  const [scripts, setScripts] = useState<Script[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [activeTab, setActiveTab] = useState<'scripts' | 'modules'>('scripts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 话术相关状态
  const [editingScript, setEditingScript] = useState<Script | null>(null)
  const [showScriptForm, setShowScriptForm] = useState(false)
  const [scriptForm, setScriptForm] = useState<ScriptForm>({
    title: '',
    content: '',
    module_id: null,
    tags: []
  })
  const [newTag, setNewTag] = useState('')
  
  // 模块相关状态
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [showModuleForm, setShowModuleForm] = useState(false)
  const [moduleForm, setModuleForm] = useState<ModuleForm>({
    name: '',
    description: '',
    parent_id: null
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  // 密码验证函数
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'admin123') {
      setIsAuthenticated(true)
      setPasswordError('')
    } else {
      setPasswordError('密码错误，请重新输入')
      setPassword('')
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [scriptsData, modulesData] = await Promise.all([
        scriptService.getScripts(),
        moduleService.getModules()
      ])
      setScripts(scriptsData)
      setModules(modulesData)
    } catch (err) {
      console.error('加载数据失败:', err)
      setError('加载数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 话术管理函数
  const handleCreateScript = () => {
    setEditingScript(null)
    setScriptForm({
      title: '',
      content: '',
      module_id: null,
      tags: []
    })
    setShowScriptForm(true)
  }

  const handleEditScript = (script: Script) => {
    setEditingScript(script)
    setScriptForm({
      title: script.title,
      content: script.content,
      module_id: script.module_id,
      tags: script.tags || []
    })
    setShowScriptForm(true)
  }

  const handleSaveScript = async () => {
    try {
      console.log('开始保存话术，表单数据:', scriptForm)
      
      // 验证必填字段
      if (!scriptForm.title.trim()) {
        setError('请输入话术标题')
        return
      }
      if (!scriptForm.content.trim()) {
        setError('请输入话术内容')
        return
      }
      
      // 准备保存的数据
      const saveData = {
        title: scriptForm.title.trim(),
        content: scriptForm.content.trim(),
        module_id: scriptForm.module_id || null,
        tags: scriptForm.tags || []
      }
      
      console.log('准备保存的数据:', saveData)
      
      if (editingScript) {
        console.log('更新话术:', editingScript.id)
        await scriptService.updateScript(editingScript.id, saveData)
      } else {
        console.log('创建新话术')
        const result = await scriptService.createScript(saveData)
        console.log('创建结果:', result)
      }
      
      setShowScriptForm(false)
      setError(null)
      await loadData()
      console.log('话术保存成功')
    } catch (err) {
      console.error('保存话术失败，详细错误:', err)
      console.error('错误类型:', typeof err)
      console.error('错误消息:', err?.message)
      console.error('错误详情:', err?.details)
      console.error('错误代码:', err?.code)
      setError(`保存话术失败: ${err?.message || '未知错误'}`)
    }
  }

  const handleDeleteScript = async (id: string) => {
    if (!confirm('确定要删除这条话术吗？')) return
    
    try {
      await scriptService.deleteScript(id)
      loadData()
    } catch (err) {
      console.error('删除话术失败:', err)
      setError('删除话术失败，请稍后重试')
    }
  }

  const addTag = () => {
    if (newTag.trim() && !scriptForm.tags.includes(newTag.trim())) {
      setScriptForm({
        ...scriptForm,
        tags: [...scriptForm.tags, newTag.trim()]
      })
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setScriptForm({
      ...scriptForm,
      tags: scriptForm.tags.filter(tag => tag !== tagToRemove)
    })
  }

  // 模块管理函数
  const handleCreateModule = () => {
    setEditingModule(null)
    setModuleForm({
      name: '',
      description: '',
      parent_id: null
    })
    setShowModuleForm(true)
  }

  const handleEditModule = (module: Module) => {
    setEditingModule(module)
    setModuleForm({
      name: module.name,
      description: module.description || '',
      parent_id: module.parent_id
    })
    setShowModuleForm(true)
  }

  const handleSaveModule = async () => {
    try {
      if (editingModule) {
        await moduleService.updateModule(editingModule.id, moduleForm)
      } else {
        await moduleService.createModule(moduleForm)
      }
      setShowModuleForm(false)
      loadData()
    } catch (err) {
      console.error('保存模块失败:', err)
      setError('保存模块失败，请稍后重试')
    }
  }

  const handleDeleteModule = async (id: string) => {
    if (!confirm('确定要删除这个模块吗？删除后其下的话术将变为未分类。')) return
    
    try {
      await moduleService.deleteModule(id)
      loadData()
    } catch (err) {
      console.error('删除模块失败:', err)
      setError('删除模块失败，请稍后重试')
    }
  }

  const getModuleName = (moduleId: string | null) => {
    if (!moduleId) return '未分类'
    const module = modules.find(m => m.id === moduleId)
    return module?.name || '未知模块'
  }

  // 如果未通过密码验证，显示密码输入界面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">管理员登录</h1>
            <p className="text-gray-600">请输入管理员密码以继续</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="请输入管理员密码"
                required
              />
            </div>
            
            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{passwordError}</p>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              登录
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                返回首页
              </Link>
              <h1 className="text-xl font-bold text-gray-900">管理后台</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-red-500 hover:text-red-700 text-sm"
            >
              关闭
            </button>
          </div>
        )}

        {/* 标签页 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('scripts')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === 'scripts'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              话术管理
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === 'modules'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              模块管理
            </button>
          </div>

          {/* 话术管理 */}
          {activeTab === 'scripts' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">话术列表</h2>
                <button
                  onClick={handleCreateScript}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  新增话术
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 mt-2">加载中...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scripts.map((script) => (
                    <div key={script.id} className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">{script.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            模块: {getModuleName(script.module_id)}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                            {script.content}
                          </p>
                          {script.tags && script.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {script.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-gray-400">
                            复制次数: {script.copy_count} | 创建时间: {new Date(script.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditScript(script)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteScript(script.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {scripts.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">暂无话术，点击上方按钮添加第一条话术</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 模块管理 */}
          {activeTab === 'modules' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">模块列表</h2>
                <button
                  onClick={handleCreateModule}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
                >
                  <FolderPlus className="w-4 h-4" />
                  新增模块
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 mt-2">加载中...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div key={module.id} className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">{module.name}</h3>
                          {module.description && (
                            <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            父模块: {getModuleName(module.parent_id)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            创建时间: {new Date(module.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditModule(module)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(module.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {modules.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">暂无模块，点击上方按钮添加第一个模块</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 话术表单模态框 */}
      {showScriptForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingScript ? '编辑话术' : '新增话术'}
              </h3>
              <button
                onClick={() => setShowScriptForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标题 *
                </label>
                <input
                  type="text"
                  value={scriptForm.title}
                  onChange={(e) => setScriptForm({ ...scriptForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入话术标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所属模块
                </label>
                <select
                  value={scriptForm.module_id || ''}
                  onChange={(e) => setScriptForm({ ...scriptForm, module_id: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">未分类</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容 *
                </label>
                <textarea
                  value={scriptForm.content}
                  onChange={(e) => setScriptForm({ ...scriptForm, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入话术内容，支持表情符号 😊"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入标签后按回车添加"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                </div>
                {scriptForm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {scriptForm.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveScript}
                disabled={!scriptForm.title.trim() || !scriptForm.content.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
              <button
                onClick={() => setShowScriptForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模块表单模态框 */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingModule ? '编辑模块' : '新增模块'}
              </h3>
              <button
                onClick={() => setShowModuleForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模块名称 *
                </label>
                <input
                  type="text"
                  value={moduleForm.name}
                  onChange={(e) => setModuleForm({ ...moduleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="请输入模块名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  父模块
                </label>
                <select
                  value={moduleForm.parent_id || ''}
                  onChange={(e) => setModuleForm({ ...moduleForm, parent_id: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">无（顶级模块）</option>
                  {modules
                    .filter(m => editingModule ? m.id !== editingModule.id : true)
                    .map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="请输入模块描述（可选）"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveModule}
                disabled={!moduleForm.name.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
              <button
                onClick={() => setShowModuleForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}