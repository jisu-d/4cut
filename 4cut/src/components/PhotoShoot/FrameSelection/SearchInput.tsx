import "../../../styles/PhotoShoot/FrameSelection/SearchInput.css";
import SearchIcon from '../../../assets/Icon/search_white.svg?react';

function SearchInput() {
    return (
        <div className="search-container">
            <input type="text" placeholder="search frame..." className="search-input" />
            <button className="search-button">
                <SearchIcon />
            </button>
        </div>
    );
}

export default SearchInput;
