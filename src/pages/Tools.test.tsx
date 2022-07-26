import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Tools from "./Tools";

describe("<Tools/> component tests", () => {
    it("Component renders correctly", () => {
        const component = render(
            <MemoryRouter>
                <Tools />
            </MemoryRouter>
        );
        expect(component.getByText("Tools")).toBeTruthy();
    });
});
