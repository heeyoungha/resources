'use client'

import React from 'react';
import { X } from 'lucide-react';
import { ShareForm } from './ShareForm';
import { User } from '@supabase/supabase-js';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  onAddItem: (item: any) => Promise<void>;
  onAddCategory: (category: any) => Promise<string | null>;
  user: User;
}

export function ShareModal({ isOpen, onClose, categories, onAddItem, onAddCategory, user }: ShareModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddItemWrapper = async (item: any) => {
    await onAddItem(item);
    onClose(); // 아이템 추가 후 모달 닫기
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">새 컨텐츠 공유</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          <ShareForm
            categories={categories}
            onAddItem={handleAddItemWrapper}
            onAddCategory={onAddCategory}
            user={user}
          />
        </div>
      </div>
    </div>
  );
} 