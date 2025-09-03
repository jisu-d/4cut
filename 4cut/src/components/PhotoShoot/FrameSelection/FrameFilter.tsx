import { useState } from 'react';
import '../../../styles/PhotoShoot/FrameSelection/FrameFilter.css';

const FILTERS = ['4 X 4', '1 X 4', '2 X 2', '2 X 3'];

export function FrameFilter() {
  const [selectedFilter, setSelectedFilter] = useState('1 X 4');

  return (
    <div className="frame-filter-container">
      <div className="filter-buttons">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            className={`filter-button ${selectedFilter === filter ? 'selected' : ''}`}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
