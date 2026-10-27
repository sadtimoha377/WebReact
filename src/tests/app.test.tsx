import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { renderApp } from "./render-app.js";

describe("Service requests app", () => {
    it("user can log in and sees own requests", async () => {
        const user = userEvent.setup();
        renderApp("/login");

        await user.type(await screen.findByLabelText("Email"), "user@example.com");
        await user.type(screen.getByLabelText("Password"), "user123");
        await user.click(screen.getByRole("button", { name: "Sign in" }));

        expect(await screen.findByText("Welcome, John Smith")).toBeTruthy();
        expect(await screen.findByRole("heading", { name: "My requests" })).toBeTruthy();
        expect(await screen.findByText("#1 Printer does not print", {}, { timeout: 3000 })).toBeTruthy();
        expect(localStorage.getItem("token")).toBe("mock-token-1");
        expect(localStorage.getItem("role")).toBe("user");
    });

    it("user can create a request and is redirected to its card", async () => {
        localStorage.setItem("token", "mock-token-1");
        localStorage.setItem("role", "user");
        const user = userEvent.setup();
        renderApp("/requests/new");

        await user.type(await screen.findByLabelText("Title"), "Keyboard is broken");
        await user.type(screen.getByLabelText("Description"), "Some keys do not work");
        await user.selectOptions(screen.getByLabelText("Category"), "1");
        await user.selectOptions(screen.getByLabelText("Priority"), "3");
        await user.type(screen.getByLabelText("Contact name"), "John Smith");
        await user.type(screen.getByLabelText("Contact phone"), "+380501112233");
        await user.type(screen.getByLabelText("Contact email"), "user@example.com");
        await user.click(screen.getByRole("button", { name: "Create request" }));

        expect(await screen.findByText("Request #6 created")).toBeTruthy();
        expect(await screen.findByRole("heading", { name: "#6 Keyboard is broken" })).toBeTruthy();
        expect(await screen.findByText(/Created -> New \(John Smith\)/)).toBeTruthy();
    });

    it("operator can change request status", async () => {
        localStorage.setItem("token", "mock-token-2");
        localStorage.setItem("role", "operator");
        const user = userEvent.setup();
        renderApp("/requests/1");

        expect(await screen.findByRole("heading", { name: "#1 Printer does not print" })).toBeTruthy();
        await user.selectOptions(await screen.findByLabelText("Change status:"), "3");
        await user.click(screen.getByRole("button", { name: "Save status" }));

        expect(await screen.findByText('Status changed to "Resolved"')).toBeTruthy();
        expect(await screen.findByText(/In progress -> Resolved \(Olga Operator\)/)).toBeTruthy();
    });
});
