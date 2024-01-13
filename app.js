/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/todos", (req, res) => {
  res.send("Todo List");
});
app.post("/todos", async (req, res) => {
  console.log("Creating a todo", req.body);
  try {
    const todo = await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
    });
    return res.json(todo);
  } catch (error) {
    console.log(error);
    return res.status(422).json(error);
  }
});
app.put("/todos/:id/markAsCompleted", async (req, res) => {
  console.log("We have to update a todo with the id:", req.params.id);
  try {
    const todo = await Todo.findByPk(req.params.id);
    const updatedTodo = await todo.markAsCompleted();
    return res.json(updatedTodo);
  } catch (error) {
    console.log("Error:", error);
    return res.status(422).json(error);
  }
});
app.delete("/todos/:id", (req, res) => {
  console.log("Delete a todo with the id:", req.params.id);
});

module.exports = app;
