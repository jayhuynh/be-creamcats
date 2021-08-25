import request from "supertest";
import app from "../../app";

describe("GET /dummies", () => {
  test("Success", async () => {
    const response = await request(app).get("/dummies");
    expect(response.statusCode).toBe(200);
  });
});
