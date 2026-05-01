import { useState } from "react";

function AddBookModal({ onClose, onBookAdded }) {
    const [formData, setFormData] = useState({
        book_title: "",
        author_name: "",
        ISBN: "",
        year_published: "",
        genre: "",
        language: "",
        page_count: "",
        book_image: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Basic validation
        if (!formData.book_title || !formData.author_name || !formData.ISBN) {
            setError("Book Title, Author, and ISBN are required.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://127.0.0.1:5000/books", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    year_published: formData.year_published ? parseInt(formData.year_published) : null,
                    page_count: formData.page_count ? parseInt(formData.page_count) : null
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Failed to add book");
            }

            onBookAdded(); // Tell parent to refresh the book list
            onClose();
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="close-btn" onClick={onClose}>X</button>
                <h2>Add New Book</h2>

                {error && <p className="modal-error">{error}</p>}

                <form className="modal-form" onSubmit={handleSubmit}>
                    <label>Book Title *</label>
                    <input
                        type="text"
                        name="book_title"
                        placeholder="Book Title"
                        value={formData.book_title}
                        onChange={handleChange}
                    />

                    <label>Author *</label>
                    <input
                        type="text"
                        name="author_name"
                        placeholder="Author Name"
                        value={formData.author_name}
                        onChange={handleChange}
                    />

                    <label>ISBN *</label>
                    <input
                        type="text"
                        name="ISBN"
                        placeholder="e.g. 9780439554930"
                        value={formData.ISBN}
                        onChange={handleChange}
                    />

                    <label>Published Year</label>
                    <input
                        type="number"
                        name="year_published"
                        placeholder="e.g. 2024"
                        value={formData.year_published}
                        onChange={handleChange}
                    />

                    <label>Genre</label>
                    <input
                        type="text"
                        name="genre"
                        placeholder="e.g. Fiction"
                        value={formData.genre}
                        onChange={handleChange}
                    />

                    <label>Language</label>
                    <input
                        type="text"
                        name="language"
                        placeholder="e.g. English"
                        value={formData.language}
                        onChange={handleChange}
                    />

                    <label>Page Count</label>
                    <input
                        type="number"
                        name="page_count"
                        placeholder="e.g. 320"
                        value={formData.page_count}
                        onChange={handleChange}
                    />

                    <label>Book Cover Image URL</label>
                    <input
                        type="text"
                        name="book_image"
                        placeholder="https://example.com/cover.jpg"
                        value={formData.book_image}
                        onChange={handleChange}
                    />
                    {formData.book_image && (
                        <img
                            src={formData.book_image}
                            alt="Preview"
                            className="modal-img-preview"
                            onError={(e) => (e.target.style.display = "none")}
                        />
                    )}

                    <div className="modal-buttons">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="add-btn" disabled={loading}>
                            {loading ? "Adding..." : "Add Book"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddBookModal;
