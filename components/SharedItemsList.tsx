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

import { useRouter } from 'next/navigation';

interface SharedItemsListProps {
  items: SharedItem[];
  categories: Category[];
  selectedCategory: string;
}

export function SharedItemsList({ items, categories }: SharedItemsListProps) {
  const router = useRouter();
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
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

  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleCopy = async (item: SharedItem, e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 onClick 이벤트 차단
    
    // 상세 페이지 URL 생성
    const pageUrl = `${window.location.origin}/item/${item.id}`;
    
    try {
      await navigator.clipboard.writeText(pageUrl);
      // 간단한 피드백 (toast 없이)
      const button = e.target as HTMLElement;
      const originalText = button.textContent;
      button.textContent = '링크 복사됨!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 1500);
    } catch (err) {
      console.error('링크 복사 실패:', err);
    }
  };

  // URL과 설명을 구분해서 표시하는 함수
  const renderUrlContent = (item: SharedItem) => {
    if (item.type !== 'url') return null;
    
    return (
      <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
        <a 
          href={item.content} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline break-all"
          title={item.content}
          onClick={(e) => e.stopPropagation()}
        >
          {truncateContent(item.content)}
        </a>
        {item.description && (
          <span className="text-gray-600 text-xs">
            {renderTextWithLinks(item.description, 100)}
          </span>
        )}
      </div>
    );
  };

  // 텍스트에서 URL을 자동으로 링크로 변환하는 함수
  const renderTextWithLinks = (text: string, maxLength: number = 100) => {
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    const parts = truncatedText.split(urlRegex);
    
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
                onClick={(e) => e.stopPropagation()}
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

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div 
          key={item.id} 
          onClick={() => router.push(`/item/${item.id}`)}
          className="bg-white px-4 py-3 rounded-lg shadow-sm border hover:shadow-md hover:bg-gray-50 transition-all duration-200 cursor-pointer"
        >
          {/* 첫 번째 줄: 카테고리, 타입, 제목, 복사 버튼 */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(item.category)}`}>
              {getCategoryName(item.category)}
            </span>
            <span className="text-sm">{getTypeIcon(item.type)}</span>
            <h3 className="font-medium text-sm flex-1 truncate">{item.title || '제목 없음'}</h3>
            <button
              onClick={(e) => handleCopy(item, e)}
              className="text-xs px-2 py-1 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
              title="페이지 링크 복사"
            >
              🔗 링크
            </button>
            <span className="text-xs text-gray-400 whitespace-nowrap">클릭하여 페이지 보기</span>
          </div>
          
          {/* 두 번째 줄: 컨텐츠 */}
          <div className="text-sm text-gray-600">
            {item.type === 'url' ? (
              renderUrlContent(item)
            ) : item.type === 'image' ? (
              <div className="flex items-center gap-2">
                <img 
                  src={item.content} 
                  alt={item.title || '이미지'} 
                  className="w-8 h-8 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
                  <span className="text-gray-500 italic">이미지</span>
                  {item.description && (
                    <span className="text-xs text-gray-500">
                      {renderTextWithLinks(item.description, 60)}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                <span title={item.content}>
                  {renderTextWithLinks(item.content.replace(/\n/g, ' '))}
                </span>
                {item.description && (
                  <span className="text-xs text-gray-500">
                    {renderTextWithLinks(item.description, 100)}
                  </span>
                )}
              </div>
            )}
            <div className="text-xs text-gray-400 mt-1">by {item.author}</div>
          </div>
        </div>
      ))}
      
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          공유된 항목이 없습니다.
        </div>
      )}
    </div>
  );
} 