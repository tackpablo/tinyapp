//HELPER FUNCTIONS

// function to generate random 6 digit string
function generateRandomString() {
  // Math.random = random number between 0-1, toString to change numbers to random string + number, substring returns 6 characters
  const result = Math.random().toString(20).substring(2, 8);
  return result;
}

// function to check if a given email already exists
const emailChecker = function (email, usersDatabase) {
  // loop through users in dtabse
  for (const user in usersDatabase) {
    // if email exists in database
    if (usersDatabase[user].email === email) {
      return true;
    }
  }
  return false;
};

// // bcrypt will replace this function
// // function to check if a given password already exists
// const passwordChecker = function (password, users) {
//   // loop through users in user object
//   for (const user in users) {
//     // if user's email === email
//     if (users[user].password === password) {
//       return true;
//     }
//   }
//   return false;
// };

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

// function to retrieve id from email
const getUserByEmail = function (email, usersDatabase) {
  // loop through users in user object
  for (const user in usersDatabase) {
    // if user's email === email
    if (usersDatabase[user].email === email) {
      // return that user's password
      return usersDatabase[user].id;
    }
  }
};

// function to retrieve user object from email
const getUserObject = function (email, usersDatabase) {
  // loop through users in user object
  for (const user in usersDatabase) {
    // if user's email === email
    if (usersDatabase[user].email === email) {
      // return that user's password
      return usersDatabase[user];
    }
  }
};

module.exports = {
  generateRandomString,
  emailChecker,
  urlsForUser,
  getUserByEmail,
  getUserObject,
};
