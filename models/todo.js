"use strict";
const { Model } = require("sequelize");
const { Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }
    static async getTodos(loggedInuser) {
      const dueYes = await this.overdue(loggedInuser);
      const dueTod = await this.dueToday(loggedInuser);
      const FutureDue = await this.dueLater(loggedInuser);
      const TasksDone = await this.completedTasks(loggedInuser);
      return {
        dueYes: dueYes,
        dueTod: dueTod,
        futureDue: FutureDue,
        completedTasks: TasksDone,
      };
    }
    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      const dueYes = await this.overdue();
      dueYes.forEach((item) => {
        console.log(item.displayableString());
      });
      console.log("\n");

      console.log("Due Today");
      const dueTod = await this.dueToday();
      dueTod.forEach((item) => {
        console.log(item.displayableString());
      });
      console.log("\n");

      console.log("Due Later");
      const FutureDue = await this.dueLater();
      FutureDue.forEach((item) => {
        console.log(item.displayableString());
      });
      console.log("\n");
    }

    static async completedTasks(userId) {
      return await Todo.findAll({
        where: {
          completed: true,
          userId,
        },
      });
    }

    static async overdue(userId) {
      const d = new Date();
      const Items = await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: d,
          },
          userId,
          completed: false,
        },
      });
      return Items;
    }

    static async dueToday(userId) {
      const d = new Date();
      const Items = await Todo.findAll({
        where: {
          dueDate: {
            [Op.eq]: d,
          },
          userId,
          completed: false,
        },
      });
      return Items;
    }

    static async dueLater(userId) {
      const d = new Date();
      const Items = await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: d,
          },
          userId,
          completed: false,
        },
      });
      return Items;
    }

    async setCompletionStatus(status) {
      return this.update({ completed: status });
    }

    markAsCompleted() {
      return this.setCompletionStatus(true);
    }
    markAsIncomplete() {
      return this.setCompletionStatus(false);
    }
    displayableString() {
      let checkbox = this.completed ? "[x]" : "[ ]";
      return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
    }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notNull: true, len: 5 },
      },
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    },
  );
  return Todo;
};
