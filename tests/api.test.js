import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { createServer } from "../server.js";
import { GET as getInit } from "../api/init.js";
import { POST as postCalculateKwh } from "../api/calculate-kwh.js";
import { POST as postEstimateAppliances } from "../api/estimate-appliances.js";

let server;
let baseUrl;

beforeAll(() => {
  server = createServer(0); // Port acak agar tidak bentrok di runner CI
  baseUrl = `http://localhost:${server.port}`;
});

afterAll(() => {
  server.stop(true);
});

describe("Integration Test - API Endpoints", () => {
  test("POST /api/estimate-appliances mengembalikan status 200 dan breakdown valid", async () => {
    const response = await fetch(`${baseUrl}/api/estimate-appliances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tariffKey: "R1_1300",
        ppjPercent: 3,
        appliances: [
          { name: "PC Gaming", watt: 450, hoursPerDay: 4, qty: 1, daysPerMonth: 30 },
        ],
      }),
    });

    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.summary.kwh).toBe(54);
  });

  test("POST /api/estimate-appliances mengembalikan status 400 jika data negatif", async () => {
    const response = await fetch(`${baseUrl}/api/estimate-appliances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tariffKey: "R1_1300",
        appliances: [{ name: "Error Device", watt: -100, hoursPerDay: 5, qty: 1 }],
      }),
    });

    expect(response.status).toBe(400);
  });
});

describe("Serverless Handlers - Vercel API Endpoints", () => {
  test("GET /api/init mengembalikan daftar tarif dan preset peralatan", async () => {
    const response = getInit();
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.tariffs.R1_1300).toBeDefined();
    expect(Array.isArray(json.defaultAppliances)).toBe(true);
  });

  test("POST /api/calculate-kwh menghitung tagihan kWh valid", async () => {
    const req = new Request("http://localhost/api/calculate-kwh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kwh: 100, tariffKey: "R1_1300", ppjPercent: 3 }),
    });
    const response = await postCalculateKwh(req);
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.kwh).toBe(100);
  });

  test("POST /api/estimate-appliances menghitung estimasi peralatan valid", async () => {
    const req = new Request("http://localhost/api/estimate-appliances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tariffKey: "R1_1300",
        ppjPercent: 3,
        appliances: [
          { name: "PC Gaming", watt: 450, hoursPerDay: 4, qty: 1, daysPerMonth: 30 },
        ],
      }),
    });
    const response = await postEstimateAppliances(req);
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.summary.kwh).toBe(54);
  });
});