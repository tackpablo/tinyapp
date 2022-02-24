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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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
  // filtered URLs for specific user (ones they "own")
  const filteredURLs = urlsForUser(req.cookies["user_id"], urlDatabase);
  console.log(filteredURLs);
  // because this page uses urls from the database and username when rendering, need to pass them in as templateVars
  const templateVars = {
    // set object where user_id is the value of the cookie and email is a ternary operator where if user exists, give email or null if no cookie
    urls: filteredURLs,
    user_id: req.cookies["user_id"],
    email: users[req.cookies["user_id"]]
      ? users[req.cookies["user_id"]].email
      : null,
  };

  // variables like above usually sent in when rendering
  res.render("urls_index", templateVars);
});

// renders urls_new (new url form page) to enter URL to save
app.get("/urls/new", (req, res) => {
  // because this page uses username when rendering, need to pass them in as templateVars
  // set object where user_id is the value of the cookie and email is a ternary operator where if user exists, give email or null if no cookie
  const templateVars = {
    user_id: req.cookies["user_id"],
    email: users[req.cookies["user_id"]]
      ? users[req.cookies["user_id"]].email
      : null,
  };

  // if there is no cookie, and trying to access
  if (!req.cookies["user_id"]) {
    return res.status(401).send("You need to log in to do that!");
  }

  return res.render("urls_new", templateVars);
});

// renders urls_show (page showing details of urls) and shows the short/long URL
app.get("/urls/:shortURL", (req, res) => {
  // because this page uses the short/long URLs and username when rendering, need to pass them in as templateVars
  // set object where user_id is the value of the cookie and email is a ternary operator where if user exists, give email or null if no cookie
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.cookies["user_id"],
    email: users[req.cookies["user_id"]]
      ? users[req.cookies["user_id"]].email
      : null,
  };

  return res.render("urls_show", templateVars);
});

// request to server to see if short URL exists to redirect to long URL
app.get("/u/:id", (req, res) => {
  // define short URL from :id and shortURLData to see if there is an object for that particular short URL
  const shortURL = req.params.id;
  const shortURLData = urlDatabase[shortURL];

  // if there is no data (no longURL), send status error
  if (!shortURLData) {
    return res.status(404).send("That URL is not in the database");
  } else {
    // otherwise define long URL and redirect to it
    const longURL = urlDatabase[shortURL].longURL;
    return res.redirect(longURL);
  }
});

// renders urls_register (page showing registration)
app.get("/register", (req, res) => {
  // for register page, you want user id and email to be null as nothing should be registered
  const templateVars = {
    user_id: users[req.cookies["user_id"]]
      ? users[req.cookies["user_id"]]
      : null,
    email: users[req.cookies["user_id"]]
      ? users[req.cookies["user_id"]].email
      : null,
  };
  return res.render("urls_register", templateVars);
});

// renders urls_login (page showing login)
app.get("/login", (req, res) => {
  // for register page, you want userid and email to be null as nothing should be registered
  const templateVars = {
    user_id: users[req.cookies["user_id"]]
      ? users[req.cookies["user_id"]]
      : null,
    email: users[req.cookies["user_id"]]
      ? users[req.cookies["user_id"]].email
      : null,
  };
  return res.render("urls_login", templateVars);
});

// goes to edit page for the specified short/long URL from list via button
app.get("/u/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL;
  return res.redirect(`/urls/${shortURL}`);
});

// post requests updates the urlDatabase
app.post("/urls", (req, res) => {
  // if there is no cookie, and trying to access
  if (!req.cookies["user_id"]) {
    res.status(401).send("You need to log in to do that!");
    return;
  }
  // console.log(req.body); // Log the POST request body to the console
  // generate random 6 digit short URL
  const shortURL = generateRandomString();
  // give database key a value
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  };
  // console.log(urlDatabase);

  return res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});

// delete button removes short/long URL from list
app.post("/u/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  // deletes key and value from knowing the key
  delete urlDatabase[shortURL];
  return res.redirect(`/urls`);
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
  return res.redirect(`/urls/`);
});

// login - takes username from request body, sends it as request to make cookie, redirects to main page
app.post("/urls/login", (req, res) => {
  // const username = req.body.username;
  // sends response as cookie for username - "name", value
  // res.cookie("username", username);
  return res.redirect(`/urls`);
});

// logout - sends response for clearing cookie and redirects to main page
app.post("/urls/logout", (req, res) => {
  // sends response to clear cookie
  res.clearCookie("user_id");
  return res.redirect(`/register`);
});

// register data from register form
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const userId = generateRandomString();
  console.log(users);

  // if email or password are empty strings
  if (email === "" || password === "") {
    // send them 400 status code
    return res
      .status(400)
      .send("Cannot register with empty email/password fields!");
  }

  // if email doesn't exist in user's database
  if (emailChecker(email, users)) {
    // send them 400 status code
    return res
      .status(400)
      .send("That email is already registered! Please use a different email!");
  }

  // add register data to user object
  users[userId] = {
    user_id: userId,
    email: email,
    password: password,
  };
  // save cookie user_id as key and random string as value
  res.cookie("user_id", userId);

  // console.log(users);
  return res.redirect(`/urls`);
});

// for login
app.post("/login", (req, res) => {
  console.log(users);
  let email = req.body.email;
  console.log(email);
  let password = req.body.password;

  // if email or password are empty strings
  if (email === "" || password === "") {
    // send them 400 status code
    return res
      .status(400)
      .send("Cannot register with empty email/password fields!");
  }

  // if email exist in user's database
  if (!emailChecker(email, users)) {
    // send them 403 status code
    return res.status(403).send("That email is not registered!");
  }

  // if passsword exist in user's database
  if (!passwordChecker(password, users)) {
    // send them 403 status code
    return res.status(403).send("Wrong password!");
  }

  // let user id be retrieved
  let userId = idFromEmail(email, users);
  console.log(userId);
  // set the user_id cookie with user's id and redirect
  res.cookie("user_id", userId);

  return res.redirect(`/urls/`);
});

//HELPER FUNCTIONS

// function to generate random 6 digit string
function generateRandomString() {
  // Math.random = random number between 0-1, toString to change numbers to random string + number, substring returns 6 characters
  const result = Math.random().toString(20).substring(2, 8);
  return result;
}

// function to check if a given email already exists
const emailChecker = function (email, users) {
  // loop through users in dtabse
  for (const user in users) {
    // if email exists in database
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

// function to check if a given password already exists
const passwordChecker = function (password, users) {
  // loop through users in user object
  for (const user in users) {
    // if user's email === email
    if (users[user].password === password) {
      return true;
    }
  }
  return false;
};

// function to retrieve id from email
const idFromEmail = function (email, users) {
  // loop through users in user object
  for (const user in users) {
    // if user's email === email
    if (users[user].email === email) {
      // return that user's password
      return users[user].user_id;
    }
  }
};

// function to get short URLs for specific user
const urlsForUser = function (id, urlDatabase) {
  const userURLs = {};
  // loop through URL database
  for (const shortURL in urlDatabase) {
    // if database user ID equals specific user
    if (urlDatabase[shortURL].userID === id) {
      // let key be the short URL and value be shortURL object data
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};
