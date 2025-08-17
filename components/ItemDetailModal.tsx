'use client'

import React from 'react';
import { X } from 'lucide-react';

interface SharedItem {
  id: string;
  type: 'text' | 'url' | 'image';
  content: string;
  title?: string;
  description?: string;
  category: string;
  author: string;
  timestamp: Date;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface ItemDetailModalProps {
  item: SharedItem | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailModal({ item, categories, isOpen, onClose }: ItemDetailModalProps) {
  if (!isOpen || !item) return null;

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || '알 수 없음';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.color || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'url': return '🔗';
      case 'image': return '🖼️';
      case 'text': return '📝';
      default: return '📄';
    }
  };

  const formatFullDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'long'
    }).format(date);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-start p-6 border-b">
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${getCategoryColor(item.category)}`}>
              {getCategoryName(item.category)}
            </span>
            <span className="text-lg">{getTypeIcon(item.type)}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">제목</label>
            <h1 className="text-xl font-semibold text-gray-900">
              {item.title || '제목 없음'}
            </h1>
          </div>

          {/* 설명 */}
          {item.description && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">설명</label>
              <p className="text-gray-700 leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {/* 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">내용</label>
            <div className="border rounded-lg p-4 bg-gray-50">
              {item.type === 'url' ? (
                <a 
                  href={item.content} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline break-all"
                >
                  {item.content}
                </a>
              ) : item.type === 'image' ? (
                <div className="space-y-3">
                  <img 
                    src={item.content} 
                    alt={item.title || '이미지'} 
                    className="max-w-full h-auto rounded-lg"
                  />
                  <p className="text-sm text-gray-500 break-all">{item.content}</p>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 leading-relaxed">
                  {item.content}
                </pre>
              )}
            </div>
          </div>

          {/* 메타 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">작성자</label>
              <p className="text-gray-700">{item.author}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">생성일시</label>
              <p className="text-gray-700">{formatFullDate(item.timestamp)}</p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
} 