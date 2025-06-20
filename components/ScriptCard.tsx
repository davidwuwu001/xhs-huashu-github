'use client'

import { Script } from '@/lib/supabase'
import { generateTagColor, truncateText, formatDate } from '@/lib/utils'
import CopyButton from './CopyButton'
import { Eye } from 'lucide-react'

interface ScriptCardProps {
  script: Script
  onView?: (script: Script) => void
}

export default function ScriptCard({ script, onView }: ScriptCardProps) {
  return (
    <div className="
      group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100
      hover:shadow-xl hover:border-gray-200 transition-all duration-300
      backdrop-blur-sm bg-white/80
    ">
      {/* 标题和模块 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-2">
            {script.title}
          </h3>
          {script.module && (
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
              {script.module.name}
            </span>
          )}
        </div>
      </div>

      {/* 话术内容预览 */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
          {truncateText(script.content, 120)}
        </p>
      </div>

      {/* 标签 */}
      {script.tags && script.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {script.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                generateTagColor(tag)
              }`}
            >
              {tag}
            </span>
          ))}
          {script.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg">
              +{script.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>复制 {script.copy_count} 次</span>
          <span>{formatDate(script.created_at)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 查看详情按钮 */}
          {onView && (
            <button
              onClick={() => onView(script)}
              className="
                p-2 rounded-xl bg-gray-100 hover:bg-gray-200
                text-gray-600 hover:text-gray-800
                transition-all duration-200
              "
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          
          {/* 复制按钮 */}
          <CopyButton 
            text={script.content} 
            scriptId={script.id}
            showText={false}
            className="transition-opacity duration-200"
          />
        </div>
      </div>


    </div>
  )
}