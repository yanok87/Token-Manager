import {
  formatTokenAmount,
  parseTokenAmount,
  formatTokenAmountWithSymbol,
  formatDisplayAmount,
  formatDateTime,
  formatAddress,
} from "../format";

describe("formatTokenAmount", () => {
  it("should format DAI amount correctly (18 decimals)", () => {
    const amount = BigInt("1000000000000000000"); // 1 DAI
    const result = formatTokenAmount(amount, "DAI");
    expect(result).toBe("1");
  });

  it("should format USDC amount correctly (6 decimals)", () => {
    const amount = BigInt("1000000"); // 1 USDC
    const result = formatTokenAmount(amount, "USDC");
    expect(result).toBe("1");
  });

  it("should handle large amounts", () => {
    const amount = BigInt("1000000000000000000000"); // 1000 DAI
    const result = formatTokenAmount(amount, "DAI");
    expect(result).toBe("1000");
  });

  it("should handle small amounts", () => {
    const amount = BigInt("1"); // 0.000000000000000001 DAI
    const result = formatTokenAmount(amount, "DAI");
    expect(result).toBe("0.000000000000000001");
  });
});

describe("parseTokenAmount", () => {
  it("should parse DAI amount correctly (18 decimals)", () => {
    const result = parseTokenAmount("1.0", "DAI");
    expect(result).toBe(BigInt("1000000000000000000"));
  });

  it("should parse USDC amount correctly (6 decimals)", () => {
    const result = parseTokenAmount("1.0", "USDC");
    expect(result).toBe(BigInt("1000000"));
  });

  it("should handle decimal amounts", () => {
    const result = parseTokenAmount("1.5", "DAI");
    expect(result).toBe(BigInt("1500000000000000000"));
  });

  it("should handle large amounts", () => {
    const result = parseTokenAmount("1000.0", "DAI");
    expect(result).toBe(BigInt("1000000000000000000000"));
  });
});

describe("formatTokenAmountWithSymbol", () => {
  it("should format amount with DAI symbol", () => {
    const amount = BigInt("1000000000000000000"); // 1 DAI
    const result = formatTokenAmountWithSymbol(amount, "DAI");
    expect(result).toBe("1 DAI");
  });

  it("should format amount with USDC symbol", () => {
    const amount = BigInt("1000000"); // 1 USDC
    const result = formatTokenAmountWithSymbol(amount, "USDC");
    expect(result).toBe("1 USDC");
  });
});

describe("formatDisplayAmount", () => {
  it("should format number with default 4 decimals", () => {
    expect(formatDisplayAmount("1.123456789")).toBe("1.1235");
  });

  it("should remove trailing zeros", () => {
    expect(formatDisplayAmount("1.5000")).toBe("1.5");
    expect(formatDisplayAmount("1.0000")).toBe("1");
  });

  it("should handle whole numbers", () => {
    expect(formatDisplayAmount("100")).toBe("100");
  });

  it("should handle NaN", () => {
    expect(formatDisplayAmount("invalid")).toBe("0");
  });

  it("should respect custom decimal places", () => {
    expect(formatDisplayAmount("1.123456", 2)).toBe("1.12");
  });
});

describe("formatDateTime", () => {
  it("should format Unix timestamp correctly", () => {
    const timestamp = 1704067200; // Jan 1, 2024 00:00:00 UTC
    const result = formatDateTime(timestamp);
    // The exact format depends on timezone, so just check it's a valid date string
    expect(result).toMatch(/\d{4}/); // Contains a 4-digit year
    expect(result).not.toBe("N/A");
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return "N/A" for undefined timestamp', () => {
    expect(formatDateTime(undefined)).toBe("N/A");
  });

  it('should return "N/A" for null timestamp', () => {
    expect(formatDateTime(null as any)).toBe("N/A");
  });
});

describe("formatAddress", () => {
  it("should format Ethereum address correctly", () => {
    const address = "0x1234567890123456789012345678901234567890";
    const result = formatAddress(address);
    expect(result).toBe("0x1234...7890");
  });

  it("should handle short addresses", () => {
    const address = "0x1234567890";
    const result = formatAddress(address);
    expect(result).toBe("0x1234...7890");
  });

  it("should format correctly for standard 42-character addresses", () => {
    const address = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
    const result = formatAddress(address);
    expect(result).toBe("0xabcd...abcd");
  });
});
