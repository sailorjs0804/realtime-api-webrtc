"use client"

import React, {useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {KnowledgeUpload} from "@/components/knowledge-upload"
import {UploadProgress} from "@/components/upload-progress"
import {motion} from "framer-motion"
import {toast} from "sonner"
import {Book} from "lucide-react"

interface UploadedFile {
    name: string;
    timestamp: string;
    id?: string;
}

export function KnowledgeBaseSection() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [currentKbId, setCurrentKbId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpload = async (files: File[]) => {
        try {
            setIsProcessing(true);
            setCurrentKbId(null);

            const formData = new FormData();

            // 添加所有文件到 FormData
            files.forEach(file => {
                formData.append('files', file);
            });

            // 使用 Next.js API 路由，避免 CORS 问题
            const response = await fetch('/api/v1/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || `Upload failed with status ${response.status}`);
            }

            const result = await response.json();

            // 保存 kb_id 到 localStorage
            if (result.kb_id) {
                localStorage.setItem('kb_id', result.kb_id);
                console.log('Saved kb_id to localStorage:', result.kb_id);

                // 设置当前 kb_id 以启动进度跟踪
                setCurrentKbId(result.kb_id);
            }

            toast.success(`${files.length} 个文件上传成功，正在后台处理...`);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : '上传失败');
            setIsProcessing(false);
            throw error;
        }
    };

    const handleProcessingComplete = () => {
        setIsProcessing(false);
        setCurrentKbId(null);

        // 添加文件到已上传列表
        const newFile: UploadedFile = {
            name: "处理完成的文件",
            timestamp: new Date().toISOString(),
            id: currentKbId || undefined
        };

        setUploadedFiles(prev => [...prev, newFile]);
        toast.success('知识库更新成功！');
    };

    const handleProcessingError = (error: string) => {
        setIsProcessing(false);
        setCurrentKbId(null);
        toast.error(`处理失败: ${error}`);
    };

    return (
        <motion.div
            className="w-full max-w-md mb-6"
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.3, duration: 0.4}}
        >
            <Card className="border shadow-sm bg-card text-card-foreground rounded-xl">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Book className="h-5 w-5"/>
                        上传知识库文件
                    </CardTitle>
                    <CardDescription>
                        上传文件知识以增强智能助手的私域知识。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <KnowledgeUpload onUpload={handleUpload} disabled={isProcessing}/>

                    {/* 显示实时进度 */}
                    {currentKbId && isProcessing && (
                        <div className="mt-4">
                            <UploadProgress
                                kbId={currentKbId}
                                onComplete={handleProcessingComplete}
                                onError={handleProcessingError}
                                pollingInterval={5000}
                            />
                        </div>
                    )}

                    {uploadedFiles.length > 0 && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                            <p className="text-sm">
                                <span
                                    className="font-medium">{uploadedFiles.length}</span> {uploadedFiles.length === 1 ? 'file' : 'files'} added
                                to knowledge base
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                智能助手将会使用这些信息来回答您的问题。
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}