const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  // Login as registered user
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  // Check if user exists and password matches
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  // Create JWT token
  const accessToken = jwt.sign({ username }, "fingerprint_customer", { expiresIn: '1h' });
  req.session.authorization = { accessToken };
  return res.status(200).json({ message: "Login successful" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Add or modify a book review using Promise callback
  const isbn = req.params.isbn;
  const review = req.query.review;
  let username;
  if (req.session && req.session.authorization) {
    try {
      const token = req.session.authorization['accessToken'];
      const user = jwt.verify(token, "fingerprint_customer");
      username = user.username;
    } catch {
      return res.status(403).json({ message: "User not authenticated" });
    }
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
  if (!review) {
    return res.status(400).json({ message: "Review is required as query param" });
  }
  new Promise((resolve, reject) => {
    if (!books[isbn]) {
      reject("Book not found");
    } else {
      books[isbn].reviews[username] = review;
      resolve();
    }
  })
  .then(() => res.status(200).json({ message: "Review added/modified successfully" }))
  .catch(err => res.status(404).json({ message: err }));
});
// Delete a book review using Promise callback
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  let username;
  if (req.session && req.session.authorization) {
    try {
      const token = req.session.authorization['accessToken'];
      const user = jwt.verify(token, "fingerprint_customer");
      username = user.username;
    } catch {
      return res.status(403).json({ message: "User not authenticated" });
    }
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
  new Promise((resolve, reject) => {
    if (!books[isbn]) {
      reject("Book not found");
    } else if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username];
      resolve();
    } else {
      reject("Review not found for user");
    }
  })
  .then(() => res.status(200).json({ message: "Review deleted successfully" }))
  .catch(err => res.status(404).json({ message: err }));
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
