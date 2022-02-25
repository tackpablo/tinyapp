//////////////////////////
// Helper functions
//////////////////////////

function generateRandomString() {
  const result = Math.random().toString(20).substring(2, 8);
  return result;
}

// function to check if a given email already exists in user database
const emailChecker = function (email, usersDatabase) {
  for (const user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return true;
    }
  }
  return false;
};

// checks all urls for user available
const urlsForUser = function (id, urlDatabase) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

// function to retrieve id from email
const getUserByEmail = function (email, usersDatabase) {
  for (const user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return usersDatabase[user].id;
    }
  }
};

// function to retrieve user object from email (to easily access keys inside)
const getUserObject = function (email, usersDatabase) {
  for (const user in usersDatabase) {
    if (usersDatabase[user].email === email) {
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
