const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const JWT_SECRET = "IBM_Funcional";

const isValid = (username) => {
  // returns boolean
  // check if the username already exists in the users array
  return !users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  // returns boolean
  // check if username and password match a registered user
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

//only registered users can login
// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // 1) Validar que envíen username y password
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username y password son obligatorios." });
  }

  // 2) Verificar credenciales
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Credenciales inválidas." });
  }

  // 3) Generar token JWT
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

  // (Opcional) Guardar en sesión para futuros usos
  req.session.authorization = { token };

  // 4) Devolver éxito con token
  return res.status(200).json({
    message: "Login exitoso",
    token,
  });
});

// Add a book review
// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.body.review;
  // 1) Validar que envíen review
  if (!reviewText) {
    return res
      .status(400)
      .json({ message: "Debes enviar el texto de la reseña en el body." });
  }
  // 2) Comprobar que el libro exista
  const book = books[isbn];
  if (!book) {
    return res
      .status(404)
      .json({ message: `No se encontró un libro con ISBN ${isbn}.` });
  }
  // 3) Obtener el username del token (suponiendo middleware puso req.user)
  const username = req.user && req.user.username;
  if (!username) {
    return res
      .status(401)
      .json({ message: "No autorizado. Token inválido o no proporcionado." });
  }
  // 4) Añadir o actualizar la reseña
  book.reviews[username] = reviewText;
  // 5) Devolver confirmación con el objeto reviews actualizado
  return res.status(200).json({
    message: `Reseña añadida/actualizada para ISBN ${isbn}.`,
    reviews: book.reviews,
  });
});
// Delete a book review by the authenticated user
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user && req.user.username;
  // 1) Verificar autenticación
  if (!username) {
    return res
      .status(401)
      .json({ message: "No autorizado. Token inválido o no proporcionado." });
  }
  // 2) Verificar que el libro exista
  const book = books[isbn];
  if (!book) {
    return res
      .status(404)
      .json({ message: `No se encontró un libro con ISBN ${isbn}.` });
  }
  // 3) Verificar que el usuario tenga una reseña
  if (!book.reviews[username]) {
    return res
      .status(404)
      .json({ message: "No hay reseña de este usuario para eliminar." });
  }
  // 4) Eliminar la reseña
  delete book.reviews[username];
  // 5) Devolver confirmación con el objeto reviews actualizado
  return res.status(200).json({
    message: `Reseña eliminada para ISBN ${isbn}.`,
    reviews: book.reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
