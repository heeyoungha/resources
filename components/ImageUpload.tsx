'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, Image as ImageIcon, X, Loader2, Settings } from 'lucide-react'
import { uploadImage, UploadImageResult } from '@/lib/storage/images'
import { checkStorageSetup } from '@/lib/storage/check-storage'
import { toast } from 'sonner'

interface ImageUploadProps {
  onUploadComplete: (imageUrl: string) => void
  onRemove?: () => void
  currentImageUrl?: string
  disabled?: boolean
}

export function ImageUpload({ onUploadComplete, onRemove, currentImageUrl, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (file: File) => {
    if (disabled) return

    setIsUploading(true)
    try {
      const result: UploadImageResult = await uploadImage(file)
      
      if (result.success && result.url) {
        onUploadComplete(result.url)
        toast.success('이미지가 성공적으로 업로드되었습니다!')
      } else {
        toast.error(result.error || '이미지 업로드에 실패했습니다.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
    }
  }, [onUploadComplete, disabled])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file)
    } else {
      toast.error('이미지 파일만 업로드 가능합니다.')
    }
  }, [handleFileUpload, disabled])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    }
  }

  const handleCheckStorage = async () => {
    console.log('Storage 설정을 확인합니다...')
    const isSetupCorrect = await checkStorageSetup()
    if (isSetupCorrect) {
      toast.success('Supabase Storage 설정이 올바릅니다!')
    } else {
      toast.error('Supabase Storage 설정을 확인해주세요. 콘솔을 참고하세요.')
    }
  }

  if (currentImageUrl) {
    return (
      <div className="relative inline-block">
        <img
          src={currentImageUrl}
          alt="업로드된 이미지"
          className="max-w-full h-auto rounded-lg border max-h-64"
        />
        {!disabled && onRemove && (
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            type="button"
          >
            <X size={14} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
      
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-gray-50'}
        `}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-sm text-gray-600">이미지 업로드 중...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-gray-400">
              <Upload size={24} />
              <ImageIcon size={24} />
            </div>
            <p className="text-sm text-gray-600">
              클릭하거나 이미지를 드래그해서 업로드하세요
            </p>
            <p className="text-xs text-gray-500">
              JPEG, PNG, GIF, WebP (최대 5MB)
            </p>
            <button
              type="button"
              onClick={handleCheckStorage}
              className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Settings size={12} />
              Storage 설정 확인
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 