"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Check, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface KnowledgeUploadProps {
  onUpload?: (file: File) => Promise<void>
  acceptedFileTypes?: string
  maxFileSizeMB?: number
}

export function KnowledgeUpload({
  onUpload,
  acceptedFileTypes = ".pdf,.txt,.docx,.csv",
  maxFileSizeMB = 10
}: KnowledgeUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setIsSuccess(false)

    if (!selectedFile) return

    // Check file size
    if (selectedFile.size > maxFileSizeMB * 1024 * 1024) {
      setError(`文件大小超过 ${maxFileSizeMB}MB 限制`)
      return
    }

    // Check file type
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || ''
    const acceptedExtensions = acceptedFileTypes
      .split(',')
      .map(type => type.trim().replace('.', '').toLowerCase())

    if (!acceptedExtensions.includes(fileExtension)) {
      setError(`不支持 .${fileExtension} 文件类型。请使用: ${acceptedFileTypes}`)
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file || !onUpload) return

    try {
      setIsUploading(true)
      setError(null)
      await onUpload(file)
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败")
      setIsSuccess(false)
    } finally {
      setIsUploading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
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
          className={cn(
            "flex-1",
            error ? "border-red-500" : "",
            isSuccess ? "border-green-500" : ""
          )}
          disabled={isUploading}
        />
        {isSuccess ? (
          <Button
            onClick={resetUpload}
            variant="outline"
            className="whitespace-nowrap"
          >
            上传另一个文件
          </Button>
        ) : (
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
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
                上传
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

      {file && !error && !isSuccess && (
        <p className="text-sm text-muted-foreground">
          准备上传: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}MB)
        </p>
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