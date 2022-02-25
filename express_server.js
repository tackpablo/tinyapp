const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require("morgan");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
// const cookieParser = require("cookie-parser"); // will be obsolete due to cookieSession
const cookieSession = require("cookie-session");
const {
  generateRandomString,
  emailChecker,
  urlsForUser,
  getUserByEmail,
  getUserObject,
} = require("./helpers");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser()); // will be obsolete due to cookieSession
app.use(morgan("dev"));
app.use(
  cookieSession({
    name: "session",
    keys: ["session1", "session1", "session1"],
  })
);

// // accessing cookies/session
// const username = req.cookies["user_id"]
// const username = req.session.user_id

// // setting cookies/session
// res.cookie('username', username) => ("user_id", userId)
// req.session.user_id = userId

// // clearing cookies/session
// res.clearCookie("user_id");
// req.session = null;

const urlDatabase = {
  // b6UTxQ: {
  //   longURL: "https://www.tsn.ca",
  //   userID: "aJ48lW",
  // },
  // i3BoGr: {
  //   longURL: "https://www.google.ca",
  //   userID: "aJ48lW",
  // },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  // user2RandomID: {
  //   id: "user2RandomID",
  //   email: "user2@example.com",
  //   password: "dishwasher-funk",
  // },
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// page that says Hello!
app.get("/", (req, res) => {
  return res.redirect(`/urls`);
});

// // you get the json version of the urLDatabase
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// // you get Hello World
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// renders urls_index (main page) with short/long URL list
app.get("/urls", (req, res) => {
  // filtered URLs for specific user (ones they "own")
  const filteredURLs = urlsForUser(req.session.user_id, urlDatabase);
  // console.log(filteredURLs);
  // because this page uses urls from the database and username when rendering, need to pass them in as templateVars
  const templateVars = {
    // set object where user_id is the value of the cookie and email is a ternary operator where if user exists, give email or null if no cookie
    urls: filteredURLs,
    user_id: req.session.user_id,
    email: users[req.session.user_id] ? users[req.session.user_id].email : null,
  };

  // variables like above usually sent in when rendering
  res.render("urls_index", templateVars);
});

// renders urls_new (new url form page) to enter URL to save
app.get("/urls/new", (req, res) => {
  // because this page uses username when rendering, need to pass them in as templateVars
  // set object where user_id is the value of the cookie and email is a ternary operator where if user exists, give email or null if no cookie
  const templateVars = {
    user_id: req.session.user_id,
    email: users[req.session.user_id] ? users[req.session.user_id].email : null,
  };

  // if there is no cookie, and trying to access
  if (!req.session.user_id) {
    return res.redirect(`/login`);
  }

  return res.render("urls_new", templateVars);
});

// renders urls_show (page showing details of urls) and shows the short/long URL
app.get("/urls/:shortURL", (req, res) => {
  // if not logged in, send error
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

  // because this page uses the short/long URLs and username when rendering, need to pass them in as templateVars
  // set object where user_id is the value of the cookie and email is a ternary operator where if user exists, give email or null if no cookie
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.session.user_id,
    email: users[req.session.user_id] ? users[req.session.user_id].email : null,
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
  // if logged in, redirect to home
  if (req.session.user_id) {
    return res.redirect(`/urls`);
  }

  // for register page, you want user id and email to be null as nothing should be registered
  const templateVars = {
    user_id: users[req.session.user_id] ? users[req.session.user_id] : null,
    email: users[req.session.user_id] ? users[req.session.user_id].email : null,
  };
  return res.render("urls_register", templateVars);
});

// renders urls_login (page showing login)
app.get("/login", (req, res) => {
  // for register page, you want userid and email to be null as nothing should be registered
  const templateVars = {
    user_id: users[req.session.user_id] ? users[req.session.user_id] : null,
    email: users[req.session.user_id] ? users[req.session.user_id].email : null,
  };
  return res.render("urls_login", templateVars);
});

// delete button removes short/long URL from list
app.post("/urls/:shortURL/delete", (req, res) => {
  // if not logged in, send error
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

  // if user is logged in and the short url (:shortURL) is the user's. deletes key and value from knowing the key
  delete urlDatabase[shortURL];
  return res.redirect(`/urls`);
});

// post requests updates the urlDatabase
app.post("/urls", (req, res) => {
  // if there is no cookie, and trying to access
  if (!req.session.user_id) {
    res.status(401).send("You need to log in to do that!");
    return;
  }
  console.log("cookie ID:", req.session.user_id);
  // console.log(req.body); // Log the POST request body to the console
  // generate random 6 digit short URL
  const shortURL = generateRandomString();
  // give database key a value
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  // console.log(urlDatabase);

  return res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});

// for editing longURL, saves the shortURL and uses that as key to update longURL, redirects to main page
app.post("/urls/:id", (req, res) => {
  // if not logged in, send error
  if (!req.session.user_id) {
    res.status(401).send("You need to log in to do that!");
    return;
  }

  const shortURL = req.params.id;
  const filteredURLs = urlsForUser(req.session.user_id, urlDatabase);

  // if the short URL for the user (taken from :id) does not exist send error
  if (!filteredURLs[shortURL]) {
    res.status(401).send("The URL does not exist.");
    return;
  }

  // if user is logged in and the short URL (:id) is the user's, allow to update
  urlDatabase[shortURL].longURL = req.body.update;

  return res.redirect(`/urls/`);
});

// logout - sends response for clearing cookie and redirects to main page
app.post("/logout", (req, res) => {
  // sends response to clear cookie
  req.session = null;
  // console.log(req.session);
  return res.redirect(`/urls`);
});

// register data from register form
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  // save hashed password into variable
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();
  // console.log(users);

  // if email or hashedpassword are empty strings
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

  // add register data to user object (with hashedpassword as password)
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword,
  };
  // console.log("register: ", users);
  // save cookie user_id as key and random string as value
  req.session.user_id = userId;

  // console.log(users);
  return res.redirect(`/urls`);
});

// for login
app.post("/login", (req, res) => {
  // console.log("login: ", users);
  let email = req.body.email;
  // console.log(email);
  let password = req.body.password;
  // need to find user object to access password
  const hashPass = getUserObject(email, users).password;
  console.log(hashPass);
  // if email or hashedpassword are empty strings
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

  // // if passsword doest match in user's database
  // if (!passwordChecker(hashedPassword, users)) {
  //   // send them 403 status code
  //   return res.status(403).send("Wrong password!");
  // }
  // passwordchecker not required as need to check hashed password to normal password using bcrypt, which returns boolean
  if (bcrypt.compareSync(password, hashPass)) {
    // let user id be retrieved
    let userId = getUserByEmail(email, users);
    // console.log(userId);
    // set the user_id cookie with user's id and redirect
    req.session.user_id = userId;
    return res.redirect(`/urls/`);
  }
  return res.status(404).send("Incorrect information");
});
