const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid

  //if the user already exists it's invalid
  if (users.findIndex(user => user.username === username) > 0) return false;

  return true;

}

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.

  var result = users.filter(user => user.username === username && user.password === password);

  if (result.length === 0) return false;

  return true;
}

//only registered users can login
regd_users.post("/login", (req, res) => {

  let { username, password } = req.body;

  //check if the username and password are being passed
  if (!username || !password) return res.status(404).json({ message: "Error" });

  if (authenticatedUser(username, password)) {
    //create the token
    let token = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 })

    //save in the session
    req.session.authorization = {
      token, username
    }

    //just return a 200 
    return res.status(200).send("User successfully logged in!")
  }

  return res.status(208).json({ message: "Invalid login. Check username and password" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let { review } = req.body;
  let { isbn } = req.params;
  let { user } = req;

  if (!isbn || !review || !user) return res.status(404).json({ message: "Error" });

  books[isbn].reviews[user] = review;

  return res.status(200).json({ message: "Review saved successfully!", "reviews": books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  let { isbn } = req.params;
  let { user } = req;

  if (!isbn || !user) return res.status(404).json({ message: "Error" });

  if (books[isbn] === undefined) return res.status(404).json({ message: "Book does not exist!" });

  //delete the review
  delete books[isbn].reviews[user];

  //return all the reviews
  return res.status(200).json({ message: "Review deleted successfully!", "reviews": books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
