import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { ImageUpload } from './ImageUpload';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface SharedItem {
  type: 'text' | 'url' | 'image';
  content: string;
  title?: string;
  description?: string;
  category: string;
  author: string;
}

interface ShareFormProps {
  categories: Category[];
  onAddItem: (item: Omit<SharedItem, 'id' | 'timestamp'>) => Promise<void>;
  onAddCategory: (category: Omit<Category, 'id'>) => Promise<string | null>;
  user: User;
}

export function ShareForm({ categories, onAddItem, onAddCategory, user }: ShareFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<'text' | 'url' | 'image'>('text');
  const [imageUrl, setImageUrl] = useState('');
  
  // 새 카테고리 추가 관련 상태
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('bg-blue-100 text-blue-800');
  const [previousCategoriesLength, setPreviousCategoriesLength] = useState(categories.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 이미지 타입인 경우 imageUrl이 필요하고, 다른 타입인 경우 content가 필요
    const finalContent = type === 'image' ? imageUrl : content;
    if (!finalContent || !category) return;

    await onAddItem({
      type,
      content: finalContent,
      title: title || undefined,
      description: description || undefined,
      category,
      author: user.email || user.id, // 로그인한 사용자 이메일 또는 ID 사용
    });

    // Reset form
    setTitle('');
    setContent('');
    setDescription('');
    setCategory('');
    setImageUrl('');
  };

  // 새 카테고리가 추가되었을 때 자동으로 선택
  useEffect(() => {
    if (categories.length > previousCategoriesLength) {
      const newCategory = categories[categories.length - 1];
      setCategory(newCategory.id);
      setPreviousCategoriesLength(categories.length);
    }
  }, [categories.length, previousCategoriesLength]);

  const colorOptions = [
    { value: 'bg-blue-100 text-blue-800', label: '파란색', preview: 'bg-blue-100' },
    { value: 'bg-purple-100 text-purple-800', label: '보라색', preview: 'bg-purple-100' },
    { value: 'bg-green-100 text-green-800', label: '녹색', preview: 'bg-green-100' },
    { value: 'bg-yellow-100 text-yellow-800', label: '노란색', preview: 'bg-yellow-100' },
    { value: 'bg-red-100 text-red-800', label: '빨간색', preview: 'bg-red-100' },
    { value: 'bg-pink-100 text-pink-800', label: '분홍색', preview: 'bg-pink-100' },
    { value: 'bg-indigo-100 text-indigo-800', label: '인디고', preview: 'bg-indigo-100' },
    { value: 'bg-orange-100 text-orange-800', label: '주황색', preview: 'bg-orange-100' },
  ];

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      console.log('카테고리 추가 시도:', {
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
        color: newCategoryColor,
      });

      const result = await onAddCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
        color: newCategoryColor,
      });
      
      console.log('카테고리 추가 결과:', result);
      
      if (result) {
        // 모달 닫기 및 폼 리셋
        setShowCategoryModal(false);
        setNewCategoryName('');
        setNewCategoryDescription('');
        setNewCategoryColor('bg-blue-100 text-blue-800');
      } else {
        console.error('카테고리 추가 실패: 결과가 null');
      }
    } catch (error) {
      console.error('카테고리 추가 중 에러:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium mb-1">타입</label>
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value as 'text' | 'url' | 'image')}
          className="w-full p-2 border rounded"
        >
          <option value="text">텍스트</option>
          <option value="url">URL</option>
          <option value="image">이미지</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="제목을 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {type === 'image' ? '이미지' : '내용'}
        </label>
        {type === 'image' ? (
          <ImageUpload
            onUploadComplete={(url) => setImageUrl(url)}
            onRemove={() => setImageUrl('')}
            currentImageUrl={imageUrl}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border rounded h-32"
            placeholder={type === 'url' ? 'URL을 입력하세요' : '내용을 입력하세요'}
            required
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">설명</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="간단한 설명을 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">카테고리</label>
        <div className="flex gap-2">
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 p-2 border rounded"
            required
          >
            <option value="">카테고리를 선택하세요</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              console.log('새 카테고리 버튼 클릭됨');
              setShowCategoryModal(true);
            }}
            className="px-3 py-2 bg-gray-100 text-gray-700 border rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
            title="새 카테고리 추가"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">새 카테고리</span>
          </button>
        </div>
      </div>

      {/* 작성자 필드는 숨김 - 로그인한 사용자 자동 설정 */}
      <div className="hidden">
        <span>작성자: {user.email || '로그인한 사용자'}</span>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        공유하기
      </button>

      {/* 새 카테고리 추가 모달 */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">새 카테고리 추가</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">카테고리 이름 *</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="예: 개발, 마케팅, 취미 등"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">설명 (선택사항)</label>
                <input
                  type="text"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="카테고리에 대한 간단한 설명"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">색상</label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setNewCategoryColor(option.value)}
                      className={`p-2 rounded border text-xs flex items-center justify-center ${
                        newCategoryColor === option.value 
                          ? 'ring-2 ring-blue-500' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded ${option.preview} mr-1`}></div>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('카테고리 추가 버튼 클릭됨');
                    handleAddCategory(e);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
} 