import { describe, it, expect } from "vitest";
import { normalizePath, validateFilePath, validateOutputDirectory, validateTimeout } from "./eyewitness";

describe("EyeWitness Validation & Path Sanitization", () => {
    describe("normalizePath", () => {
        it("returns empty string for empty or whitespace input", () => {
            expect(normalizePath("")).toBe("");
            expect(normalizePath("   ")).toBe("");
        });

        it("preserves root directory", () => {
            expect(normalizePath("/")).toBe("/");
            expect(normalizePath("///")).toBe("/");
        });

        it("collapses duplicate slashes and strips trailing slashes", () => {
            expect(normalizePath("//home//kali///Desktop/")).toBe("/home/kali/Desktop");
            expect(normalizePath("/var/log/")).toBe("/var/log");
        });

        it("resolves relative '.' and '..' segments correctly", () => {
            expect(normalizePath("/home/kali/scans/../Desktop")).toBe("/home/kali/Desktop");
            expect(normalizePath("/home/kali/./Desktop")).toBe("/home/kali/Desktop");
            expect(normalizePath("/home/kali/a/b/../../Desktop")).toBe("/home/kali/Desktop");
        });
    });

    describe("validateFilePath", () => {
        it("rejects empty or whitespace paths", () => {
            expect(validateFilePath("")).toBe("File path is required.");
            expect(validateFilePath("   ")).toBe("File path is required.");
        });

        it("rejects relative paths", () => {
            expect(validateFilePath("urls.txt")).toBe("File path must be an absolute path (start with /).");
            expect(validateFilePath("Desktop/urls.txt")).toBe("File path must be an absolute path (start with /).");
        });

        it("rejects root directory", () => {
            expect(validateFilePath("/")).toBe("File path cannot be the root directory.");
        });

        it("rejects directories ending with a slash", () => {
            expect(validateFilePath("/home/kali/Desktop/")).toBe("File path must point to a file, not a directory.");
        });

        it("accepts valid absolute file paths", () => {
            expect(validateFilePath("/home/kali/Desktop/urls.txt")).toBeNull();
            expect(validateFilePath("/tmp/targets.txt")).toBeNull();
            expect(validateFilePath("/var/data/urls.csv")).toBeNull();
        });
    });

    describe("validateOutputDirectory", () => {
        it("rejects empty or whitespace directories", () => {
            expect(validateOutputDirectory("")).toBe("Output directory is required.");
            expect(validateOutputDirectory("   ")).toBe("Output directory is required.");
        });

        it("rejects relative directory paths", () => {
            expect(validateOutputDirectory("results")).toBe(
                "Output directory must be an absolute path (start with /)."
            );
            expect(validateOutputDirectory("./results")).toBe(
                "Output directory must be an absolute path (start with /)."
            );
        });

        it("rejects root directory", () => {
            expect(validateOutputDirectory("/")).toBe("Output directory cannot be the root directory.");
            expect(validateOutputDirectory("///")).toBe("Output directory cannot be the root directory.");
        });

        it("rejects system directories to prevent catastrophic purge", () => {
            expect(validateOutputDirectory("/etc")).toBe("Output directory cannot be a system directory (/etc).");
            expect(validateOutputDirectory("/usr")).toBe("Output directory cannot be a system directory (/usr).");
            expect(validateOutputDirectory("/tmp")).toBe("Output directory cannot be a system directory (/tmp).");
            expect(validateOutputDirectory("/var")).toBe("Output directory cannot be a system directory (/var).");
            expect(validateOutputDirectory("/bin")).toBe("Output directory cannot be a system directory (/bin).");
            expect(validateOutputDirectory("/home")).toBe("Output directory cannot be a system directory (/home).");
            expect(validateOutputDirectory("/root")).toBe("Output directory cannot be a system directory (/root).");
        });

        it("rejects user home root directories", () => {
            expect(validateOutputDirectory("/home/kali")).toContain("cannot be the user home directory");
            expect(validateOutputDirectory("/home/user")).toContain("cannot be the user home directory");
        });

        it("rejects common user folders (Desktop, Documents, Downloads, etc.)", () => {
            expect(validateOutputDirectory("/home/kali/Desktop")).toContain(
                "cannot be a common user folder (/home/kali/Desktop)"
            );
            expect(validateOutputDirectory("/home/kali/Downloads")).toContain(
                "cannot be a common user folder (/home/kali/Downloads)"
            );
            expect(validateOutputDirectory("/home/kali/Documents")).toContain(
                "cannot be a common user folder (/home/kali/Documents)"
            );
            expect(validateOutputDirectory("/root/Desktop")).toContain(
                "cannot be a common user folder (/root/Desktop)"
            );
        });

        it("rejects Deakin-Detonator-Toolkit application directories", () => {
            expect(validateOutputDirectory("/home/kali/Desktop/Deakin-Detonator-Toolkit")).toBe(
                "Output directory cannot be within the Deakin-Detonator-Toolkit directory."
            );
            expect(validateOutputDirectory("/home/kali/Deakin-Detonator-Toolkit/output")).toBe(
                "Output directory cannot be within the Deakin-Detonator-Toolkit directory."
            );
        });

        it("reproduces and prevents Issue #1781 (Desktop output containing input file & app)", () => {
            const inputFilePath = "/home/kali/Desktop/urls.txt";
            const outputDirectory = "/home/kali/Desktop";

            const error = validateOutputDirectory(outputDirectory, inputFilePath);
            expect(error).not.toBeNull();
            // Both Desktop protection and input file containment are triggered
            expect(error).toContain("Desktop");
        });

        it("rejects output directory containing the input file in custom directories", () => {
            const inputFilePath = "/home/kali/custom_scans/targets.txt";
            const outputDirectory = "/home/kali/custom_scans";

            const error = validateOutputDirectory(outputDirectory, inputFilePath);
            expect(error).toBe(
                "Output directory contains the input file. EyeWitness purges the output directory before scanning; please specify a dedicated directory separate from the input file."
            );
        });

        it("rejects output directory matching the input file path exactly", () => {
            const path = "/home/kali/scans/results";
            expect(validateOutputDirectory(path, path)).toBe(
                "Output directory cannot be the same as the input file path."
            );
        });

        it("resolves relative path segments before validating", () => {
            expect(validateOutputDirectory("/home/kali/Desktop/../Desktop")).toContain(
                "cannot be a common user folder (/home/kali/Desktop)"
            );
            expect(validateOutputDirectory("/home/kali/Desktop/")).toContain(
                "cannot be a common user folder (/home/kali/Desktop)"
            );
        });

        it("accepts safe, dedicated output subdirectories", () => {
            const inputFilePath = "/home/kali/Desktop/urls.txt";

            expect(validateOutputDirectory("/home/kali/Desktop/eyewitness_results", inputFilePath)).toBeNull();
            expect(validateOutputDirectory("/home/kali/scans/eyewitness_output", inputFilePath)).toBeNull();
            expect(validateOutputDirectory("/home/kali/reports/scan_2026", inputFilePath)).toBeNull();
        });
    });

    describe("validateTimeout", () => {
        it("rejects empty or whitespace timeout", () => {
            expect(validateTimeout("")).toBe("Timeout is required.");
            expect(validateTimeout("   ")).toBe("Timeout is required.");
        });

        it("rejects non-numeric characters and decimals", () => {
            expect(validateTimeout("abc")).toBe("Timeout must be a positive integer (e.g., 15).");
            expect(validateTimeout("15s")).toBe("Timeout must be a positive integer (e.g., 15).");
            expect(validateTimeout("15.5")).toBe("Timeout must be a positive integer (e.g., 15).");
        });

        it("rejects zero and negative numbers", () => {
            expect(validateTimeout("0")).toBe("Timeout must be greater than 0.");
            expect(validateTimeout("-10")).toBe("Timeout must be a positive integer (e.g., 15).");
        });

        it("rejects values exceeding 3600 seconds", () => {
            expect(validateTimeout("3601")).toBe("Timeout cannot exceed 3600 seconds.");
            expect(validateTimeout("99999")).toBe("Timeout cannot exceed 3600 seconds.");
        });

        it("accepts valid positive integers", () => {
            expect(validateTimeout("1")).toBeNull();
            expect(validateTimeout("15")).toBeNull();
            expect(validateTimeout("60")).toBeNull();
            expect(validateTimeout("3600")).toBeNull();
        });
    });
});
