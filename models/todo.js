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
    }
    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }
    static async getTodos() {
      const dueYes = await this.overdue();
      const dueTod = await this.dueToday();
      const FutureDue = await this.dueLater();
      return {
        dueYes: dueYes.length,
        dueTod: dueTod.length,
        futureDue: FutureDue.length,
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

    static async overdue() {
      const d = new Date();
      const Items = await Todo.findAll({
        where: {
          dueDate: {
            [Op.lt]: d,
          },
        },
      });
      return Items;
    }

    static async dueToday() {
      const d = new Date();
      const Items = await Todo.findAll({
        where: {
          dueDate: {
            [Op.eq]: d,
          },
        },
      });
      return Items;
    }

    static async dueLater() {
      const d = new Date();
      const Items = await Todo.findAll({
        where: {
          dueDate: {
            [Op.gt]: d,
          },
        },
      });
      return Items;
    }

    markAsCompleted() {
      return this.update({ completed: true });
    }
    displayableString() {
      let checkbox = this.completed ? "[x]" : "[ ]";
      return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
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
