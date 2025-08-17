interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
}

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  itemCounts: Record<string, number>;
}

export function CategoryList({ 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  onAddCategory, 
  itemCounts 
}: CategoryListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-3 py-1 rounded-full text-sm ${
          selectedCategory === 'all' 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-700'
        }`}
      >
        전체 ({Object.values(itemCounts).reduce((a, b) => a + b, 0)})
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedCategory === category.id 
              ? 'bg-blue-500 text-white' 
              : category.color
          }`}
        >
          {category.name} ({itemCounts[category.id] || 0})
        </button>
      ))}
    </div>
  );
} 