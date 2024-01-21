/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable quotes */
const { Todo } = require("../models");

const todoController = {
  getAllTodos: async (req, res) => {
    try {
      const dueSizes = await Todo.getTodos();
      res.render("index", { dueSizes });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  showList: async (req, res) => {
    try {
      await Todo.showList();
      res.send("Todo Displayed in console.");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  addTodo: async (req, res) => {
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

      if (!todo) {
        return res
          .status(404)
          .json({ success: false, error: "Todo not found" });
      }

      const deletedTodo = await todo.destroy();

      if (deletedTodo) {
        console.log(true);
        res.json({
          success: true,
          data: deletedTodo,
          message: "Todo deleted successfully",
        });
      } else {
        console.log(false);
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
