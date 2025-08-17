'use client'

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSharedItems, getCategories } from '@/lib/database/queries';
import { SharedItem } from '@/lib/types/shared';
import { X, ArrowLeft, Copy } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
}

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  
  const [item, setItem] = useState<SharedItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItemAndCategories();
  }, [itemId]);

  const loadItemAndCategories = async () => {
    try {
      setLoading(true);
      
      // 카테고리와 아이템 데이터를 병렬로 로드
      const [itemsData, categoriesData] = await Promise.all([
        getSharedItems(),
        getCategories()
      ]);

      // 특정 아이템 찾기
      const foundItem = itemsData?.find(item => item.id === itemId);
      
      if (!foundItem) {
        setError('해당 컨텐츠를 찾을 수 없습니다.');
        return;
      }

      // SharedItem 타입에 맞게 변환
      const convertedItem: SharedItem = {
        id: foundItem.id,
        type: foundItem.type,
        content: foundItem.content,
        title: foundItem.title || undefined,
        description: foundItem.description || undefined,
        category: foundItem.category_id || '',
        author: foundItem.author_name || foundItem.author_email || 'Unknown',
        timestamp: new Date(foundItem.created_at)
      };

      // Category 타입에 맞게 변환
      const convertedCategories: Category[] = (categoriesData || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || undefined,
        color: cat.color
      }));

      setItem(convertedItem);
      setCategories(convertedCategories);
    } catch (err) {
      console.error('데이터 로드 오류:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    } catch (err) {
      console.error('링크 복사 실패:', err);
    }
  };

  const handleCopyContent = async () => {
    if (!item) return;
    
    let copyText = '';
    if (item.title) {
      copyText += `${item.title}\n`;
    }
    
    if (item.type === 'url') {
      copyText += item.content;
      if (item.description) {
        copyText += `\n\n${item.description}`;
      }
    } else {
      copyText += item.content;
      if (item.description) {
        copyText += `\n\n${item.description}`;
      }
    }
    
    try {
      await navigator.clipboard.writeText(copyText);
      alert('내용이 복사되었습니다!');
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  // 텍스트에서 URL을 자동으로 링크로 변환하는 함수
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return (
      <>
        {parts.map((part, index) => {
          if (urlRegex.test(part)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-all"
              >
                {part}
              </a>
            );
          }
          return part;
        })}
      </>
    );
  };

  const formatFullDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">컨텐츠를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={20} />
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>홈으로 돌아가기</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="링크 복사"
              >
                <Copy size={16} />
                링크 복사
              </button>
              <button
                onClick={handleCopyContent}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors"
                title="내용 복사"
              >
                📋 내용 복사
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* 헤더 정보 */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${getCategoryColor(item.category)}`}>
                {getCategoryName(item.category)}
              </span>
              <span className="text-lg">{getTypeIcon(item.type)}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {item.title || '제목 없음'}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>작성자: {item.author}</span>
              <span>•</span>
              <span>{formatFullDate(item.timestamp)}</span>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="p-6 space-y-6">
            {/* 내용 (모든 타입 통일) */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">내용</label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {renderTextWithLinks(item.content)}
                </div>
              </div>
            </div>

            {/* 설명 */}
            {item.description && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">설명</label>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {renderTextWithLinks(item.description)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 