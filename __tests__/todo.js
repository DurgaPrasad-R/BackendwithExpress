/* eslint-disable comma-dangle */
/* eslint-disable semi */
/* eslint-disable quotes */
const request = require("supertest");
const cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;
// eslint-disable-next-line space-before-function-paren
function extractCsrfToken(res) {
  const $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
describe("Todos test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });
  test("create a new todo", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });
  test("Mark todo as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy Milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedgroupedTodosResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedgroupedTodosResponse.dueToday.length;
    const latestTodo = parsedgroupedTodosResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponse = await agent
      .put(`/todos/${latestTodo.id}/markAsCompleted`)
      .send({
        _csrf: csrfToken,
      });
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });
  // test("should delete the record", async () => {
  //   const response = await agent.post("/todos").send({
  //     title: "Buy Chocolates",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   expect(response.statusCode).toBe(200);
  //   const parsedResponse = JSON.parse(response.text);
  //   const todoID = parsedResponse.id;
  //   const deletedRecord = await agent.delete(`/todos/${todoID}/delete`).send();
  //   const parsedResponseDel = JSON.parse(deletedRecord.text);
  //   expect(parsedResponseDel.success).toBe(true);
  // });
});
