"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressData {
  kb_id: string
  status: string
  progress_percentage: number
  message: string
  current_file: string
  current_file_index: number
  total_files: number
  start_time: number
  end_time?: number
  duration?: number
  error_message?: string
  completed_files: string[]
  failed_files: Array<{ filename: string; error: string }>
  processing_files: string[]
  pending_files: string[]
}

interface UploadProgressProps {
  kbId: string
  onComplete?: () => void
  onError?: (error: string) => void
  className?: string
  pollingInterval?: number
}

export function UploadProgress({
  kbId,
  onComplete,
  onError,
  className,
  pollingInterval = 5000
}: UploadProgressProps) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [isPolling, setIsPolling] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch(`/api/v1/progress/${kbId}`)

      if (!response.ok) {
        if (response.status === 404) {
          // 进度信息不存在，可能已经完成并被清理
          setIsPolling(false)
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data: ProgressData = await response.json()
      setProgressData(data)
      setError(null)

      // 如果处理完成或失败，停止轮询
      if (data.status === 'completed' || data.status === 'failed') {
        setIsPolling(false)

        if (data.status === 'completed') {
          onComplete?.()
        } else if (data.status === 'failed' && data.error_message) {
          onError?.(data.error_message)
        }
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err)
      setError(err instanceof Error ? err.message : '获取进度失败')

      // 发生错误时也停止轮询
      setIsPolling(false)
      onError?.(err instanceof Error ? err.message : '获取进度失败')
    }
  }, [kbId, onComplete, onError])

  useEffect(() => {
    if (!isPolling) return

    // 立即获取一次进度
    fetchProgress()

    // 设置轮询 - 使用传入的 pollingInterval
    const interval = setInterval(fetchProgress, pollingInterval)

    return () => {
        clearInterval(interval)
    }
  }, [isPolling, fetchProgress, pollingInterval])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
      case 'uploading':
      case 'parsing':
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '等待开始'
      case 'uploading': return '正在上传'
      case 'parsing': return '正在解析'
      case 'processing': return '正在处理'
      case 'completed': return '处理完成'
      case 'failed': return '处理失败'
      default: return '未知状态'
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}秒`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}分${remainingSeconds}秒`
  }

  if (error) {
    return (
      <Card className={cn("border-red-200 bg-red-50", className)}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">获取进度信息失败</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!progressData) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>正在获取进度信息...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border", className)}>
      <CardContent className="pt-6 space-y-4">
        {/* 状态头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(progressData.status)}
            <span className="font-medium">{getStatusText(progressData.status)}</span>
          </div>
          {progressData.duration && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(progressData.duration)}</span>
            </div>
          )}
        </div>

        {/* 当前处理文件的详细信息 */}
        {progressData.current_file && progressData.status !== 'completed' && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 font-medium text-sm mb-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在处理: {progressData.current_file}
            </div>
            <div className="text-xs text-blue-600">
              进度: {progressData.current_file_index + 1}/{progressData.total_files}
            </div>
          </div>
        )}

        {/* 总体进度 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{progressData.message}</span>
            <span>{progressData.progress_percentage}%</span>
          </div>
          <Progress value={progressData.progress_percentage} className="h-2" />
          <div className="text-xs text-muted-foreground">
            已完成: {progressData.completed_files.length}/{progressData.total_files} 个文件
          </div>
        </div>

        {/* 文件状态概览 */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium text-gray-600">等待处理</div>
            <div className="text-lg font-bold text-gray-700">
              {progressData.pending_files.length}
            </div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-medium text-blue-600">正在处理</div>
            <div className="text-lg font-bold text-blue-700">
              {progressData.processing_files.length}
            </div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-medium text-green-600">已完成</div>
            <div className="text-lg font-bold text-green-700">
              {progressData.completed_files.length}
            </div>
          </div>
        </div>

        {/* 已完成的文件 */}
        {progressData.completed_files.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-green-600">
              已完成 ({progressData.completed_files.length}):
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {progressData.completed_files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="truncate">{file}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 失败的文件 */}
        {progressData.failed_files.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-red-600">
              处理失败 ({progressData.failed_files.length}):
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {progressData.failed_files.map((file, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <XCircle className="h-3 w-3 text-red-500" />
                    <span className="truncate">{file.filename}</span>
                  </div>
                  <div className="ml-5 text-xs text-red-500">
                    {file.error}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 待处理的文件 */}
        {progressData.pending_files.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">
              等待处理 ({progressData.pending_files.length}):
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {progressData.pending_files.slice(0, 5).map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span className="truncate">{file}</span>
                </div>
              ))}
              {progressData.pending_files.length > 5 && (
                <div className="text-xs text-gray-400">
                  还有 {progressData.pending_files.length - 5} 个文件等待处理...
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}