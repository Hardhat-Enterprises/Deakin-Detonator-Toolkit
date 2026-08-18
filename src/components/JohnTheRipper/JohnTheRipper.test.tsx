import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import JohnTheRipper, { buildAttackModeArgs, FormValuesType } from "./JohnTheRipper";

// Mock CommandAvailability to avoid Tauri shell execution in tests
vi.mock("../../utils/CommandAvailability", () => ({
    checkAllCommandsAvailability: vi.fn().mockResolvedValue(true),
    checkCommandAvailability: vi.fn().mockResolvedValue(true),
}));

// Mock FilePicker component
vi.mock("../FileHandler/FilePicker", () => ({
    FilePicker: () => <div data-testid="file-picker">FilePicker</div>,
}));

describe("<JohnTheRipper/> component tests", () => {
    it("Component renders correctly with all expanded attack mode options", () => {
        render(
            <MemoryRouter>
                <JohnTheRipper />
            </MemoryRouter>
        );

        expect(screen.getByText("John the Ripper")).toBeTruthy();

        // Get the crack mode select element
        const selects = screen.getAllByRole("combobox");
        const crackModeSelect = selects[0];
        expect(crackModeSelect).toBeTruthy();

        const renderedModeValues = Array.from(crackModeSelect.querySelectorAll("option")).map((o) => o.value);
        const expectedModes = [
            "incremental",
            "dictionary",
            "single",
            "mask",
            "rules",
            "external",
            "markov",
            "loopback",
            "prince",
            "stdin",
        ];

        expect(renderedModeValues).toEqual(expectedModes);
    });

    it("Renders dynamic input fields when different attack modes are selected", () => {
        render(
            <MemoryRouter>
                <JohnTheRipper />
            </MemoryRouter>
        );

        const selects = screen.getAllByRole("combobox");
        const crackModeSelect = selects[0];

        // 1. Incremental Mode: Increment Order dropdown should be visible
        fireEvent.change(crackModeSelect, { target: { value: "incremental" } });
        expect(screen.getByText("Increment Order (Character Set)")).toBeTruthy();

        // 2. Dictionary Mode: Dictionary / Wordlist File Path input should appear
        fireEvent.change(crackModeSelect, { target: { value: "dictionary" } });
        expect(screen.getByText("Dictionary / Wordlist File Path")).toBeTruthy();

        // 3. Mask Mode: Mask Pattern and optional Wordlist Path should appear
        fireEvent.change(crackModeSelect, { target: { value: "mask" } });
        expect(screen.getByText("Mask Pattern")).toBeTruthy();
        expect(screen.getByText("Wordlist File Path (Optional for hybrid mask)")).toBeTruthy();

        // 4. Rules Mode: Wordlist Path and Rule Set should appear
        fireEvent.change(crackModeSelect, { target: { value: "rules" } });
        expect(screen.getByText("Dictionary / Wordlist File Path")).toBeTruthy();
        expect(screen.getByText("Rule Set (Optional)")).toBeTruthy();

        // 5. External Mode: External Mode Name should appear
        fireEvent.change(crackModeSelect, { target: { value: "external" } });
        expect(screen.getByText("External Mode Name")).toBeTruthy();

        // 6. Markov Mode: Markov Level input should appear
        fireEvent.change(crackModeSelect, { target: { value: "markov" } });
        expect(screen.getByText("Markov Level / Threshold (Optional)")).toBeTruthy();

        // 7. Loopback Mode: Potfile Path input should appear
        fireEvent.change(crackModeSelect, { target: { value: "loopback" } });
        expect(screen.getByText("Potfile Path (Optional)")).toBeTruthy();

        // 8. PRINCE Mode: Wordlist Path input should appear
        fireEvent.change(crackModeSelect, { target: { value: "prince" } });
        expect(screen.getByText("Wordlist File Path (Optional)")).toBeTruthy();
    });

    describe("buildAttackModeArgs helper", () => {
        const baseValues: FormValuesType = {
            filePath: "",
            hash: "",
            fileType: "raw",
            mode: "incremental",
            wordList: "",
            incrementOrder: "",
            maskPattern: "",
            ruleSet: "",
            externalMode: "",
            markovLevel: "",
            potFile: "",
        };

        it("builds incremental mode args correctly (default and specific charset)", () => {
            expect(buildAttackModeArgs("incremental", baseValues)).toEqual(["--incremental"]);
            expect(
                buildAttackModeArgs("incremental", {
                    ...baseValues,
                    incrementOrder: "ASCII",
                })
            ).toEqual(["-incremental:ASCII"]);
        });

        it("builds dictionary mode args correctly", () => {
            expect(
                buildAttackModeArgs("dictionary", {
                    ...baseValues,
                    wordList: "/usr/share/wordlists/rockyou.txt",
                })
            ).toEqual(["--wordlist=/usr/share/wordlists/rockyou.txt"]);
        });

        it("builds single crack mode args correctly", () => {
            expect(buildAttackModeArgs("single", baseValues)).toEqual(["--single"]);
        });

        it("builds mask mode args correctly with pure mask and hybrid mask", () => {
            expect(
                buildAttackModeArgs("mask", {
                    ...baseValues,
                    maskPattern: "?u?l?l?l?d?d",
                })
            ).toEqual(["--mask=?u?l?l?l?d?d"]);

            expect(
                buildAttackModeArgs("mask", {
                    ...baseValues,
                    maskPattern: "?d?d?d?d",
                    wordList: "/usr/share/wordlists/rockyou.txt",
                })
            ).toEqual(["--mask=?d?d?d?d", "--wordlist=/usr/share/wordlists/rockyou.txt"]);
        });

        it("builds rules mode args correctly with default and custom rule sets", () => {
            expect(
                buildAttackModeArgs("rules", {
                    ...baseValues,
                    wordList: "/usr/share/wordlists/rockyou.txt",
                })
            ).toEqual(["--wordlist=/usr/share/wordlists/rockyou.txt", "--rules"]);

            expect(
                buildAttackModeArgs("rules", {
                    ...baseValues,
                    wordList: "/usr/share/wordlists/rockyou.txt",
                    ruleSet: "Jumbo",
                })
            ).toEqual(["--wordlist=/usr/share/wordlists/rockyou.txt", "--rules=Jumbo"]);
        });

        it("builds external mode args correctly", () => {
            expect(
                buildAttackModeArgs("external", {
                    ...baseValues,
                    externalMode: "Parallel",
                })
            ).toEqual(["--external=Parallel"]);
        });

        it("builds markov mode args correctly (default and custom level)", () => {
            expect(buildAttackModeArgs("markov", baseValues)).toEqual(["--markov"]);
            expect(
                buildAttackModeArgs("markov", {
                    ...baseValues,
                    markovLevel: "200",
                })
            ).toEqual(["--markov=200"]);
        });

        it("builds loopback mode args correctly (default and custom potfile)", () => {
            expect(buildAttackModeArgs("loopback", baseValues)).toEqual(["--loopback"]);
            expect(
                buildAttackModeArgs("loopback", {
                    ...baseValues,
                    potFile: "/home/kali/custom.pot",
                })
            ).toEqual(["--loopback=/home/kali/custom.pot"]);
        });

        it("builds prince mode args correctly (default and custom wordlist)", () => {
            expect(buildAttackModeArgs("prince", baseValues)).toEqual(["--prince"]);
            expect(
                buildAttackModeArgs("prince", {
                    ...baseValues,
                    wordList: "/usr/share/wordlists/rockyou.txt",
                })
            ).toEqual(["--prince=/usr/share/wordlists/rockyou.txt"]);
        });

        it("builds stdin mode args correctly", () => {
            expect(buildAttackModeArgs("stdin", baseValues)).toEqual(["--stdin"]);
        });
    });
});
