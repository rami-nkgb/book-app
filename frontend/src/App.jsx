import { useState, useCallback } from "react";

import BookHeader from "./components/BookHeader.jsx";
import BookFooter from "./components/BookFooter.jsx";
import BookCards from "./components/BookCards.jsx";
import BookSearch from "./components/BookSearch.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";

function App() {

    //Signup
    const [showSignup,setShowSignup] = useState(false)

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
        if (showSignup) {

            return (
                <Signup
                    onSignupSuccess={setLoggedInUser}
                    onShowLogin={() => setShowSignup(false)}
                />
            )
        }

        return (
            <Login
                onLoginSuccess={setLoggedInUser}
                onShowSignup={() => setShowSignup(true)}
            />
        )
    }
    // SHOW HOME PAGE
    return (
        <>

            <BookHeader
                onBookAdded={handleBookAdded}
                onLogout={handleLogout}
            />

            <div className="welcome-msg">
                Hello {loggedInUser}, Welcome to Personal Book Archive Page - a simple place to explore and manage your
                favorite books. Browse the collection by title, author, or genre, and discover new
                reads anytime.
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