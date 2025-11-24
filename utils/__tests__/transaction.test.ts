import {
  isUserRejection,
  getEtherscanUrl,
  getErrorMessage,
} from "../transaction";

describe("isUserRejection", () => {
  it("should return true for user rejection message", () => {
    const error = new Error("User rejected the request");
    expect(isUserRejection(error)).toBe(true);
  });

  it("should return true for user denied message", () => {
    const error = new Error("User denied transaction");
    expect(isUserRejection(error)).toBe(true);
  });

  it("should return true for error code 4001", () => {
    const error = new Error("Some error") as any;
    error.code = 4001;
    expect(isUserRejection(error)).toBe(true);
  });

  it('should return true for error code "4001"', () => {
    const error = new Error("Some error") as any;
    error.code = "4001";
    expect(isUserRejection(error)).toBe(true);
  });

  it("should return false for non-user rejection errors", () => {
    const error = new Error("Network error");
    expect(isUserRejection(error)).toBe(false);
  });

  it("should return false for null error", () => {
    expect(isUserRejection(null)).toBe(false);
  });
});

describe("getEtherscanUrl", () => {
  it("should return correct Etherscan URL for Sepolia", () => {
    const txHash =
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as `0x${string}`;
    const result = getEtherscanUrl(txHash);
    expect(result).toBe(
      "https://sepolia.etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    );
  });

  it("should handle different transaction hashes", () => {
    const txHash =
      "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef" as `0x${string}`;
    const result = getEtherscanUrl(txHash);
    expect(result).toBe(
      "https://sepolia.etherscan.io/tx/0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef",
    );
  });
});

describe("getErrorMessage", () => {
  it("should return custom user rejection message", () => {
    const error = new Error("User rejected") as any;
    error.code = 4001;
    const result = getErrorMessage(error, {
      customMessages: {
        userRejection: "Custom rejection message",
      },
    });
    expect(result).toBe("Custom rejection message");
  });

  it("should return default user rejection message", () => {
    const error = new Error("User rejected") as any;
    error.code = 4001;
    const result = getErrorMessage(error);
    expect(result).toBe(
      "Transaction cancelled. You cancelled the request in your wallet.",
    );
  });

  it("should return custom insufficient funds message", () => {
    const error = new Error("insufficient funds for gas");
    const result = getErrorMessage(error, {
      customMessages: {
        insufficientFunds: "Custom insufficient funds message",
      },
    });
    expect(result).toBe("Custom insufficient funds message");
  });

  it("should return default insufficient funds message", () => {
    const error = new Error("insufficient balance");
    const result = getErrorMessage(error);
    expect(result).toBe("Not enough funds. Please check your balance.");
  });

  it("should return error message for other errors", () => {
    const error = new Error("Network error");
    const result = getErrorMessage(error);
    expect(result).toBe("Network error");
  });

  it("should return custom default message", () => {
    const error = new Error("Unknown error");
    const result = getErrorMessage(error, {
      customMessages: {
        default: "Something went wrong",
      },
    });
    expect(result).toBe("Unknown error");
  });

  it("should return empty string for null error", () => {
    expect(getErrorMessage(null)).toBe("");
  });

  it("should handle error without message", () => {
    const error = new Error("");
    const result = getErrorMessage(error, {
      customMessages: {
        default: "Default error",
      },
    });
    expect(result).toBe("Default error");
  });
});
