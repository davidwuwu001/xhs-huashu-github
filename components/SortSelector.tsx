'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentOption = sortOptions.find(option => option.value === sortBy) || sortOptions[0]

  // SSR兼容性处理
  useEffect(() => {
    setMounted(true)
  }, [])

  // 计算下拉菜单位置
  const updateDropdownPosition = () => {
    if (!buttonRef.current) return
    
    const buttonRect = buttonRef.current.getBoundingClientRect()
    const dropdownWidth = 160
    const dropdownHeight = sortOptions.length * 44 + 8
    
    // 水平位置 - 右对齐，确保不超出视口
    let left = buttonRect.right - dropdownWidth
    if (left < 8) left = 8
    if (left + dropdownWidth > window.innerWidth - 8) {
      left = window.innerWidth - dropdownWidth - 8
    }
    
    // 垂直位置 - 智能选择上方或下方
    let top = buttonRect.bottom + 4
    const spaceBelow = window.innerHeight - buttonRect.bottom
    if (spaceBelow < dropdownHeight + 20) {
      top = buttonRect.top - dropdownHeight - 4
      // 如果上方空间也不够，优先显示在下方
      if (top < 8) {
        top = buttonRect.bottom + 4
      }
    }
    
    setDropdownStyle({
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${dropdownWidth}px`,
      zIndex: 9999,
    })
  }

  // 事件监听管理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      // 检查点击是否在按钮或下拉菜单内
      const isInButton = buttonRef.current && buttonRef.current.contains(target)
      const isInDropdown = dropdownRef.current && dropdownRef.current.contains(target)
      
      if (!isInButton && !isInDropdown) {
        setIsOpen(false)
      }
    }

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition()
      }
    }

    const handleResize = () => {
      if (isOpen) {
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
  }, [isOpen])

  // 打开下拉菜单时更新位置
  useEffect(() => {
    if (isOpen && mounted) {
      updateDropdownPosition()
    }
  }, [isOpen, mounted])

  const handleSortByChange = (newSortBy: string) => {
    onSortChange(newSortBy, sortOrder)
    setIsOpen(false)
  }

  const handleSortOrderToggle = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const handleButtonClick = () => {
    setIsOpen(!isOpen)
  }

  // Portal渲染下拉菜单
  const renderDropdown = () => {
    if (!isOpen || !mounted) return null

    return createPortal(
      <div 
        ref={dropdownRef}
        style={dropdownStyle} 
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
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
      </div>,
      document.body
    )
  }

  return (
    <div className="flex gap-1">
      {/* 排序字段选择 */}
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
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

      {/* Portal渲染的下拉菜单 */}
      {renderDropdown()}

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