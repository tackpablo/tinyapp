# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

#### Home Page

!["Home Page"](https://github.com/tackpablo/tinyapp/blob/master/docs/Main.png)

#### Login Page

!["Login Page"](https://github.com/tackpablo/tinyapp/blob/master/docs/Login.png)

#### Register Page

!["Register Page"](https://github.com/tackpablo/tinyapp/blob/master/docs/Register.png)

#### URL List Page

!["URL List Page"](https://github.com/tackpablo/tinyapp/blob/master/docs/List.png)

#### Create URL Page

!["Create URL Page"](https://github.com/tackpablo/tinyapp/blob/master/docs/Create.png)

#### Edit URL Page

!["Edit URL Page"](https://github.com/tackpablo/tinyapp/blob/master/docs/Edit.png)

# Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

# Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

# How to use TinyApp

### Register + Login

- Users must register and log in before being able to view/edit links.
- Register with an email and password.

### Create New Links

- Use the Create New URL link in the navigation bar to create short link.
- Enter a URL you want to shorten.

### Edit/Delete Short Links

- Edit/delete short links in My URLs page (via navigation bar).
- You can delete via the button.
- You can edit the long URL (it will retain the shortened URL).

### Use Short Links

- You can use the shortlink by using the path /u/:shortlink. This will redirect to the long URL.
- Long URL can also be accessed via the edit page and clicking on the short URL.
