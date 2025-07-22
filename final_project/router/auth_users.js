const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  return users.findIndex(u => u.username === username) > -1

}

const authenticatedUser = (username, password) => { //returns boolean
  let user = users.find(u => u.username === username);
  return user.password == password;

}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password are required." });

  if (isValid(username)) {
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({ data: username }, "access", { expiresIn: '1h' });
      req.session.authorization = { accessToken, username };
      return res.status(200).json({ message: "The user was successfully logged in." });
    }
    else
      return res.status(208).json({ message: "Invalid login: the username or password is incorrect." });

  } else {
    return res.status(404).json({ error: "The user was not found." });
  }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  let user = req.session.authorization["username"];
  let newReview = req.body.review;
  let isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ error: "The specified ISBN does not exist." });
  }
  if (!newReview) {
    return res.status(400).json({ error: "A review must be provided." });
  }


  let initialReviews = books[isbn]["reviews"];
  let initialReviewsKeys = Object.keys(initialReviews);
  let userReviewExists = initialReviewsKeys.includes(user);

  if (userReviewExists) {
    let userReviewInitial = initialReviews[user];
    if (userReviewInitial != newReview) {
      books[isbn]["reviews"][user]["review"] = newReview;
      return res.status(200).json({ message: "The user's review was successfully updated." });
    } else {
      return res.status(208).json({ message: "The same review was already submitted by the user." });
    }
  } else {
    books[isbn]["reviews"][user] = { "review": newReview };
    return res.status(200).json({ message: "The user's review was successfully added." });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  let user = req.session.authorization["username"];
  let isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ error: "The specified ISBN does not exist." });
  }

  let initialReviews = books[isbn]["reviews"];
  let initialReviewsKeys = Object.keys(initialReviews);
  let userReviewExists = initialReviewsKeys.includes(user);

  if (userReviewExists) {
    delete books[isbn]["reviews"][user];
    return res.status(200).json({ message: "The user's review was successfully deleted." });

  } else {
    return res.status(400).json({ error: "No review was found for this book by the user." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
