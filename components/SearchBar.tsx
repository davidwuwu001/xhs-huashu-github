'use client'

import { useState, useEffect } from 'react'
import { Search, X, Tag } from 'lucide-react'
import { generateTagColor } from '@/lib/utils'
import SortSelector from './SortSelector'

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  availableTags: string[]
  placeholder?: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

export default function SearchBar({
  searchTerm,
  onSearchChange,
  selectedTags,
  onTagsChange,
  availableTags,
  placeholder = '搜索话术...',
  sortBy,
  sortOrder,
  onSortChange
}: SearchBarProps) {
  const [showTagDropdown, setShowTagDropdown] = useState(false)
  const [tagSearchTerm, setTagSearchTerm] = useState('')

  // 过滤可用标签
  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(tagSearchTerm.toLowerCase()) &&
    !selectedTags.includes(tag)
  )

  const handleTagSelect = (tag: string) => {
    onTagsChange([...selectedTags, tag])
    setTagSearchTerm('')
  }

  const handleTagRemove = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag))
  }

  const clearAll = () => {
    onSearchChange('')
    onTagsChange([])
    setTagSearchTerm('')
  }

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.tag-dropdown-container')) {
        setShowTagDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-3">
      {/* 搜索输入框和排序 - 优化为一行布局 */}
      <div className="flex gap-2">
        {/* 搜索框 */}
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="
              block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              bg-white/80 backdrop-blur-sm
              placeholder-gray-400 text-gray-900 text-sm
              transition-all duration-200
            "
          />
          {(searchTerm || selectedTags.length > 0) && (
            <button
              onClick={clearAll}
              className="
                absolute inset-y-0 right-0 pr-3 flex items-center
                text-gray-400 hover:text-gray-600 transition-colors
              "
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 排序选择器 - 紧凑布局 */}
        <div className="flex-shrink-0">
          <SortSelector
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
          />
        </div>
      </div>

      {/* 标签过滤 - 只在有标签时显示 */}
      {(selectedTags.length > 0 || availableTags.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {/* 已选择的标签 */}
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className={`
                inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
                ${generateTagColor(tag)} cursor-pointer hover:opacity-80 transition-opacity
              `}
            >
              {tag}
              <button
                onClick={() => handleTagRemove(tag)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {/* 添加标签按钮 */}
          {availableTags.length > selectedTags.length && (
            <div className="relative tag-dropdown-container">
              <button
                onClick={() => setShowTagDropdown(!showTagDropdown)}
                className="
                  inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                  border border-dashed border-gray-300 text-gray-500
                  hover:border-gray-400 hover:text-gray-600
                  transition-colors
                "
              >
                <Tag className="h-3 w-3" />
                <span className="hidden sm:inline">添加标签</span>
                <span className="sm:hidden">标签</span>
              </button>

              {/* 标签下拉菜单 */}
              {showTagDropdown && (
                <div className="
                  absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-200
                  z-[60] max-h-60 overflow-hidden
                ">
                  {/* 标签搜索 */}
                  <div className="p-3 border-b border-gray-100">
                    <input
                      type="text"
                      value={tagSearchTerm}
                      onChange={(e) => setTagSearchTerm(e.target.value)}
                      placeholder="搜索标签..."
                      className="
                        w-full px-3 py-2 border border-gray-200 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        text-sm
                      "
                      autoFocus
                    />
                  </div>

                  {/* 标签列表 */}
                  <div className="max-h-40 overflow-y-auto">
                    {filteredTags.length > 0 ? (
                      filteredTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagSelect(tag)}
                          className="
                            w-full text-left px-3 py-2 hover:bg-gray-50
                            transition-colors text-sm text-gray-700
                          "
                        >
                          <span className={`
                            inline-block px-2 py-1 rounded-lg text-xs font-medium mr-2
                            ${generateTagColor(tag)}
                          `}>
                            {tag}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-gray-500 text-sm">
                        {tagSearchTerm ? '未找到匹配的标签' : '没有更多标签'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}