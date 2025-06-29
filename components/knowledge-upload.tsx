"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Check, Loader2, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface KnowledgeUploadProps {
  onUpload?: (files: File[]) => Promise<void>
  acceptedFileTypes?: string
  maxFileSizeMB?: number
  disabled?: boolean
}

export function KnowledgeUpload({
  onUpload,
  acceptedFileTypes = ".pdf,.txt,.docx,.csv, .md",
  maxFileSizeMB = 10,
  disabled = false
}: KnowledgeUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setError(null)
    setIsSuccess(false)

    if (selectedFiles.length === 0) return

    // 验证所有文件
    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of selectedFiles) {
      // Check file size
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        errors.push(`${file.name}: 文件大小超过 ${maxFileSizeMB}MB 限制`)
        continue
      }

      // Check file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
      const acceptedExtensions = acceptedFileTypes
        .split(',')
        .map(type => type.trim().replace('.', '').toLowerCase())

      if (!acceptedExtensions.includes(fileExtension)) {
        errors.push(`${file.name}: 不支持 .${fileExtension} 文件类型`)
        continue
      }

      validFiles.push(file)
    }

    if (errors.length > 0) {
      setError(errors.join('; '))
      return
    }

    setFiles(validFiles)
  }

  const handleUpload = async () => {
    if (files.length === 0 || !onUpload) return

    try {
      setIsUploading(true)
      setError(null)
      await onUpload(files)
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败")
      setIsSuccess(false)
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const resetUpload = () => {
    setFiles([])
    setError(null)
    setIsSuccess(false)
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2">
        <Input
          type="file"
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          multiple
          className={cn(
            "flex-1",
            error ? "border-red-500" : "",
            isSuccess ? "border-green-500" : ""
          )}
          disabled={isUploading || disabled}
        />
        {isSuccess ? (
          <Button
            onClick={resetUpload}
            variant="outline"
            className="whitespace-nowrap"
            disabled={disabled}
          >
            上传更多文件
          </Button>
        ) : (
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading || disabled}
            className="whitespace-nowrap"
            variant="default"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                上传中...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                上传 {files.length > 0 ? `(${files.length})` : ''}
              </>
            )}
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      {files.length > 0 && !error && !isSuccess && (
        <div className="space-y-2">
          <p className="text-sm font-medium">已选择 {files.length} 个文件:</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                <span className="flex-1 truncate">
                  {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}MB)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0"
                  disabled={isUploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isSuccess && (
        <p className="text-sm text-green-500 flex items-center gap-2">
          <Check className="h-4 w-4" />
          文件上传成功！
        </p>
      )}
    </div>
  )
}