import { useState } from "react";
import AddBookModal from "./AddBookModal";

function BookHeader({ onBookAdded, onLogout }) {
    const [showModal, setShowModal] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("username")
        onLogout()
    }

    return (
        <header>
            <h1 className="Book-Header">Personal Book Archive Website</h1>
            <div className="header-buttons">
                <button className="add-book" onClick={() => setShowModal(true)}>Add Book</button>
                {showModal && (
                    <AddBookModal
                        onClose={() => setShowModal(false)}
                        onBookAdded={() => {
                            setShowModal(false);
                            onBookAdded(); // Trigger refresh in App
                        }}
                    />
                )}
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
}

export default BookHeader;
