import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "../../pages/signup";
import * as ReactRouterDom from "react-router-dom";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

describe("Signup Behavior Tests", () => {
    let navigateMock: jest.Mock;
    beforeEach(() => {
        navigateMock = jest.fn();
        (ReactRouterDom.useNavigate as jest.Mock).mockReturnValue(navigateMock);
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Shows an error if passwords do not match", async () => {
        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByPlaceholderText("John"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("Doe"), { target: { value: "Doe" } });
        fireEvent.change(screen.getByPlaceholderText("example@learnlink.com"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("john_doe123"), {
            target: { value: "existing_user" },
        });

        fireEvent.change(screen.getByTestId("su-password"), {
            target: { value: "password123" },
        });
        fireEvent.change(screen.getByTestId("su-rt-password"), {
            target: { value: "password456" },
        });

        fireEvent.click(screen.getByTestId("su-button"));

        await waitFor(() => {
            expect(screen.getByText("\* Passwords do not match")).toBeInTheDocument();
        });
    });

    test("Shows error if username is already taken", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: "UsernameAlreadyExists" }),
        });

        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("John"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("Doe"), { target: { value: "Doe" } });
        fireEvent.change(screen.getByPlaceholderText("example@learnlink.com"), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("john_doe123"), {
            target: { value: "existing_user" },
        });
        fireEvent.change(screen.getByTestId("su-password"), {
            target: { value: "password123" },
        });
        fireEvent.change(screen.getByTestId("su-rt-password"), {
            target: { value: "password123" },
        });

        fireEvent.click(screen.getByTestId("su-button"));

        await waitFor(() => {
            expect(screen.getByText("* Username is already taken")).toBeInTheDocument();
        });
    });

    test("Successfully signs up and navigates to landing page", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: "fake-jwt-token" }),
        });

        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("John"), { target: { value: "John" } });
        fireEvent.change(screen.getByPlaceholderText("Doe"), { target: { value: "Doe" } });
        fireEvent.change(screen.getByPlaceholderText("example@learnlink.com"), {
            target: { value: "newuser@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("john_doe123"), {
            target: { value: "new_user" },
        });
        fireEvent.change(screen.getByTestId("su-password"), {
            target: { value: "password123" },
        });
        fireEvent.change(screen.getByTestId("su-rt-password"), {
            target: { value: "password123" },
        });

        fireEvent.click(screen.getByTestId("su-button"));

        await waitFor(() => {
            expect(localStorage.getItem("token")).toBe("fake-jwt-token");
            expect(navigateMock).toHaveBeenCalledWith("/LandingPage");
        });
    });
});
