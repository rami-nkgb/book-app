function BookSearch({ searchFilters, onSearchChange }) {
    return (
        <div className="book-search-container">
            <div className="search-group">
                <label>Title</label>
                <input
                    type="text"
                    placeholder="e.g. Harry Potter..."
                    className="book-search-title"
                    value={searchFilters.title}
                    onChange={(e) => onSearchChange({ ...searchFilters, title: e.target.value })}
                />
            </div>
            <div className="search-group">
                <label>Author Name</label>
                <input
                    type="text"
                    placeholder="e.g. J.K. Rowling..."
                    className="book-search-author"
                    value={searchFilters.author}
                    onChange={(e) => onSearchChange({ ...searchFilters, author: e.target.value })}
                />
            </div>
            <div className="search-group">
                <label>ISBN</label>
                <input
                    type="text"
                    placeholder="e.g. 978..."
                    className="book-search-isbn"
                    value={searchFilters.isbn}
                    onChange={(e) => onSearchChange({ ...searchFilters, isbn: e.target.value })}
                />
            </div>
        </div>
    );
}

export default BookSearch;
