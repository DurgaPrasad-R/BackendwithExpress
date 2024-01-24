/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable quotes */
const express = require("express");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const app = express();
const todoController = require("./controllers/todoController");
const bodyParser = require("body-parser");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const path = require("path");
const { User } = require("./models");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(
  session({
    secret: "super-secret-12345678765432",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({
        where: {
          email: username,
        },
      })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) return done(null, user);
          else return done(null, false, { message: "Invalid password" });
        })
        .catch((error) => {
          return done(error);
        });
    },
  ),
);

passport.serializeUser((user, done) => {
  console.log("Serializing the user:", user.id);
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});
app.get("/", todoController.getAllTodos);
app.get("/signup", todoController.signup);
app.get("/login", todoController.getLogin);
app.get("/signout", todoController.getSignout);
app.get("/todos", connectEnsureLogin.ensureLoggedIn(), todoController.showList);
app.post("/todos", connectEnsureLogin.ensureLoggedIn(), todoController.addTodo);
app.post("/users", todoController.addUsers);
app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  todoController.getSession,
);
app.put(
  "/todos/:id",
  connectEnsureLogin.ensureLoggedIn(),
  todoController.updateTodoCompletion,
);
app.delete(
  "/todos/:id/delete",
  connectEnsureLogin.ensureLoggedIn(),
  todoController.deleteTodo,
);

module.exports = app;
