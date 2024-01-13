/* eslint-disable semi */
/* eslint-disable comma-dangle */
/* eslint-disable quotes */
const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/todos", async (req, res) => {
  try {
    await Todo.showList();
    res.send("Todo Displayed in console.");
  } catch (error) {
    console.log(error);
  }
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
app.delete("/todos/:id/delete", async (req, res) => {
  console.log("Delete a todo with the id:", req.params.id);
  const deleteId = req.params.id;

  try {
    const todo = await Todo.findByPk(deleteId);

    if (!todo) {
      return res
        .status(404)
        .json({ success: false, message: "Todo not found" });
    }

    const deletedTodo = await todo.destroy();

    if (deletedTodo) {
      console.log(true);
      res.json({ success: true, message: "Todo deleted successfully" });
    } else {
      console.log(false);
      res.json({ success: false, message: "Deletion failed" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(422)
      .json({ success: false, error: "Unprocessable Entity" });
  }
});

module.exports = app;
