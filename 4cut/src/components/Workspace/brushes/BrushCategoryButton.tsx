import React from 'react';
import '../../../styles/Workspace/brushes/BrushCategoryButton.css';

const BrushCategoryButton = ({ category, selectedCategory, setSelectedCategory }: { category: string, selectedCategory: string, setSelectedCategory: (c: string) => void }) => (
    <button
        className={`category-button ${selectedCategory === category ? 'selected' : ''}`}
        onClick={() => setSelectedCategory(category)}
    >
        {category}
    </button>
);

export default BrushCategoryButton; 