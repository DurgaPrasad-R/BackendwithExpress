/* eslint-disable semi */
/* eslint-disable quotes */
const express = require("express");
const app = express();
const todoController = require("./controllers/todoController");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.set("view engine", "ejs");

app.get("/", todoController.getAllTodos);
app.get("/todos", todoController.showList);
app.post("/todos", todoController.addTodo);
app.put("/todos/:id/markAsCompleted", todoController.markAsCompleted);
app.delete("/todos/:id/delete", todoController.deleteTodo);

module.exports = app;
