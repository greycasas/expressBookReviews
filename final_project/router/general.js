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
  return res.status(200).send(JSON.stringify(books));

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
  let book = {};
  let keys = Object.keys(books);

  for (let i = 0; i < keys.length; i++) {
    let currentBooks = books[i + 1];
    let currentAuthor = currentBooks["author"].toLowerCase();

    if (currentAuthor === author) {
      book[i + 1] = currentBooks;
    }

  }
  if (Object.keys(book) == "") {
    return res.status(404).json({ error: "The book was not found." });
  } else {
    return res.status(200).send(JSON.stringify(book));
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  let title = req.params.title.toLowerCase();
  let book = {};
  let keys = Object.keys(books);

  for (let i = 0; i < keys.length; i++) {
    let currentBooks = books[i + 1];
    let currentTitle = currentBooks["title"].toLowerCase();

    if (currentTitle === title) {
      book[i + 1] = currentBooks;
    }

  }
  if (Object.keys(book) == "") {
    return res.status(404).json({ error: "The book was not found." });
  } else {
    return res.status(200).send(JSON.stringify(book));
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
  if (reviews != '{}') {
    return res.status(200).send(reviews );
  } else {
    return res.status(404).json({ error: "This book has no reviews." });
  }
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
// Execute
(async () => {
  await getAllBooks();
})();

module.exports.general = public_users;
