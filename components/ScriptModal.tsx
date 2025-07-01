'use client'

import { useEffect } from 'react'
import { Script } from '@/lib/supabase'
import { generateTagColor, formatDate } from '@/lib/utils'
import CopyButton from './CopyButton'
import { X, Calendar, Hash, BarChart3 } from 'lucide-react'

interface ScriptModalProps {
  script: Script | null
  isOpen: boolean
  onClose: () => void
  onCopySuccess?: () => void
}

export default function ScriptModal({ script, isOpen, onClose, onCopySuccess }: ScriptModalProps) {
  // ESC键关闭模态框
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !script) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="
          relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl
          transform transition-all duration-300 scale-100
          max-h-[90vh] overflow-hidden
        ">
          {/* 头部 */}
          <div className="flex items-start justify-between p-6 border-b border-gray-100">
            <div className="flex-1 pr-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {script.title}
              </h2>
              {script.module && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg font-medium">
                  {script.module.name}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="
                p-2 rounded-xl bg-gray-100 hover:bg-gray-200
                text-gray-500 hover:text-gray-700
                transition-all duration-200
              "
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 内容区域 */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* 话术内容 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                话术内容
              </h3>
              <div className="
                bg-gray-50 rounded-2xl p-4 border border-gray-100
                whitespace-pre-wrap text-gray-800 leading-relaxed
              ">
                {script.content}
              </div>
            </div>

            {/* 标签 */}
            {script.tags && script.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {script.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-xl text-sm font-medium ${
                        generateTagColor(tag)
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 统计信息 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">复制次数</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {script.copy_count}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">创建时间</span>
                </div>
                <div className="text-sm font-medium text-green-700">
                  {formatDate(script.created_at)}
                </div>
              </div>
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50">
            <div className="text-sm text-gray-500">
              点击复制按钮或按 Ctrl+C 复制话术
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="
                  px-4 py-2 rounded-xl border border-gray-200
                  text-gray-600 hover:text-gray-800 hover:border-gray-300
                  transition-all duration-200
                "
              >
                关闭
              </button>
              <CopyButton 
                text={script.content} 
                scriptId={script.id}
                className="px-6 py-2"
                onCopySuccess={onCopySuccess}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}