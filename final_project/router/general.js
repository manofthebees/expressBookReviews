const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  // Register a new user
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Return the list of books using Promise callback
  new Promise((resolve, reject) => {
    resolve(books);
  })
  .then(data => res.status(200).send(JSON.stringify(data, null, 4)))
  .catch(() => res.status(500).json({ message: "Error fetching books" }));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Get book details by ISBN using Promise callback
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject();
    }
  })
  .then(book => res.status(200).json(book))
  .catch(() => res.status(404).json({ message: "Book not found" }));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // Get book details by author using Promise callback
  const author = req.params.author;
  new Promise((resolve, reject) => {
    const results = Object.values(books).filter(book => book.author === author);
    if (results.length > 0) {
      resolve(results);
    } else {
      reject();
    }
  })
  .then(results => res.status(200).json(results))
  .catch(() => res.status(404).json({ message: "No books found for this author" }));
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // Get book details by title using Promise callback
  const title = req.params.title;
  new Promise((resolve, reject) => {
    const results = Object.values(books).filter(book => book.title === title);
    if (results.length > 0) {
      resolve(results);
    } else {
      reject();
    }
  })
  .then(results => res.status(200).json(results))
  .catch(() => res.status(404).json({ message: "No books found with this title" }));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Get book reviews by ISBN
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
