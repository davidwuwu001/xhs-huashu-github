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
}

export default function CopyButton({ 
  text, 
  scriptId, 
  className = '', 
  showText = true 
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
          } catch (countError) {
            // 复制计数失败不影响复制成功的状态，静默处理
            // 可以在这里添加日志记录或其他处理逻辑
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

  return (
    <button
      onClick={handleCopy}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-xl
        bg-blue-500 hover:bg-blue-600 active:bg-blue-700
        text-white font-medium text-sm
        transition-all duration-200 ease-in-out
        transform hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-lg hover:shadow-xl
        ${copied ? 'bg-green-500 hover:bg-green-600' : ''}
        ${error ? 'bg-red-500 hover:bg-red-600' : ''}
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