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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// page that says Hello!
app.get("/", (req, res) => {
  res.send("Hello!");
});

// you get the json version of the urLDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// you get Hello World
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// renders urls_index (main page) with short/long URL list
app.get("/urls", (req, res) => {
  // because this page uses urls from the database and username when rendering, need to pass them in as templateVars
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  // variables like above usually sent in when rendering
  res.render("urls_index", templateVars);
});

// renders urls_new (new url form page) to enter URL t osave
app.get("/urls/new", (req, res) => {
  // because this page uses username when rendering, need to pass them in as templateVars
  const templateVars = { username: req.cookies.username };
  res.render("urls_new", templateVars);
});

// renders urls_show (page showing details of urls) and shows the short/long URL
app.get("/urls/:shortURL", (req, res) => {
  // because this page uses the short/long URLs and username when rendering, need to pass them in as templateVars
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username,
  };
  res.render("urls_show", templateVars);
});

// renders urls_register (page showing registration)
app.get("/register", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username,
  };
  res.render("urls_register", templateVars);
});

// goes to edit page for the specified short/long URL from list via button
app.get("/u/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

// post requests updates the urlDatabase
app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  // generate random 6 digit short URL
  const shortURL = generateRandomString();
  // give databse key a value
  urlDatabase[shortURL] = req.body.longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});

// delete button removes short/long URL from list
app.post("/u/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  // deletes key and value from knowing the key
  delete urlDatabase[shortURL];
  res.redirect(`/urls`);
});

// for editing longURL, saves the shortURL and uses that as key to update longURL, redirects to main page
app.post("/u/:id", (req, res) => {
  let shortURL = req.params.id;
  // takes the value from update (name on input) to update longURL data
  urlDatabase[shortURL] = req.body.update;
  // delete urlDatabase[shortURL];
  // console.log("req.body: ", req.body);
  // console.log("req.body.update", req.body.update);
  // urlDatabase[shortURL] = req.body.update;
  res.redirect(`/urls/`);
});

// login - takes username from request body, sends it as request to make cookie, redirects to main page
app.post("/urls/login", (req, res) => {
  // save username (from input name) from request body
  const username = req.body.username;
  // sends response as cookie for username - "name", value
  res.cookie("username", username);
  res.redirect(`/urls`);
});

// logout - sends response for clearing cookie and redirects to main page
app.post("/urls/logout", (req, res) => {
  // sends response to clear cookie
  res.clearCookie("username");
  res.redirect(`/urls`);
});

// register data from register form
app.post("/register", (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let password = req.body.password;
  res.redirect(`/urls`);
});

// function to generate random 6 digit string
function generateRandomString() {
  // Math.random = random number between 0-1, toString to change numbers to random string + number, substring returns 6 characters
  const result = Math.random().toString(20).substring(2, 8);
  return result;
}
