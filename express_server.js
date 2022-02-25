//////////////////////////
// Modules/dependencies/helper functions/constant
//////////////////////////
const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require("morgan");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const {
  generateRandomString,
  emailChecker,
  urlsForUser,
  getUserByEmail,
  getUserObject,
} = require("./helpers");

//////////////////////////
// Sets view engine to ejs
//////////////////////////

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  cookieSession({
    name: "session",
    keys: ["session1", "session1", "session1"],
  })
);

//////////////////////////
// Databases
//////////////////////////
const urlDatabase = {};
const users = {};

//////////////////////////
// listen to given port for connection
//////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//////////////////////////
// GET ROUTES
//////////////////////////

app.get("/", (req, res) => {
  return res.redirect(`/urls`);
});

app.get("/urls", (req, res) => {
  const filteredURLs = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: filteredURLs,
    user_id: req.session.user_id,
    email: users[req.session.user_id] ? users[req.session.user_id].email : null,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // set object where user_id is the value of the cookie and email is a ternary operator where if user exists, give email or null if no session
  const templateVars = {
    user_id: req.session.user_id,
    email: users[req.session.user_id] ? users[req.session.user_id].email : null,
  };

  if (!req.session.user_id) {
    return res.redirect(`/login`);
  }

  return res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send("You need to log in to do that!");
    return;
  }

  const shortURL = req.params.shortURL;
  const filteredURLs = urlsForUser(req.session.user_id, urlDatabase);

  // if the short URL for the user (taken from :id) does not exist send error
  if (!filteredURLs[shortURL]) {
    res.status(401).send("The URL does not exist.");
    return;
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.session.user_id,
    email: users[req.session.user_id] ? users[req.session.user_id].email : null,
  };

  return res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user_id: users[req.session.user_id] ? users[req.session.user_id] : null,
    email: users[req.session.user_id] ? users[req.session.user_id].email : null,
  };
  return res.render("urls_login", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send("You need to log in to do that!");
    return;
  }

  const shortURL = req.params.shortURL;
  const filteredURLs = urlsForUser(req.session.user_id, urlDatabase);

  if (!filteredURLs[shortURL]) {
    res.status(401).send("The URL does not exist.");
    return;
  }

  // if user is logged in and the shortURL is the user's. deletes key and value from knowing the key
  delete urlDatabase[shortURL];
  return res.redirect(`/urls`);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const shortURLData = urlDatabase[shortURL];

  if (!shortURLData) {
    return res.status(404).send("That URL is not in the database");
  } else {
    const longURL = urlDatabase[shortURL].longURL;
    return res.redirect(longURL);
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect(`/urls`);
  }

  const templateVars = {
    user_id: users[req.session.user_id] ? users[req.session.user_id] : null,
    email: users[req.session.user_id] ? users[req.session.user_id].email : null,
  };
  return res.render("urls_register", templateVars);
});

//////////////////////////
// POST ROUTES
//////////////////////////

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send("You need to log in to do that!");
    return;
  }
  console.log("cookie ID:", req.session.user_id);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };

  return res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send("You need to log in to do that!");
    return;
  }

  const shortURL = req.params.id;
  const filteredURLs = urlsForUser(req.session.user_id, urlDatabase);

  if (!filteredURLs[shortURL]) {
    res.status(401).send("The URL does not exist.");
    return;
  }

  urlDatabase[shortURL].longURL = req.body.update;

  return res.redirect(`/urls/`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password === "") {
    return res
      .status(400)
      .send("Cannot register with empty email/password fields!");
  }

  if (!emailChecker(email, users)) {
    return res.status(403).send("That email is not registered!");
  }

  const hashPass = getUserObject(email, users).password;
  if (bcrypt.compareSync(password, hashPass)) {
    let userId = getUserByEmail(email, users);
    req.session.user_id = userId;
    return res.redirect(`/urls/`);
  }
  return res.status(404).send("Incorrect information");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();

  if (email === "" || password === "") {
    return res
      .status(400)
      .send("Cannot register with empty email/password fields!");
  }

  if (emailChecker(email, users)) {
    return res
      .status(400)
      .send("That email is already registered! Please use a different email!");
  }

  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword,
  };
  req.session.user_id = userId;

  return res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect(`/urls`);
});
