const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

let errorMessage = (element) => { return { message: `${element} not found on our database.` } }


public_users.post("/register", (req, res) => {
  let { username, password } = req.body;

  if (!username || !password) return res.status(404).json({ message: "Unable to register user." });

  if (username === "" || password === "") return res.status(404).json({ message: "Username and Password must be present." });

  if (!isValid(username)) return res.status(404).json({ message: "User already exists!" });

  users.push({ "username": username, "password": password });
  return res.status(200).json({ message: "User successfully registred. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  let { isbn } = req.params;
  if (!isbn) return res.status(404).json({ message: "Error" })

  //well assuming the format "ISBN":{author, title, reviews}
  return res.send(books[isbn]);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  let { author } = req.params;

  if (!author) return res.status(404).json({ message: "Error" })

  let booksArr = Object.entries(books);

  let result = booksArr.find(book => book[1].author === author);
  if (result === undefined) return res.status(208).json(errorMessage(author))

  res.send(result);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  let { title } = req.params;

  console.log(title);
  if (!title) return res.status(404).json({ message: "Error" })

  let booksArr = Object.entries(books);
  let result = booksArr.find(book => book[1].title === title);

  if (result === undefined) return res.status(208).json(errorMessage(title));

  res.send(result);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let { isbn } = req.params;
  if (!isbn) return res.status(404).json({ message: "Error" })

  //well assuming the format "ISBN":{author, title, reviews}
  return res.send(books[isbn].reviews);

});


//Functions using async/await
public_users.get('/', function(req, res){
  const get_books = new Promise((resolve , reject)=>{
    resolve(res.send(JSON.stringify(books, null, 4)))
  });

  get_books.then(() => console.log("Lists of book returned!"));
})

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  let { isbn } = req.params;

  const get_book = new Promise((resolve, reject) => {
    if (!isbn) reject(res.status(404).json({ message: "Error" }));
    resolve(res.send(books[isbn]));
  });

  get_book.then(() => console.log('Serach by ISBN returned'))
  .catch(() => console.log("Invalid ISBN"));
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  let { author } = req.params;

  const get_book = new Promise((resolve, reject) => {
    if (!author) reject(res.status(404).json({ message: "Error" }));

    let booksArr = Object.entries(books);
    let result = booksArr.find(book => book[1].author === author);
    
    if (result === undefined) reject(res.status(208).json(errorMessage(author)));

    resolve( res.send(result));
  });

  get_book.then(() => console.log("search by author returned!"))
  .catch(() => console.log("Invalid author"))
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  let { title } = req.params;

  const get_book = new Promise((resolve, reject) =>{
    if (!title) reject(res.status(404).json({ message: "Error" }));

    let booksArr = Object.entries(books);
    let result = booksArr.find(book => book[1].title === title);

    if (result === undefined) reject(res.status(208).json(errorMessage(title)));

    resolve(res.send(result));
  })
  
  get_book.then(() => console.log("Search by title returned!"))
  .catch(() => console.log("Invalid title"));
  });

module.exports.general = public_users;
