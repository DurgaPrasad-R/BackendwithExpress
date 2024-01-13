/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable quotes */
const request = require("supertest");

const db = require("../models/index");
const app = require("../app");

let server, agent;
describe("Todos test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });
  test("responds with json at /todos", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(200);
    expect(response.header["content-type"]).toBe(
      "application/json; charset=utf-8",
    );
    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.id).toBeDefined();
  });
  test("Mark todo as complete", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;
    expect(parsedResponse.completed).toBe(false);
    const markAsCompletedResponse = await agent
      .put(`/todos/${todoID}/markAsCompleted`)
      .send();
    const parseUpdatedResponse = JSON.parse(markAsCompletedResponse.text);
    expect(parseUpdatedResponse.completed).toBe(true);
  });
  test("should delete the record", async () => {
    const response = await agent.post("/todos").send({
      title: "Buy Chocolates",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(200);
    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;
    const deletedRecord = await agent.delete(`/todos/${todoID}/delete`).send();
    const parsedResponseDel = JSON.parse(deletedRecord.text);
    expect(parsedResponseDel.success).toBe(true);
  });
});
