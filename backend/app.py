# imports
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv
from datetime import date, timedelta
import bcrypt

# load .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow React frontend to talk to Flask

# read values from .env file & DB connection
db_config = {
    "host": os.getenv("DB_HOST"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME")
}


def get_db():
    """Get a fresh DB connection (handles reconnects)"""
    return mysql.connector.connect(**db_config)


# helper function - get or create author id for new book add functionality
def get_or_create_author(cursor, author_data):
    # step1: check if author already exists in author db (by name)
    cursor.execute(
        "SELECT author_id FROM author_details WHERE author_name = %s",
        (author_data["author_name"],)
    )
    result = cursor.fetchone()

    if result:
        return result["author_id"]

    # step2: insert new author if not found
    insert_query = """INSERT INTO author_details (author_name, author_country, author_dob, author_notable_awards)
    VALUES (%s, %s, %s, %s)
    """
    values = (
        author_data["author_name"],
        author_data.get("author_country"),
        author_data.get("author_dob"),
        author_data.get("author_notable_awards")
    )
    cursor.execute(insert_query, values)
    return cursor.lastrowid


@app.route("/")
def home():
    return "API is running"


@app.route("/books", methods=["GET"])
def get_books():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    # Join book_details with author_details to return author_name in response
    cursor.execute("""
        SELECT b.book_id, b.ISBN, b.book_title, a.author_name,
               b.year_published, b.page_count, b.genre, b.language,
               b.book_status, b.book_image
        FROM book_details b
        LEFT JOIN author_details a ON b.author_id = a.author_id
        WHERE b.book_status != 'deleted'
    """)
    results = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(results)


@app.route("/books", methods=["POST"])
def add_book():
    data = request.json
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # step1: get or create author
    author_id = get_or_create_author(cursor, {
        "author_name": data["author_name"],
        "author_country": data.get("author_country"),
        "author_dob": data.get("author_dob"),
        "author_notable_awards": data.get("author_notable_awards")
    })

    # step2: insert book (including book_image)
    query = """
    INSERT INTO book_details
    (ISBN, book_title, author_id, year_published, page_count, genre, language, book_status, book_image)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    values = (
        data["ISBN"],
        data["book_title"],
        author_id,
        data.get("year_published"),
        data.get("page_count"),
        data.get("genre"),
        data.get("language"),
        data.get("book_status", "available"),
        data.get("book_image")   # NEW: store image URL
    )

    cursor.execute(query, values)
    db.commit()
    new_id = cursor.lastrowid
    cursor.close()
    db.close()

    return jsonify({"message": "Book added successfully", "book_id": new_id}), 201


@app.route("/books/<int:book_id>", methods=["DELETE"])
def delete_book(book_id):
    """Soft delete - sets book_status to 'deleted'"""
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE book_details SET book_status = 'deleted' WHERE book_id = %s",
        (book_id,)
    )
    db.commit()
    affected = cursor.rowcount
    cursor.close()
    db.close()

    if affected == 0:
        return jsonify({"message": "Book not found"}), 404
    return jsonify({"message": "Book deleted successfully"})


@app.route("/books/<int:book_id>/borrow", methods=["PUT"])
def borrow_book(book_id):
    """Mark a book as borrowed"""
    data = request.json or {}

    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Check current status
    cursor.execute(
        "SELECT book_status FROM book_details WHERE book_id = %s", (book_id,))
    book = cursor.fetchone()

    if not book:
        cursor.close()
        db.close()
        return jsonify({"message": "Book not found"}), 404

    if book["book_status"] != "available":
        cursor.close()
        db.close()
        return jsonify({"message": f"Book is currently {book['book_status']}"}), 400

    # Get borrower name from request body
    borrower_name = data.get("borrower_name", "Unknown")

    # Calculate dates
    borrowed_date = date.today()
    due_date = borrowed_date + timedelta(days=14)

    # Update book status in book details table
    cursor.execute(
        "UPDATE book_details SET book_status = 'borrowed' WHERE book_id = %s",
        (book_id,)
    )

    # Insert into borrow_details
    cursor.execute(
        """INSERT INTO borrow_details
        (book_id, borrower_name, borrowed_date, due_date)
        VALUES (%s, %s, %s, %s)""",
        (book_id, borrower_name, borrowed_date, due_date)
    )

    db.commit()
    cursor.close()
    db.close()
    return jsonify({"message": "Book borrowed successfully",
                    "borrower_name": borrower_name,
                    "borrowed_date": str(borrowed_date),
                    "due_date": str(due_date)
                    })


@app.route("/books/<int:book_id>/return", methods=["PUT"])
def return_book(book_id):
    """Mark a book as returned"""
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Check current status
    cursor.execute(
        "SELECT book_status FROM book_details WHERE book_id = %s", (book_id,)
    )
    book = cursor.fetchone()

    if not book:
        cursor.close()
        db.close()
        return jsonify({"message": "Book not found"}), 404

    if book["book_status"] != "borrowed":
        cursor.close()
        db.close()
        return jsonify({"message": "Book is not currently borrowed"}), 400

    # Update book status back to available
    cursor.execute(
        "UPDATE book_details SET book_status = 'available' where book_id = %s",
        (book_id,)
    )

    # Update borrow_details with return date
    cursor.execute(
        """UPDATE borrow_details SET return_date = %s 
        WHERE book_id = %s AND return_date IS NULL""",
        (date.today(), book_id)
    )

    db.commit()
    cursor.close()
    db.close()
    return jsonify({"message": "Book returned successfully"})


@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    db = get_db()
    cursor = db.cursor(dictionary=True)

    if not username or not password:
        return jsonify({
            "message": "Username and password are required"
        }), 400

    # Step 1: Check if username already exists
    cursor.execute(
        "SELECT * FROM user_details WHERE user_name = %s",
        (username,)
    )
    user = cursor.fetchone()

    if user:
        cursor.close()
        db.close()
        return jsonify({
            "message": "Username already in use, Please select different username"
        }), 400

    # Step 2: Hash the password
    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),  # convert string to bytes
        bcrypt.gensalt()           # generate random salt
    )

    # Step 3: Insert new user details into Users table
    cursor.execute(
        """INSERT INTO user_details
        (user_name, password, created_date)
        VALUES (%s, %s, CURDATE())""",
        (username, hashed_password.decode("utf-8"))
    )
    db.commit()

    cursor.close()
    db.close()

    # Step 4: Return success
    return jsonify({
        "message": "User details created successfully. Please proceed with Login"
    }), 201


@app.route("/login", methods=["POST"])
def login():

    try:

        data = request.json

        username = data.get("username")
        password = data.get("password")

        # validation

        if not username or not password:
            return jsonify({
                "message": "Username and password are required"
            }), 400

        db = get_db()
        cursor = db.cursor(dictionary=True)

        # Step 1 :Find user
        cursor.execute(
            "SELECT * FROM user_details WHERE user_name = %s",
            (username,)
        )

        user = cursor.fetchone()

        # Step 2: User not found
        if not user:
            return jsonify({
                "message": "Invalid username"
            }), 401

        # Step 3: Compare password
        stored_password = user["password"]

        password_match = bcrypt.checkpw(
            password.encode("utf-8"),
            stored_password.encode("utf-8")
        )

        # Step 4: Invalid password
        if not password_match:
            return jsonify({
                "message": "Invalid password"
            }), 401

        # Step 5: Success
        return jsonify({
            "message": "Login successful",
            "username": username
        }), 200

    except Exception as e:
        return jsonify({
            "message": "Database/Login error",
            "error": str(e)
        }), 500

    finally:
        # Close DB connection safely
        if 'cursor' in locals():
            cursor.close()

        if 'db' in locals():
            db.close()


if __name__ == "__main__":
    app.run(debug=True)
