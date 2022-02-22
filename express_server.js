const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// http://localhost:8080/ homepage that says Hello!
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// localhost:8080/urls.json you get the json version of the urLDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// http://localhost:8080/hello you get Hello World
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// http://localhost:8080/urls renders urls_index with short/long URL list
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// http://localhost:8080/urls/new renders urls_new with form to enter URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// http://localhost:8080/urls/:shortURL renders urls_show and shows the short/long URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

// http://localhost:8080/u/:shortURL when you click on the shortURL you get redirected to the longURL
// app.get("/urls/:shortURL", (req, res) => {
//   const longURL = urlDatabase[req.params.shortURL];
//   res.redirect(longURL);
// });

// http://localhost:8080/urls post requests updates the urlDatabase
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});

// http://localhost:8080/urls/:shortURL/delete delete button removes short/long URL from list
app.post("/u/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

// http://localhost:8080/urls/:shortURL/edit to go to edit page for that short/long URL from list
app.get("/u/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/u/:id", (req, res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.update;
  // delete urlDatabase[shortURL];
  // console.log("req.body: ", req.body);
  // console.log("req.body.update", req.body.update);
  // urlDatabase[shortURL] = req.body.update;
  res.redirect(`/urls/`);
});

function generateRandomString() {
  // Math.random = random number between 0-1, toString to change numbers to random string + number, substring returns 6 characters
  const result = Math.random().toString(20).substring(2, 8);
  return result;
}
