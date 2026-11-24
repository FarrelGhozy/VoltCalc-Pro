import { TARIFF_RATES, DEFAULT_APPLIANCES } from "../src/tariffs.js";

export function GET() {
  return Response.json({
    tariffs: TARIFF_RATES,
    defaultAppliances: DEFAULT_APPLIANCES,
  });
}
