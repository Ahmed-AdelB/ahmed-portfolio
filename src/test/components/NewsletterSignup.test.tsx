import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewsletterSignup from "../../components/features/NewsletterSignup";

// Mock fetch
const globalFetch = global.fetch;

describe("NewsletterSignup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = globalFetch;
  });

  it("renders the signup form when not subscribed", () => {
    render(<NewsletterSignup />);
    expect(screen.getByText(/NEWSLETTER_SIGNUP/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter_email_address/i),
    ).toBeInTheDocument();
  });

  it("does not render when already subscribed", () => {
    localStorage.setItem("newsletter_subscribed", "true");
    render(<NewsletterSignup />);
    expect(screen.queryByText(/NEWSLETTER_SIGNUP/i)).not.toBeInTheDocument();
  });

  it("shows error if consent is not checked", async () => {
    render(<NewsletterSignup />);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/enter_email_address/i);
    await user.type(input, "test@example.com");

    const button = screen.getByRole("button", {
      name: /INITIALIZE_SUBSCRIPTION/i,
    });

    // Checkbox is not checked by default
    // We expect the button to be disabled if consent is not checked based on the code:
    // disabled={status === "loading" || status === "success" || !consent}
    expect(button).toBeDisabled();

    // If we force click (or if logic changes), we expect validation error
    // But since it's disabled, we should check that first.
  });

  it("shows error for invalid email", async () => {
    render(<NewsletterSignup />);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/enter_email_address/i);
    await user.type(input, "invalid-email");

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    const button = screen.getByRole("button", {
      name: /INITIALIZE_SUBSCRIPTION/i,
    });
    expect(button).not.toBeDisabled();
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a valid email address/i),
      ).toBeInTheDocument();
    });
  });

  it("handles successful subscription", async () => {
    // Mock successful fetch response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: "Welcome aboard!" }),
    });

    render(<NewsletterSignup />);
    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText(/enter_email_address/i),
      "test@example.com",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: /INITIALIZE_SUBSCRIPTION/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/SUBSCRIBED/i)).toBeInTheDocument();
      expect(localStorage.getItem("newsletter_subscribed")).toBe("true");
    });
  });

  it("handles API error", async () => {
    // Mock error fetch response
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, message: "Email already exists" }),
    });

    render(<NewsletterSignup />);
    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText(/enter_email_address/i),
      "test@example.com",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: /INITIALIZE_SUBSCRIPTION/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
    });
  });
});
