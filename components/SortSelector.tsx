'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ArrowUpDown, TrendingUp, Clock, Hash, ArrowUp, ArrowDown } from 'lucide-react'

interface SortSelectorProps {
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

const sortOptions = [
  { value: 'created_at', label: '创建时间', icon: Clock },
  { value: 'copy_count', label: '热门程度', icon: TrendingUp },
  { value: 'title_number', label: '标题序号', icon: Hash },
]

export default function SortSelector({ sortBy, sortOrder, onSortChange }: SortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const currentOption = sortOptions.find(option => option.value === sortBy) || sortOptions[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 计算下拉菜单的最佳显示位置
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return 'bottom'
    
    const buttonRect = buttonRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = sortOptions.length * 44 + 8 // 每个选项约44px高度 + 边距
    
    // 检查下方是否有足够空间
    const spaceBelow = viewportHeight - buttonRect.bottom - 20 // 留20px缓冲
    const spaceAbove = buttonRect.top - 20 // 留20px缓冲
    
    // 如果下方空间不足且上方空间充足，则在上方显示
    if (spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight) {
      return 'top'
    }
    
    return 'bottom'
  }

  const handleToggleDropdown = () => {
    if (!isOpen) {
      // 打开时计算位置
      const position = calculateDropdownPosition()
      setDropdownPosition(position)
    }
    setIsOpen(!isOpen)
  }

  const handleSortByChange = (newSortBy: string) => {
    onSortChange(newSortBy, sortOrder)
    setIsOpen(false)
  }

  const handleSortOrderToggle = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="flex gap-1">
      {/* 排序字段选择 */}
      <div className="relative" ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={handleToggleDropdown}
          className="
            flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200
            bg-white hover:bg-gray-50 text-gray-700 text-sm
            transition-all duration-200 min-w-0
          "
        >
          <ArrowUpDown className="w-4 h-4 flex-shrink-0" />
          <span className="hidden sm:inline truncate">排序: {currentOption.label}</span>
          <span className="sm:hidden text-xs">排序</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className={`
            absolute ${dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'} right-0 
            w-40 bg-white rounded-xl shadow-lg border border-gray-200
            z-[9999] overflow-hidden
          `}>
            {sortOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => handleSortByChange(option.value)}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm
                    hover:bg-gray-50 transition-colors
                    ${sortBy === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 排序方向切换 */}
      <button
        onClick={handleSortOrderToggle}
        className="
          flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200
          bg-white hover:bg-gray-50 text-gray-700
          transition-all duration-200
        "
        title={sortOrder === 'desc' ? '降序' : '升序'}
      >
        {sortOrder === 'desc' ? (
          <ArrowDown className="w-4 h-4" />
        ) : (
          <ArrowUp className="w-4 h-4" />
        )}
      </button>
    </div>
  )
} 