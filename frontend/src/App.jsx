import { useState, useCallback } from "react";

import BookHeader from "./Components/BookHeader.jsx";
import BookFooter from "./Components/BookFooter.jsx";
import BookCards from "./Components/BookCards.jsx";
import BookSearch from "./Components/BookSearch.jsx";
import Login from "./Components/Login.jsx";

function App() {

    // Logged in user
    const [loggedInUser, setLoggedInUser] = useState(
        localStorage.getItem("username")
    );

    // Search filters
    const [searchFilters, setSearchFilters] = useState({
        title: "",
        author: "",
        isbn: ""
    });

    // Force BookCards refresh
    const [refreshKey, setRefreshKey] = useState(0);

    const handleBookAdded = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    // Logout function
    const handleLogout = () => {

        localStorage.removeItem("username");

        setLoggedInUser(null);
    };

    // SHOW LOGIN PAGE
    if (!loggedInUser) {

        return (
            <Login
                onLoginSuccess={setLoggedInUser}
            />
        );
    }

    // SHOW HOME PAGE
    return (
        <>

            <BookHeader
                onBookAdded={handleBookAdded}
            />

            <div className="welcome-msg">

                Welcome, {loggedInUser}

                <button
                    className="cancel-btn"
                    style={{ marginLeft: "15px" }}
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

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