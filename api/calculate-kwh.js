import { calculateBillFromKwh } from "../src/calculator.js";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = calculateBillFromKwh(
      Number(body.kwh),
      body.tariffKey,
      Number(body.ppjPercent ?? 3)
    );
    return Response.json({ success: true, data: result });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 400 });
  }
}
