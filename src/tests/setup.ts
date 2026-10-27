import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "../mocks/server.js";
import { resetDb } from "../mocks/db.js";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
    cleanup();
    server.resetHandlers();
    resetDb();
    localStorage.clear();
});

afterAll(() => server.close());
