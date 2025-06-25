'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'
import { scriptService } from '@/lib/supabase'

interface CopyButtonProps {
  text: string
  scriptId?: string
  className?: string
  showText?: boolean
  onCopySuccess?: () => void
}

export default function CopyButton({ 
  text, 
  scriptId, 
  className = '', 
  showText = true,
  onCopySuccess
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLoading(true)
    setError(false)
    
    try {
      const success = await copyToClipboard(text)
      
      if (success) {
        setCopied(true)
        
        // 如果有scriptId，增加复制计数
        if (scriptId) {
          try {
            await scriptService.incrementCopyCount(scriptId)
            // 调用成功回调，刷新数据
            if (onCopySuccess) {
              onCopySuccess()
            }
          } catch (countError) {
            console.error('增加复制次数失败:', countError)
            // 复制计数失败不影响复制成功的状态，但应该记录错误
          }
        }
        
        // 2秒后重置状态
        setTimeout(() => setCopied(false), 2000)
      } else {
        setError(true)
        setTimeout(() => setError(false), 2000)
      }
    } catch (error) {
      console.error('复制失败:', error)
      setError(true)
      setTimeout(() => setError(false), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  // 检查是否是在卡片中使用（通过className判断）
  const isCardButton = className.includes('group-hover:opacity-100')
  
  return (
    <button
      onClick={handleCopy}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-2 rounded-xl
        font-medium text-sm
        transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          isCardButton 
            ? `p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 ${copied ? 'bg-green-100 text-green-600' : ''} ${error ? 'bg-red-100 text-red-600' : ''}` 
            : `px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${copied ? 'bg-green-500 hover:bg-green-600' : ''} ${error ? 'bg-red-500 hover:bg-red-600' : ''}`
        }
        ${className}
      `}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          {showText && '已复制'}
        </>
      ) : error ? (
        <>
          <Copy className="w-4 h-4" />
          {showText && '复制失败'}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {showText && '复制'}
        </>
      )}
    </button>
  )
}