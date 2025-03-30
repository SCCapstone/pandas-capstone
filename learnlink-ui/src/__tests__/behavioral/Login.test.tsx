import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../../pages/login";
import * as ReactRouterDom from "react-router-dom";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

describe("Login Behavioral Tests", () => {
    let navigateMock: jest.Mock;

    beforeEach(() => {
        navigateMock = jest.fn();
        (ReactRouterDom.useNavigate as jest.Mock).mockReturnValue(navigateMock);
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Shows an error if the credentials do not match", async () => {
        // Mocking an invalid login response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: "Invalid Credentials" }),
        });
    
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
    
        fireEvent.change(screen.getByPlaceholderText("JohnDoe123"), { 
            target: { value: "existing_user" } 
        });
        fireEvent.change(screen.getByTestId("testpassword"), {
            target: { value: "password123" } 
        });
    
        fireEvent.click(screen.getByTestId("testbutton"));
    
        await waitFor(() => {
            // Target the error inside the alert box specifically
            expect(screen.getByText("Invalid username or password.")).toBeInTheDocument();
        });
    });    

    test("Successfully logs in and navigates to landing page", async () => {
        // Mocking a successful login response with a fake token
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: "fake-jwt-token" }),
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("JohnDoe123"), { 
            target: { value: "existing_user" } 
        });
        fireEvent.change(screen.getByTestId("testpassword"), { 
            target: { value: "password123" } 
        });

        fireEvent.click(screen.getByTestId("testbutton"));

        await waitFor(() => {
            expect(localStorage.getItem("token")).toBe("fake-jwt-token");
            expect(navigateMock).toHaveBeenCalledWith("/swiping");
        });
    });
});

/* Test cases has failed/Needs fixing */
