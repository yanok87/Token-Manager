import { render, screen, waitFor } from "@testing-library/react";
import { ClientDate } from "../ClientDate";
import { formatDateTime } from "@/utils/format";

describe("ClientDate", () => {
  beforeEach(() => {
    // Reset any timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should display "N/A" when timestamp is undefined', () => {
    render(<ClientDate timestamp={undefined} />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it('should display "N/A" when timestamp is 0', () => {
    render(<ClientDate timestamp={0} />);
    // 0 is falsy, so it should show N/A
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("should display formatted date (component mounts immediately in test)", () => {
    const timestamp = 1234567890; // Feb 13, 2009
    render(<ClientDate timestamp={timestamp} />);

    // In test environment, useEffect runs immediately, so we see formatted date
    // The ISO string is only shown during SSR, which doesn't happen in tests
    const formattedDate = formatDateTime(timestamp);
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  it("should display formatted date after mount", async () => {
    const timestamp = 1234567890; // Feb 13, 2009, 23:31:30 UTC
    render(<ClientDate timestamp={timestamp} />);

    // Wait for useEffect to run (component to mount)
    await waitFor(() => {
      const formattedDate = formatDateTime(timestamp);
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });
  });

  it("should format date correctly for different timestamps", async () => {
    // Test with a known timestamp: Jan 1, 2024, 12:00:00 UTC
    const timestamp = 1704067200;
    render(<ClientDate timestamp={timestamp} />);

    await waitFor(() => {
      const formattedDate = formatDateTime(timestamp);
      expect(screen.getByText(formattedDate)).toBeInTheDocument();

      // Check that the formatted date contains expected parts
      const text = screen.getByText(/\w{3} \d{1,2}, \d{4},/);
      expect(text).toBeInTheDocument();
    });
  });

  it("should handle midnight correctly (12:00 AM)", async () => {
    // Jan 1, 2024, 00:00:00 UTC
    const timestamp = 1704067200;
    render(<ClientDate timestamp={timestamp} />);

    await waitFor(() => {
      const formattedDate = formatDateTime(timestamp);
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
      // Should contain AM or PM
      expect(screen.getByText(/AM|PM/)).toBeInTheDocument();
    });
  });

  it("should handle noon correctly (12:00 PM)", async () => {
    // Jan 1, 2024, 12:00:00 UTC
    const timestamp = 1704105600;
    render(<ClientDate timestamp={timestamp} />);

    await waitFor(() => {
      const formattedDate = formatDateTime(timestamp);
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });
  });

  it("should format all months correctly", async () => {
    // Test each month - use UTC timestamps to avoid timezone issues
    const months = [
      { name: "Jan", timestamp: 1704067200 }, // Jan 1, 2024 00:00:00 UTC
      { name: "Feb", timestamp: 1706745600 }, // Feb 1, 2024 00:00:00 UTC
      { name: "Mar", timestamp: 1709251200 }, // Mar 1, 2024 00:00:00 UTC
      { name: "Apr", timestamp: 1711929600 }, // Apr 1, 2024 00:00:00 UTC
      { name: "May", timestamp: 1714521600 }, // May 1, 2024 00:00:00 UTC
      { name: "Jun", timestamp: 1717200000 }, // Jun 1, 2024 00:00:00 UTC
      { name: "Jul", timestamp: 1719792000 }, // Jul 1, 2024 00:00:00 UTC
      { name: "Aug", timestamp: 1722470400 }, // Aug 1, 2024 00:00:00 UTC
      { name: "Sep", timestamp: 1725148800 }, // Sep 1, 2024 00:00:00 UTC
      { name: "Oct", timestamp: 1727740800 }, // Oct 1, 2024 00:00:00 UTC
      { name: "Nov", timestamp: 1730419200 }, // Nov 1, 2024 00:00:00 UTC
      { name: "Dec", timestamp: 1733011200 }, // Dec 1, 2024 00:00:00 UTC
    ];

    for (const { timestamp, name } of months) {
      const { unmount } = render(<ClientDate timestamp={timestamp} />);

      await waitFor(() => {
        const formattedDate = formatDateTime(timestamp);
        expect(screen.getByText(formattedDate)).toBeInTheDocument();
        // Check that the month name appears in the formatted date
        const date = new Date(timestamp * 1000);
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const expectedMonth = monthNames[date.getMonth()];
        expect(formattedDate).toContain(expectedMonth);
      });

      unmount();
    }
  });

  it("should pad minutes and seconds with zeros", async () => {
    // Jan 1, 2024, 12:05:03 UTC
    const timestamp = 1704105903;
    render(<ClientDate timestamp={timestamp} />);

    await waitFor(() => {
      const formattedDate = formatDateTime(timestamp);
      expect(screen.getByText(formattedDate)).toBeInTheDocument();

      // Should contain properly padded minutes and seconds (format: HH:MM:SS)
      const date = new Date(timestamp * 1000);
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const seconds = date.getSeconds().toString().padStart(2, "0");
      expect(formattedDate).toContain(`:${minutes}:${seconds}`);
    });
  });

  it("should handle single digit hours correctly (converts to 12-hour format)", async () => {
    // Use a timestamp that results in a single digit hour in local timezone
    // Jan 1, 2024, 01:00:00 UTC
    const timestamp = 1704067200 + 3600;
    render(<ClientDate timestamp={timestamp} />);

    await waitFor(() => {
      const formattedDate = formatDateTime(timestamp);
      expect(screen.getByText(formattedDate)).toBeInTheDocument();

      // Should show hours in 12-hour format with AM/PM
      expect(formattedDate).toMatch(/AM|PM/);
      // Should have properly formatted time (HH:MM:SS)
      expect(formattedDate).toMatch(/\d{2}:\d{2}:\d{2}/);
    });
  });
});
