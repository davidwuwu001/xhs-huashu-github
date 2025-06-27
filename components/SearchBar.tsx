'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, Tag, X } from 'lucide-react'
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
  const [isTagsOpen, setIsTagsOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const [mounted, setMounted] = useState(false)
  const tagButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagButtonRef.current && !tagButtonRef.current.contains(event.target as Node)) {
        setIsTagsOpen(false)
      }
    }

    const handleScroll = () => {
      if (isTagsOpen) {
        updateDropdownPosition()
      }
    }

    const handleResize = () => {
      if (isTagsOpen) {
        updateDropdownPosition()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [isTagsOpen])

  const updateDropdownPosition = () => {
    if (!tagButtonRef.current) return

    const buttonRect = tagButtonRef.current.getBoundingClientRect()
    const dropdownWidth = 200
    const maxDropdownHeight = Math.min(availableTags.length * 40 + 16, 240) // 最大高度240px
    
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // 计算水平位置 - 右对齐
    let left = buttonRect.right - dropdownWidth
    if (left < 8) left = 8
    if (left + dropdownWidth > viewportWidth - 8) {
      left = viewportWidth - dropdownWidth - 8
    }

    // 计算垂直位置
    let top = buttonRect.bottom + 4
    const spaceBelow = viewportHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top
    
    if (spaceBelow < maxDropdownHeight + 20 && spaceAbove > maxDropdownHeight + 20) {
      top = buttonRect.top - maxDropdownHeight - 4
    }
    
    if (top < 8) top = 8
    if (top + maxDropdownHeight > viewportHeight - 8) {
      top = viewportHeight - maxDropdownHeight - 8
    }

    setDropdownStyle({
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${dropdownWidth}px`,
      maxHeight: `${maxDropdownHeight}px`,
      zIndex: 9999,
    })
  }

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const handleTagsToggle = () => {
    if (!isTagsOpen) {
      updateDropdownPosition()
    }
    setIsTagsOpen(!isTagsOpen)
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove))
  }

  const renderTagsDropdown = () => {
    if (!isTagsOpen || !mounted) return null

    return createPortal(
      <div
        style={dropdownStyle}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        <div className="max-h-full overflow-y-auto">
          {availableTags.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">暂无标签</div>
          ) : (
            availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-left text-sm
                  hover:bg-gray-50 transition-colors
                  ${selectedTags.includes(tag) ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                `}
              >
                <Tag className="w-4 h-4" />
                {tag}
                {selectedTags.includes(tag) && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>,
      document.body
    )
  }

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
              onClick={() => {
                onSearchChange('')
                onTagsChange([])
              }}
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
          {/* 标签选择按钮 */}
          <div className="relative">
            <button
              ref={tagButtonRef}
              onClick={handleTagsToggle}
              className="
                flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200
                bg-white hover:bg-gray-50 text-gray-700 text-sm
                transition-all duration-200
              "
            >
              <Tag className="w-4 h-4" />
              <span>标签</span>
              {selectedTags.length > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedTags.length}
                </span>
              )}
            </button>

            {renderTagsDropdown()}
          </div>

          {/* 已选标签 */}
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
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}