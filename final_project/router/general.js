const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

function getBooksCallback(callback) {
  setTimeout(() => {
    // primer parámetro: error (null si no hay)
    callback(null, books);
  }, 1000); // 1 s de retraso simulado
}
// general.js (junto al getBooksCallback)

// Función que busca un libro por ISBN y devuelve una Promise
function getBookByISBNPromise(isbn) {
  return new Promise((resolve, reject) => {
    // Simular retraso si lo deseas, o eliminar el setTimeout
    setTimeout(() => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(`No se encontró un libro con ISBN ${isbn}.`);
      }
    }, 500);
  });
}

// general.js

// Función que busca libros por autor y devuelve una Promise
function getBooksByAuthorPromise(author) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const results = [];
      Object.keys(books).forEach((isbn) => {
        if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
          results.push({ isbn, ...books[isbn] });
        }
      });
      if (results.length > 0) {
        resolve(results);
      } else {
        reject(`No se encontraron libros del autor "${author}".`);
      }
    }, 500);
  });
}

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Validar campos
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username y password son obligatorios." });
  }

  // Verificar que el usuario no exista ya
  if (!isValid(username)) {
    return res
      .status(409)
      .json({ message: `El usuario '${username}' ya existe.` });
  }

  // Registrar
  users.push({ username, password });
  return res
    .status(201)
    .json({ message: `Usuario '${username}' registrado con éxito.` });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  // Devuelve todos los libros formateados
  res.send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    // Devolver solo ese libro, con JSON bien formateado
    return res.send(JSON.stringify(book, null, 2));
  } else {
    return res
      .status(404)
      .json({ message: `No se encontró un libro con ISBN ${isbn}.` });
  }
});

// Get book details based on author
// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const results = [];

  // Recorremos todas las llaves del objeto books
  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      // Incluir el ISBN en la respuesta
      results.push({ isbn, ...books[isbn] });
    }
  });

  if (results.length > 0) {
    // Devolvemos el array de coincidencias formateado
    return res.send(JSON.stringify(results, null, 2));
  } else {
    return res
      .status(404)
      .json({ message: `No se encontraron libros del autor "${author}".` });
  }
});

// Get all books based on title
// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const results = [];

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
      results.push({ isbn, ...books[isbn] });
    }
  });

  if (results.length > 0) {
    return res.send(JSON.stringify(results, null, 2));
  } else {
    return res
      .status(404)
      .json({ message: `No se encontraron libros con título "${title}".` });
  }
});

//  Get book review
// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    // Devolver solo el objeto reviews (puede estar vacío)
    return res.send(JSON.stringify(book.reviews, null, 2));
  } else {
    return res
      .status(404)
      .json({ message: `No se encontró un libro con ISBN ${isbn}.` });
  }
});

public_users.get("/books/callback", (req, res) => {
  getBooksCallback((err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error al obtener los libros." });
    }
    // Envía el JSON formateado
    res.send(JSON.stringify(data, null, 2));
  });
});
// Get book by ISBN using Promises
public_users.get("/books/promise/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  getBookByISBNPromise(isbn)
    .then((book) => {
      res.send(JSON.stringify(book, null, 2));
    })
    .catch((errMsg) => {
      res.status(404).json({ message: errMsg });
    });
});

// Get books by author using Promises
public_users.get("/books/promise/author/:author", (req, res) => {
  const author = req.params.author;
  getBooksByAuthorPromise(author)
    .then((booksList) => {
      res.send(JSON.stringify(booksList, null, 2));
    })
    .catch((errMsg) => {
      res.status(404).json({ message: errMsg });
    });
});

// general.js

// Función que busca libros por título y devuelve una Promise
function getBooksByTitlePromise(title) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const results = [];
      Object.keys(books).forEach((isbn) => {
        if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
          results.push({ isbn, ...books[isbn] });
        }
      });
      if (results.length > 0) {
        resolve(results);
      } else {
        reject(`No se encontraron libros con título "${title}".`);
      }
    }, 500);
  });
}
// Get books by title using Promises
public_users.get("/books/promise/title/:title", (req, res) => {
  const title = req.params.title;
  getBooksByTitlePromise(title)
    .then((booksList) => {
      res.send(JSON.stringify(booksList, null, 2));
    })
    .catch((errMsg) => {
      res.status(404).json({ message: errMsg });
    });
});

module.exports.general = public_users;
