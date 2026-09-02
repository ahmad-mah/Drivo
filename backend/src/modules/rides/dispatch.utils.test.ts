import { describe, expect, it } from "vitest";
import { dispatchRadiusForAttempts, etaMinutesForDistanceKm } from "./dispatch.utils.js";

describe("dispatch radius ladder", () => {
  it("stays at the base rung while offers are fresh", () => {
    expect(dispatchRadiusForAttempts(0)).toBe(3);
    expect(dispatchRadiusForAttempts(1)).toBe(3);
  });

  it("widens every two failed offers", () => {
    expect(dispatchRadiusForAttempts(2)).toBe(6);
    expect(dispatchRadiusForAttempts(3)).toBe(6);
    expect(dispatchRadiusForAttempts(4)).toBe(12);
    expect(dispatchRadiusForAttempts(5)).toBe(12);
  });

  it("caps at the last rung no matter how many failures pile up", () => {
    expect(dispatchRadiusForAttempts(20)).toBe(12);
  });
});

describe("etaMinutesForDistanceKm", () => {
  it("never returns less than one minute", () => {
    expect(etaMinutesForDistanceKm(0.01)).toBe(1);
  });

  it("assumes 30 km/h", () => {
    expect(etaMinutesForDistanceKm(3)).toBe(6);
  });
});
