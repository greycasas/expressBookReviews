const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
  let { username, password } = req.body;
  if (!username) return res.status(400).json({ error: "Username cannot be empty." });
  if (!password) return res.status(400).json({ error: "Password cannot be empty." });

  let isUser = users.filter(u => u.username.toLowerCase() === username.toLowerCase());

  if (isUser.length == 0) {
    users.push({ username, password });
    return res.status(200).json({ message: "The user was successfully registered." })
  } else {
    return res.status(409).json({ error: "The username already exists." })
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  let listOfBooks = { books: books };
  return res.status(200).send(JSON.stringify(listOfBooks));

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  let isbn = req.params.isbn;
  let book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book));

  } else {
    return res.status(404).json({ error: "The book was not found." });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  let author = req.params.author.toLowerCase();
  let book = [];
  let keys = Object.keys(books);

  for (let i = 0; i < keys.length; i++) {
    let currentBooks = books[i + 1];
    let currentAuthor = currentBooks["author"].toLowerCase();

    if (currentAuthor === author) {
      book.push({
        "isbn": i + 1,
        "title": currentBooks["title"],
        "reviews": currentBooks["reviews"]
      });
    }
  }
  
  if (book.length > 0) {
    let booksByAuthor = {
      "booksbyauthor": book
    };
    return res.status(200).send(JSON.stringify(booksByAuthor));
  } else {
    return res.status(404).json({ error: "The book was not found." });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  let title = req.params.title.toLowerCase();
  let book = [];
  let keys = Object.keys(books);

  for (let i = 0; i < keys.length; i++) {
    let currentBooks = books[i + 1];
    let currentTitle = currentBooks["title"].toLowerCase();

    if (currentTitle === title) {
      book.push({
        "isbn": i + 1,
        "author": currentBooks["author"],
        "reviews": currentBooks["reviews"]
      });
    }

  }
  if (book.length > 0) {
    let booksByTitle = {
      "booksbytitle": book
    };
    return res.status(200).send(JSON.stringify(booksByTitle));

  } else {
    return res.status(404).json({ error: "The book was not found." });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ error: "The book was not found." });
  }
  let reviews = books[isbn].reviews;
  reviews = JSON.stringify(reviews);
  return res.status(200).send(reviews);
});

const BASE_URL = 'http://localhost:5000';

// Task 10: Get all books (using async/await)
async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("All books:", response.data);
  } catch (error) {
    console.error("Error while fetching all books:", error.message);
  }
}


// Task 11: Get book by ISBN (using Promises)
function getBookByISBN(isbn) {
  axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then(response => {
      console.log(`Book with ISBN ${isbn}:`, response.data);
    })
    .catch(error => {
      console.error(`Error while fetching book with ISBN ${isbn}:`, error.message);
    });
}

// Task 12: Get books by author (using Promises)
function getBooksByAuthor(author) {
  axios.get(`${BASE_URL}/author/${author}`)
    .then(response => {
      console.log(`Books by author ${author}:`, response.data);
    })
    .catch(error => {
      console.error(`Error while fetching books by author ${author}:`, error.message);
    });
}

// Task 13: Get books by title (using Promises)
function getBooksByTitle(title) {
  axios.get(`${BASE_URL}/title/${title}`)
    .then(response => {
      console.log(`Books with title "${title}":`, response.data);
    })
    .catch(error => {
      console.error(`Error while fetching books with title "${title}":`, error.message);
    });
}

// Execute Axios
(async () => {
  await getAllBooks();
  getBookByISBN('1');
  getBooksByAuthor('Hans Christian Andersen');
  getBooksByTitle('Things Fall Apart');
})();

module.exports.general = public_users;
