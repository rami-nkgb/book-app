import { useState } from "react";
import AddBookModal from "./AddBookModal";

function BookHeader({ onBookAdded }) {
    const [showModal, setShowModal] = useState(false);

    return (
        <header>
            <h1 className="Book-Header">Personal Book Archive Website</h1>
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
            <nav>
                <p className="welcome-msg">
                    Welcome to Personal Book Archive Page - a simple place to explore and manage your
                    favorite books. Browse the collection by title, author, or genre, and discover new
                    reads anytime. Create an account to unlock full features, including borrowing or
                    purchasing books, tracking your activity, and building your own personalized library.
                </p>
            </nav>
            <hr />
        </header>
    );
}

export default BookHeader;
