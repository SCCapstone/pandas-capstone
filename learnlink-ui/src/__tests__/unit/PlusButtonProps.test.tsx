import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PlusButton from "../../components/PlusButtonProps"; // adjust the import if needed

jest.mock('axios', () => ({
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
    },
  }));
  
describe("PlusButton component", () => {
  const mockOnSelect = jest.fn();
  const mockOnSendButtonMessage = jest.fn();

  const setup = (props = {}) => {
    render(
      <PlusButton
        onSelect={mockOnSelect}
        studyGroupId={1}
        selectedChatId={1}
        onSendButtonMessage={mockOnSendButtonMessage}
        {...props}
      />
    );
  };

  it("renders PlusButton and opens the menu", () => {
    setup();
    const button = screen.getByRole("button", { name: "Open menu" }); 
    fireEvent.click(button);
    expect(screen.getByText("Weekly Scheduler")).toBeInTheDocument();
    expect(screen.getByText("Calendar Event")).toBeInTheDocument();
  });

  it("disables Weekly Scheduler when studyGroupId is null", () => {
    setup({ studyGroupId: null });
    const plusButton = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(plusButton);
    const weeklyScheduler = screen.getByText("Weekly Scheduler");
    expect(weeklyScheduler.closest("button")).toBeDisabled();
  });

  it("opens calendar modal when Calendar Event is selected", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(screen.getByText("Calendar Event"));
    await waitFor(() => {
      expect(screen.getByText("Create Calendar Event")).toBeInTheDocument();
    });
  });

  it("calls onSendButtonMessage when Weekly Scheduler is clicked", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(screen.getByText("Weekly Scheduler"));
    expect(mockOnSendButtonMessage).toHaveBeenCalledWith({
      action: "weekly-scheduler",
      studyGroupId: 1,
      label: "📅 Open Weekly Scheduler",
    });
  });
});
