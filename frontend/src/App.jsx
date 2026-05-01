import { useState, useCallback } from 'react';
import BookHeader from './Components/BookHeader.jsx';
import BookFooter from './Components/BookFooter.jsx';
import BookCards from './Components/BookCards.jsx';
import BookSearch from './Components/BookSearch.jsx';

function App() {
    const [searchFilters, setSearchFilters] = useState({
        title: "",
        author: "",
        isbn: ""
    });

    // Incrementing this forces BookCards to re-fetch from API after a new book is added
    const [refreshKey, setRefreshKey] = useState(0);

    const handleBookAdded = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    return (
        <>
            <BookHeader onBookAdded={handleBookAdded} />
            <BookSearch
                searchFilters={searchFilters}
                onSearchChange={setSearchFilters}
            />
            <BookCards
                key={refreshKey}
                searchFilters={searchFilters}
            />
            <BookFooter />
        </>
    );
}

export default App;
