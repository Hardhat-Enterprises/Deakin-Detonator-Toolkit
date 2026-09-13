import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("<App/> component tests", () => {
    it("Component renders correctly", () => {
        const component = render(
            <MemoryRouter>
                <App />
            </MemoryRouter>,
        );
        expect(component.getByText("Deakin Detonator Toolkit")).toBeTruthy();
    });
});
