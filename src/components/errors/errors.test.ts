import request from "supertest";
import app from "../../app";

describe("GET /thisrouteisnotreal", () => {
  test("Success", async () => {
    const response = await request(app).get("/thisrouteisnotreal");
    expect(response.statusCode).toBe(404);
  });
});
