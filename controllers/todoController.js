/* eslint-disable no-undef */
/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable quotes */
const { Todo, User } = require("../models");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const todoController = {
  signup: (req, res) => {
    res.render("signup", { csrfToken: req.csrfToken() });
  },
  addUsers: async (req, res) => {
    const hasedPwd = await bcrypt.hash(req.body.password, saltRounds);
    console.log(hasedPwd);
    try {
      const user = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hasedPwd,
      });
      req.login(user, (err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/todos");
      });
    } catch (error) {
      console.log(error);
    }
  },
  getLogin: (req, res) => {
    res.render("login", { csrfToken: req.csrfToken() });
  },
  getSignout: (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  },
  getSession: (req, res) => {
    res.redirect("/todos");
  },
  getAllTodos: async (req, res) => {
    res.render("index", {
      csrfToken: req.csrfToken(),
    });
  },

  showList: async (req, res) => {
    try {
      const loggedInuser = req.user.id;
      const dues = await Todo.getTodos(loggedInuser);
      if (req.accepts("html")) {
        res.render("todos", {
          OverDue: dues.dueYes,
          dueToday: dues.dueTod,
          futureDue: dues.futureDue,
          completedTasks: dues.completedTasks,
          csrfToken: req.csrfToken(),
        });
      } else {
        res.json({
          OverDue: dues.dueYes,
          dueToday: dues.dueTod,
          futureDue: dues.futureDue,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  addTodo: async (req, res) => {
    console.log("Creating a todo", req.body);
    try {
      await Todo.addTodo({
        title: req.body.title,
        dueDate: req.body.dueDate,
        userId: req.user.id,
      });
      return res.redirect("/todos");
    } catch (error) {
      console.log(error);
      return res.status(422).json(error);
    }
  },

  updateTodoCompletion: async (req, res) => {
    try {
      const todo = await Todo.findByPk(req.params.id);
      let todoCompletion;
      if (todo.completed) {
        todoCompletion = await todo.markAsIncomplete();
      } else {
        todoCompletion = await todo.markAsCompleted();
      }
      return res.json(todoCompletion);
    } catch (error) {
      console.log(error);
      return res.status(422).json(error);
    }
  },

  markAsCompleted: async (req, res) => {
    console.log("We have to update a todo with the id:", req.params.id);
    try {
      const todo = await Todo.findByPk(req.params.id);
      const updatedTodo = await todo.markAsCompleted();
      return res.json(updatedTodo);
    } catch (error) {
      console.log("Error:", error);
      return res.status(422).json(error);
    }
  },

  deleteTodo: async (req, res) => {
    console.log("Delete a todo with the id:", req.params.id);
    const deleteId = req.params.id;

    try {
      const todo = await Todo.findByPk(deleteId);
      const deletedTodo = await todo.destroy();

      if (deletedTodo) {
        // console.log(true);
        res.json({
          success: true,
          data: deletedTodo,
          message: "Todo deleted successfully",
        });
      } else {
        res.json({ success: false, error: "Deletion failed" });
      }
    } catch (error) {
      console.error("Error:", error);
      return res
        .status(422)
        .json({ success: false, error: "Unprocessable Entity" });
    }
  },
};

module.exports = todoController;
