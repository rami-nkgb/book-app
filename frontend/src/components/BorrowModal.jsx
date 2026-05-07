import { useState } from "react";

function BorrowModal({bookTitle, onClose, onConfirm}){
    const [borrowerName, setBorrowerName] = useState("");
    const [error, setError] = useState(null);

    //Calcuate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const handleSubmit = (e) => {
        e.preventDefault();

        //Basic validation 
        if (!borrowerName.trim()) {
            setError("Borrower name is required!");
            return;
        }
        onConfirm(borrowerName);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="close-btn" onClick={onClose}>X</button>
                <h2>Borrow Book : {bookTitle}</h2>

                {error && <p className="modal-error">{error}</p>}

                <form className="modal-form" onSubmit={handleSubmit}>
                    <label>Borrower Name *</label>
                    <input
                        type="text"
                        name="borrower_Name"
                        placeholder="Borrower Name"
                        value={borrowerName}
                        onChange={(e) => setBorrowerName(e.target.value)}
                    />

                    <p>Due Date: {dueDate.toLocaleDateString()}</p>

                    <div className="modal-buttons">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="add-btn">
                            Confirm Borrow
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default BorrowModal;