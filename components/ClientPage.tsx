'use client'

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { getCategories, getSharedItems, createCategory, createSharedItem, ensureUserProfile } from '@/lib/database/queries';
import { convertDBCategoryToUI, convertDBItemToUI } from '@/lib/types/shared';
import { CategoryList } from '@/components/CategoryList';
import { ShareForm } from '@/components/ShareForm';
import { ShareModal } from '@/components/ShareModal';
import { SharedItemsList } from '@/components/SharedItemsList';
import { AuthButton } from '@/components/AuthButton';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { ItemDetailModal } from '@/components/ItemDetailModal';
import { Plus, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';

// 공통 타입은 lib/types/shared.ts에서 import

const defaultCategories: any[] = [
  { id: '1', name: '기술', description: '개발, 프로그래밍, IT 관련', color: 'bg-blue-100 text-blue-800' },
  { id: '2', name: '디자인', description: 'UI/UX, 그래픽 디자인', color: 'bg-purple-100 text-purple-800' },
  { id: '3', name: '비즈니스', description: '창업, 마케팅, 경영', color: 'bg-green-100 text-green-800' },
  { id: '4', name: '라이프스타일', description: '취미, 여행, 건강', color: 'bg-yellow-100 text-yellow-800' },
  { id: '5', name: '교육', description: '학습 자료, 강의, 책', color: 'bg-red-100 text-red-800' },
];

// 예시 데이터
const sampleItems: any[] = [
  {
    id: '1',
    type: 'url',
    content: 'https://react.dev',
    title: 'React 공식 문서',
    description: '새로운 React 공식 문서가 정말 잘 되어있어요. 특히 훅 부분이 이해하기 쉽게 설명되어 있습니다.',
    category: '1',
    author: '김개발',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
  },
  {
    id: '2',
    type: 'text',
    content: `오늘 팀 회의에서 나온 중요한 포인트들:

1. 사용자 피드백 반영 우선순위
   - 검색 기능 개선이 가장 시급
   - 모바일 반응형 디자인 보완 필요
   
2. 다음 스프린트 계획
   - API 성능 최적화
   - 새로운 기능 A/B 테스트 준비

3. 기술 부채 정리
   - 레거시 코드 리팩토링 일정 잡기
   - 테스트 커버리지 80% 목표

회의록은 별도로 공유드릴 예정입니다!`,
    title: '팀 회의 요약',
    description: '이번 주 팀 회의에서 논의된 주요 사항들을 정리했습니다.',
    category: '3',
    author: '박팀장',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
  },
  {
    id: '3',
    type: 'image',
    content: 'https://images.unsplash.com/photo-1653564142048-d5af2cf9b50f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGluZyUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NTUzNTYwNDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    title: '개발자 워크스페이스 셋업',
    description: '집중도 높은 개발 환경을 만들기 위한 워크스페이스 예시입니다.',
    category: '1',
    author: '이코더',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4시간 전
  },
  {
    id: '4',
    type: 'url',
    content: 'https://www.figma.com/design-systems',
    title: 'Figma 디자인 시스템 가이드',
    description: '디자인 시스템 구축할 때 참고하면 좋을 것 같아요.',
    category: '2',
    author: '최디자이너',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6시간 전
  },
  {
    id: '5',
    type: 'text',
    content: '📚 이번 달 추천 도서\n\n1. "클린 코드" - 로버트 마틴\n   → 코드 품질 향상에 정말 도움됨\n\n2. "사용자 스토리 맵핑" - 제프 패튼\n   → 제품 기획할 때 필수\n\n3. "린 스타트업" - 에릭 리스\n   → 빠른 실험과 검증 방법론\n\n다들 시간 날 때 한 번씩 읽어보세요!',
    title: '개발팀 추천 도서',
    category: '5',
    author: '정멘토',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12시간 전
  },
];

// ✅ 커스텀 훅: 카테고리별 아이템 수 계산
function useItemCounts(items: any[]) {
  return useMemo(() => {
    return items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [items]);
}

// ✅ 커스텀 훅: 필터링된 아이템
function useFilteredItems(items: any[], selectedCategory: string) {
  return useMemo(() => {
    if (selectedCategory === 'all') {
      return items;
    }
    return items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);
}

interface ClientPageProps {
  user: User | null;
}

export function ClientPage({ user: initialUser }: ClientPageProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [sharedItems, setSharedItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser); // 초기 사용자가 있으면 로딩 false
  const [dataLoading, setDataLoading] = useState(true);
  const loadDataCalled = useRef(false);

  // 클라이언트에서 세션 상태 확인
  useEffect(() => {
    const supabase = createClient();
    
    // 현재 세션 가져오기
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (event !== 'TOKEN_REFRESHED') {
          setLoading(false);
        }
      }
    );

    getSession();

    return () => subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      // 사용자 프로필 확인/생성
      await ensureUserProfile();
      
      // 카테고리와 공유 아이템 로딩
      const [categoriesData, itemsData] = await Promise.all([
        getCategories(),
        getSharedItems()
      ]);
      
      console.log('데이터베이스에서 로딩된 카테고리:', categoriesData);
      console.log('데이터베이스에서 로딩된 아이템:', itemsData);
      
      // 데이터베이스 타입을 UI 타입으로 변환
      const convertedCategories = categoriesData.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        color: cat.color,
        created_by: cat.created_by,
        created_at: cat.created_at,
        updated_at: cat.updated_at
      }));

      const convertedItems = itemsData.map((item: any) => ({
        id: item.id,
        type: item.type,
        content: item.content,
        title: item.title,
        description: item.description,
        category: item.category_id || '',
        author: item.author_name || item.author_email || 'Unknown',
        timestamp: new Date(item.created_at),
        created_at: item.created_at,
        updated_at: item.updated_at,
        category_name: item.category_name,
        category_color: item.category_color,
        category_id: item.category_id,
        author_name: item.author_name,
        author_email: item.author_email,
        author_id: item.author_id
      }));
      
      setCategories(convertedCategories);
      setSharedItems(convertedItems);
      console.log('실제 데이터 로딩 완료');
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // 데이터 로딩 useEffect
  useEffect(() => {
    // ===== TEMP: 로그인 없이도 데이터 로딩 허용 =====
    // TODO: 인증 문제 해결 후 user 체크를 다시 활성화
    // if (user && !loadDataCalled.current) {
    if (!loadDataCalled.current) {
      loadDataCalled.current = true;
      // 로그인하지 않은 경우 샘플 데이터 사용
      if (!user) {
        setCategories(defaultCategories);
        setSharedItems(sampleItems);
        setDataLoading(false);
      } else {
        loadData();
      }
    }
  }, [user, loadData]);

  // ✅ 성능 최적화: useMemo로 비싼 계산 캐싱 (Hook은 항상 같은 순서로 호출되어야 함)
  const itemCounts = useItemCounts(sharedItems);
  const filteredItems = useFilteredItems(sharedItems, selectedCategory);



  // 쿠키 정리 함수
  const clearAllCookies = () => {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
    }
    window.location.reload();
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // ===== TEMP: 인증 오류 해결을 위한 임시 비활성화 =====
  // TODO: 인증 문제 해결 후 아래 주석을 해제하여 로그인 화면 복원
  /*
  // 로그인하지 않은 경우 로그인 화면 표시
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              로그인이 필요합니다
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              컨텐츠 공유 서비스를 이용하려면 로그인해주세요
            </p>
          </div>
          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  이메일 주소로 간편하게 로그인하세요
                </p>
              </div>
              <AuthButton user={user} />
              
              <div className="pt-4 border-t space-y-2">
                <p className="text-xs text-gray-500 mb-2 text-center">
                  로그인에 문제가 있나요?
                </p>
                <button
                  onClick={() => {
                    console.log('🍪 Current cookies:', document.cookie);
                    const supabase = createClient();
                    supabase.auth.getSession().then(({ data }) => {
                      console.log('🔍 Current session:', data);
                    });
                  }}
                  className="w-full text-xs text-blue-600 hover:text-blue-800 underline mb-2"
                >
                  쿠키 상태 확인 (콘솔 체크)
                </button>
                <button
                  onClick={clearAllCookies}
                  className="w-full text-xs text-red-600 hover:text-red-800 underline"
                >
                  쿠키 정리 후 다시 시도
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  */

  // ✅ 성능 최적화: useCallback으로 함수 레퍼런스 안정화
  const handleAddItem = useCallback(async (item: any) => {
    try {
      console.log('ClientPage - 아이템 생성 요청:', item);
      
      const result = await createSharedItem({
        title: item.title || null,
        content: item.content,
        description: item.description || null,
        type: item.type,
        category_id: item.category || null
      });

      console.log('ClientPage - 아이템 생성 결과:', result);

      if (result) {
        // 성공 시 데이터 다시 로딩
        await loadData();
        console.log('ClientPage - 아이템 추가 완료');
      }
    } catch (error) {
      console.error('ClientPage - 아이템 추가 에러:', error);
    }
  }, []);

  const handleAddCategory = useCallback(async (category: any) => {
    try {
      console.log('ClientPage - 카테고리 생성 요청:', category);
      
      const result = await createCategory({
        name: category.name,
        description: category.description || null,
        color: category.color
      });

      console.log('ClientPage - 카테고리 생성 결과:', result);

      if (result) {
        // 성공 시 카테고리만 다시 로딩 (전체 데이터 로딩은 하지 않음)
        const categoriesData = await getCategories();
        console.log('ClientPage - 새로 로딩된 카테고리들:', categoriesData);
        
        const convertedCategories = categoriesData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          color: cat.color,
          created_by: cat.created_by,
          created_at: cat.created_at,
          updated_at: cat.updated_at
        }));
        setCategories(convertedCategories);
        return result.id; // 새로 생성된 ID 반환
      }
    } catch (error) {
      console.error('ClientPage - 카테고리 추가 에러:', error);
    }
    return null;
  }, []);

  const handleSelectCategory = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleToggleShareModal = useCallback(() => {
    console.log('+ 공유하기 버튼 클릭됨, 현재 showShareModal:', showShareModal);
    setShowShareModal(prev => !prev);
  }, [showShareModal]);

  const handleItemClick = useCallback((item: any) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
  }, []);

  const handleCloseItemModal = useCallback(() => {
    setIsItemModalOpen(false);
    setSelectedItem(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {/* 환영 메시지 */}
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            👋 안녕하세요 <span className="font-bold">{user?.email || '게스트'}</span>님! 
            컨텐츠 공유 서비스에 오신 것을 환영합니다.
            {!user && (
              <span className="text-sm block mt-1 text-green-600">
                현재 게스트 모드로 이용 중입니다. 로그인하시면 더 많은 기능을 사용하실 수 있습니다.
              </span>
            )}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>컨텐츠 공유</CardTitle>
                <CardDescription>
                  관심사별로 유용한 링크와 자료를 공유하고 히스토리를 관리하세요
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {user ? (
                  <ProfileDropdown user={user} />
                ) : (
                  <div className="text-sm">
                    <AuthButton user={user} />
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

                <div className="space-y-3">
                    {/* 헤더 영역 */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">공유된 컨텐츠</h2>
            <button
              onClick={() => {
                if (!user) {
                  alert('로그인이 필요한 기능입니다. 게스트 모드에서는 컨텐츠를 보기만 할 수 있습니다.');
                  return;
                }
                handleToggleShareModal();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                user 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Plus size={16} />
              공유하기
            </button>
          </div>

          {/* 카테고리 목록 */}
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onAddCategory={handleAddCategory}
            itemCounts={itemCounts}
          />
          
          {/* 공유된 아이템 목록 */}
          <div className="max-h-[70vh] overflow-y-auto">
            <SharedItemsList
              items={filteredItems}
              categories={categories}
              selectedCategory={selectedCategory}
              onItemClick={handleItemClick}
            />
          </div>
        </div>
      </div>
      <Toaster />
      
              {/* 상세 보기 모달 */}
        <ItemDetailModal
          item={selectedItem}
          categories={categories}
          isOpen={isItemModalOpen}
          onClose={handleCloseItemModal}
        />
        
        {/* 공유 모달 */}
        {user && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            categories={categories}
            onAddItem={handleAddItem}
            onAddCategory={handleAddCategory}
            user={user}
          />
        )}
    </div>
  );
} 