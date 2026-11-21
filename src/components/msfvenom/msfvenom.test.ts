import { describe, it, expect } from "vitest";
import { architectures, payloadOptions, payloadRequiredVariables } from "./msfvenom";

/**
 * Looks up the required variables for a payload the same way the component does.
 *
 * @param {string} architecture - Selected architecture.
 * @param {string} payload - Selected payload.
 * @returns {string[]} Required variables shown for that payload.
 */
const requiredFor = (architecture: string, payload: string): string[] => {
    const archIndex = architectures.indexOf(architecture);
    const payloadIndex = payloadOptions[archIndex].indexOf(payload);
    return payloadRequiredVariables[archIndex]?.[payloadIndex] || [];
};

describe("MsfVenom payload required variables (Issue #1877)", () => {
    it("has one required-variables list per architecture, including the placeholder", () => {
        expect(payloadRequiredVariables.length).toBe(architectures.length);
        expect(payloadOptions.length).toBe(architectures.length);
    });

    it("has one entry per payload for every architecture", () => {
        payloadOptions.forEach((payloads, archIndex) => {
            expect(payloadRequiredVariables[archIndex].length, architectures[archIndex]).toBe(payloads.length);
        });
    });

    it("shows LHOST and LPORT for every Android payload", () => {
        payloadOptions[architectures.indexOf("Android ARM")].forEach((payload) => {
            expect(requiredFor("Android ARM", payload), payload).toEqual(["LHOST", "LPORT"]);
        });
    });

    it("maps Windows x86 payloads to their own variables, not the x64 list", () => {
        expect(requiredFor("windows/x86", "windows/format_all_drives")).toEqual([]);
        expect(requiredFor("windows/x86", "windows/loadlibrary")).toEqual(["DLL"]);
        expect(requiredFor("windows/x86", "windows/upexec/bind_tcp")).toEqual(["PEXEC"]);
    });

    it("maps Windows x64, Linux x86 and Mac x64 payloads correctly", () => {
        expect(requiredFor("windows/x64", "windows/x64/peinject/bind_tcp")).toEqual(["PE"]);
        expect(requiredFor("linux/x86", "linux/x86/chmod")).toEqual(["FILE", "MODE"]);
        expect(requiredFor("linux/x86", "linux/x86/read_file")).toEqual(["PATH"]);
        expect(requiredFor("Mac/x64", "osx/x64/say")).toEqual(["TEXT"]);
        expect(requiredFor("Mac/x64", "osx/x64/meterpreter/reverse_tcp")).toEqual(["LHOST", "LPORT"]);
    });
});
