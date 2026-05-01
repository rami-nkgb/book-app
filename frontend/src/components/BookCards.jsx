import { useState, useEffect } from "react";

function BookCards({ searchFilters }) {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch books from Flask API on component mount
    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://127.0.0.1:5000/books");
            if (!response.ok) throw new Error("Failed to fetch books");
            const data = await response.json();
            setBooks(data);
        } catch (err) {
            setError("Could not load books. Make sure the Flask server is running.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (bookId, bookTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${bookTitle}"?`)) return;

        try {
            const response = await fetch(`http://127.0.0.1:5000/books/${bookId}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("Delete failed");
            // Refresh the list after delete
            fetchBooks();
        } catch (err) {
            alert("Failed to delete book. Please try again.");
            console.error(err);
        }
    };

    const handleBorrow = async (bookId, bookTitle) => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/books/${bookId}/borrow`, {
                method: "PUT"
            });
            const data = await response.json();
            if (!response.ok) {
                alert(data.message);
                return;
            }
            alert(`"${bookTitle}" has been borrowed!`);
            fetchBooks(); // Refresh list to show updated status
        } catch (err) {
            alert("Failed to borrow book. Please try again.");
            console.error(err);
        }
    };

    // Filter books based on search inputs passed from parent
    const filteredBooks = books.filter((book) => {
        const titleMatch = !searchFilters?.title ||
            book.book_title.toLowerCase().includes(searchFilters.title.toLowerCase());
        const authorMatch = !searchFilters?.author ||
            book.author_name?.toLowerCase().includes(searchFilters.author.toLowerCase());
        const isbnMatch = !searchFilters?.isbn ||
            book.ISBN?.toLowerCase().includes(searchFilters.isbn.toLowerCase());
        return titleMatch && authorMatch && isbnMatch;
    });

    if (loading) return <p className="status-msg">Loading books...</p>;
    if (error) return <p className="status-msg error-msg">{error}</p>;
    if (filteredBooks.length === 0) return <p className="status-msg">No books found.</p>;

    return (
        <>
            <hr />
            <div className="book-cards-container">
                {filteredBooks.map((book) => (
                    <div
                        className={`book-card ${book.book_status === "borrowed" ? "book-card--borrowed" : ""}`}
                        key={book.book_id}
                    >
                        <div className="book-card-img-container">
                            {book.book_image ? (
                                <img src={book.book_image} alt={`${book.book_title} cover`} />
                            ) : (
                                <div className="book-card-no-img">No Cover</div>
                            )}
                        </div>
                        <h2 className="book-card-title">{book.book_title}</h2>
                        <p className="book-card-author">by {book.author_name}</p>
                        <p className="book-card-details">
                            ISBN: {book.ISBN} &nbsp;|&nbsp; Year: {book.year_published}
                        </p>
                        {book.genre && (
                            <p className="book-card-genre">Genre: {book.genre}</p>
                        )}
                        <span className={`book-status-badge status-${book.book_status}`}>
                            {book.book_status}
                        </span>
                        <div className="button-actions">
                            <button
                                className="bc-action-Borrow"
                                onClick={() => handleBorrow(book.book_id, book.book_title)}
                                disabled={book.book_status !== "available"}
                            >
                                Borrow
                            </button>
                            <button
                                className="bc-action-Delete"
                                onClick={() => handleDelete(book.book_id, book.book_title)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default BookCards;
