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

interface SharedItemsListProps {
  items: SharedItem[];
  categories: Category[];
  selectedCategory: string;
  onItemClick: (item: SharedItem) => void;
}

export function SharedItemsList({ items, categories, onItemClick }: SharedItemsListProps) {
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

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div 
          key={item.id} 
          onClick={() => onItemClick(item)}
          className="bg-white px-4 py-3 rounded-lg shadow-sm border hover:shadow-md hover:bg-gray-50 transition-all duration-200 cursor-pointer"
        >
          {/* 첫 번째 줄: 카테고리, 타입, 제목 */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(item.category)}`}>
              {getCategoryName(item.category)}
            </span>
            <span className="text-sm">{getTypeIcon(item.type)}</span>
            <h3 className="font-medium text-sm flex-1 truncate">{item.title || '제목 없음'}</h3>
            <span className="text-xs text-gray-400 whitespace-nowrap">클릭하여 상세보기</span>
          </div>
          
          {/* 두 번째 줄: 컨텐츠 (한 줄로 제한) */}
          <div className="text-sm text-gray-600 truncate">
            {item.type === 'url' ? (
              <a 
                href={item.content} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
                title={item.content}
              >
                {truncateContent(item.content)}
              </a>
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
                <span className="text-gray-500 italic">이미지</span>
              </div>
            ) : (
              <span title={item.content}>
                {truncateContent(item.content.replace(/\n/g, ' '))}
              </span>
            )}
            <span className="text-xs text-gray-400 ml-2">by {item.author}</span>
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