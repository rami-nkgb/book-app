# imports
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv

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
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Check current status
    cursor.execute("SELECT book_status FROM book_details WHERE book_id = %s", (book_id,))
    book = cursor.fetchone()

    if not book:
        cursor.close()
        db.close()
        return jsonify({"message": "Book not found"}), 404

    if book["book_status"] != "available":
        cursor.close()
        db.close()
        return jsonify({"message": f"Book is currently {book['book_status']}"}), 400

    cursor.execute(
        "UPDATE book_details SET book_status = 'borrowed' WHERE book_id = %s",
        (book_id,)
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({"message": "Book borrowed successfully"})


if __name__ == "__main__":
    app.run(debug=True)
