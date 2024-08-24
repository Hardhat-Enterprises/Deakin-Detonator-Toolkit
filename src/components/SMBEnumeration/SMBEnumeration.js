"use strict";
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
var __generator =
    (this && this.__generator) ||
    function (thisArg, body) {
        var _ = {
                label: 0,
                sent: function () {
                    if (t[0] & 1) throw t[1];
                    return t[1];
                },
                trys: [],
                ops: [],
            },
            f,
            y,
            t,
            g;
        return (
            (g = { next: verb(0), throw: verb(1), return: verb(2) }),
            typeof Symbol === "function" &&
                (g[Symbol.iterator] = function () {
                    return this;
                }),
            g
        );
        function verb(n) {
            return function (v) {
                return step([n, v]);
            };
        }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while ((g && ((g = 0), op[0] && (_ = 0)), _))
                try {
                    if (
                        ((f = 1),
                        y &&
                            (t =
                                op[0] & 2
                                    ? y["return"]
                                    : op[0]
                                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                                    : y.next) &&
                            !(t = t.call(y, op[1])).done)
                    )
                        return t;
                    if (((y = 0), t)) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (
                                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                                (op[0] === 6 || op[0] === 2)
                            ) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2]) _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) {
                    op = [6, e];
                    y = 0;
                } finally {
                    f = t = 0;
                }
            if (op[0] & 5) throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
exports.__esModule = true;
var core_1 = require("@mantine/core");
var form_1 = require("@mantine/form");
var react_1 = require("react");
var CommandHelper_1 = require("../../utils/CommandHelper");
var ConsoleWrapper_1 = require("../ConsoleWrapper/ConsoleWrapper");
var SaveOutputToTextFile_1 = require("../SaveOutputToFile/SaveOutputToTextFile");
var UserGuide_1 = require("../UserGuide/UserGuide");
var OverlayAndCancelButton_1 = require("../OverlayAndCancelButton/OverlayAndCancelButton");
// Title of the component
var title = "SMB Enumeration";
// Source link to the official documentation for SMB enumeration scripts
var sourceLink = "https://nmap.org/nsedoc/scripts/";
// Description for the user guide, explaining how to use the tool
var descriptionUserGuide =
    "SMB (Server Message Block) is a widely used network protocol that provides shared access to files, printers, and serial ports within a network. " +
    "This tool aims to enumerate an SMB server to identify potential vulnerabilities.\n\n" +
    "How to use SMB Enumeration:\n" +
    "Step 1: Enter an IP address or hostname. E.g., 127.0.0.1\n" +
    "Step 2: Enter a port number. E.g., 445\n" +
    "Step 3: Select a scan speed. Note that higher speeds require a faster host network. " +
    "T0 - Paranoid / T1 - Sneaky / T2 - Polite / T3 - Normal / T4 - Aggressive / T5 - Insane. E.g., T3\n" +
    "Step 4: Select an SMB enumeration script to run against the target. E.g., smb-flood.nse\n" +
    "Step 5: Click scan to commence the SMB enumeration operation.\n" +
    "Step 6: Check the output block below to see the results of the scan.\n\n" +
    "For more details, visit the [official documentation](".concat(sourceLink, ").");
// The scan speeds available for selection
var speeds = ["T0", "T1", "T2", "T3", "T4", "T5"];
// The list of available SMB enumeration scripts
var scripts = [
    "smb2-capabilities.nse",
    "smb2-security-mode.nse",
    "smb2-time.nse",
    "smb2-vuln-uptime.nse",
    "smb-brute.nse",
    "smb-double-pulsar-backdoor.nse",
    "smb-enum-domains.nse",
    "smb-enum-groups.nse",
    "smb-enum-processes.nse",
    "smb-enum-services.nse",
    "smb-enum-sessions.nse",
    "smb-enum-shares.nse",
    "smb-enum-users.nse",
    "smb-flood.nse",
    "smb-ls.nse",
    "smb-mbenum.nse",
    "smb-os-discovery.nse",
    "smb-print-text.nse",
    "smb-protocols.nse",
    "smb-psexec.nse",
    "smb-security-mode.nse",
    "smb-server-stats.nse",
    "smb-system-info.nse",
    "smb-vuln-conficker.nse",
    "smb-vuln-cve2009-3103.nse",
    "smb-vuln-cve-2017-7494.nse",
    "smb-vuln-ms06-025.nse",
    "smb-vuln-ms07-029.nse",
    "smb-vuln-ms08-067.nse",
    "smb-vuln-ms10-054.nse",
    "smb-vuln-ms10-061.nse",
    "smb-vuln-ms17-010.nse",
    "smb-vuln-regsvc-dos.nse",
    "smb-vuln-webexec.nse",
    "smb-webexec-exploit.nse",
];
// The main component for SMB Enumeration
var SMBEnumeration = function () {
    // Component state variables
    var _a = (0, react_1.useState)(false),
        loading = _a[0],
        setLoading = _a[1]; // Represents the loading state of the component
    var _b = (0, react_1.useState)(""),
        output = _b[0],
        setOutput = _b[1]; // Stores the output data from the scan
    var _c = (0, react_1.useState)(false),
        allowSave = _c[0],
        setAllowSave = _c[1]; // Controls whether the output can be saved
    var _d = (0, react_1.useState)(false),
        hasSaved = _d[0],
        setHasSaved = _d[1]; // Tracks if the output has already been saved
    var _e = (0, react_1.useState)(""),
        selectedSpeedOption = _e[0],
        setSelectedSpeedOption = _e[1]; // The selected scan speed
    var _f = (0, react_1.useState)(""),
        selectedScriptOption = _f[0],
        setSelectedScriptOption = _f[1]; // The selected SMB script
    var _g = (0, react_1.useState)(""),
        pid = _g[0],
        setPid = _g[1]; // The process ID of the running scan
    // useForm hook to manage form state and validation
    var form = (0, form_1.useForm)({
        initialValues: {
            ip: "",
            port: "",
            speed: "T3",
            script: "smb-enum-users",
        },
    });
    // Handles incoming data from the running process, updating the output state
    var handleProcessData = (0, react_1.useCallback)(function (data) {
        setOutput(function (prevOutput) {
            return prevOutput + "\n" + data;
        });
        if (!allowSave) setAllowSave(true); // Enable saving if it hasn't been enabled already
    }, []);
    // Handles the termination of the running process, updating the state and informing the user
    var handleProcessTermination = (0, react_1.useCallback)(
        function (_a) {
            var code = _a.code,
                signal = _a.signal;
            if (code === 0) {
                handleProcessData("\nProcess completed successfully.");
            } else if (signal === 15) {
                handleProcessData("\nProcess was manually terminated.");
            } else {
                handleProcessData(
                    "\nProcess terminated with exit code: ".concat(code, " and signal code: ").concat(signal)
                );
            }
            setPid(""); // Clear the process ID
            setLoading(false); // Remove loading overlay
            setAllowSave(true); // Enable saving
        },
        [handleProcessData]
    );
    // onSubmit function is called when the form is submitted
    var onSubmit = function (values) {
        return __awaiter(void 0, void 0, void 0, function () {
            var args, result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setLoading(true); // Display the loading overlay
                        setAllowSave(false); // Disable saving until the process is complete
                        setHasSaved(false); // Reset the saved state
                        if (!values.speed) {
                            values.speed = "T3"; // Default scan speed if not provided
                        }
                        args = ["-".concat(values.speed), "--script=".concat(values.scripts)];
                        if (values.port) {
                            args.push("-p ".concat(values.port)); // Include the port if specified
                        }
                        args.push(values.ip); // Add the IP address to the arguments
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [
                            4 /*yield*/,
                            CommandHelper_1.CommandHelper.runCommandGetPidAndOutput(
                                "nmap",
                                args,
                                handleProcessData,
                                handleProcessTermination
                            ),
                        ];
                    case 2:
                        result = _a.sent();
                        setPid(result.pid);
                        setOutput(result.output);
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        setOutput(e_1);
                        return [3 /*break*/, 4];
                    case 4:
                        return [2 /*return*/];
                }
            });
        });
    };
    // Clears the output state
    var clearOutput = (0, react_1.useCallback)(
        function () {
            setOutput("");
            setAllowSave(false);
            setHasSaved(false);
        },
        [setOutput]
    );
    // Updates the component's state after the user has successfully saved the scan results
    var handleSaveComplete = (0, react_1.useCallback)(function () {
        setHasSaved(true);
        setAllowSave(false);
    }, []);
    // Rendering the form and related components
    return React.createElement(
        "form",
        {
            onSubmit: form.onSubmit(function (values) {
                return onSubmit(
                    __assign(__assign({}, values), { speed: selectedSpeedOption, scripts: selectedScriptOption })
                );
            }),
        },
        (0, OverlayAndCancelButton_1.LoadingOverlayAndCancelButton)(loading, pid),
        React.createElement(
            core_1.Stack,
            null,
            (0, UserGuide_1.UserGuide)(title, descriptionUserGuide),
            React.createElement(
                core_1.TextInput,
                __assign({ label: "Target IP or Hostname", required: true }, form.getInputProps("ip"))
            ),
            React.createElement(
                core_1.TextInput,
                __assign({ label: "Port", required: true }, form.getInputProps("port"), { placeholder: "Example: 445" })
            ),
            React.createElement(core_1.NativeSelect, {
                label: "Scan Speed",
                value: selectedSpeedOption,
                onChange: function (e) {
                    return setSelectedSpeedOption(e.target.value);
                },
                title: "Scan speed",
                data: speeds,
                placeholder: "Select a scan speed. Default set to T3",
                description: "Speed of the scan, refer: https://nmap.org/book/performance-timing-templates.html",
            }),
            React.createElement(core_1.NativeSelect, {
                label: "SMB Script",
                value: selectedScriptOption,
                onChange: function (e) {
                    return setSelectedScriptOption(e.target.value);
                },
                title: "SMB Enumeration Script",
                data: scripts,
                required: true,
                placeholder: "Select an SMB Enumeration Script to run against the target",
                description: "NSE Scripts, refer: https://nmap.org/nsedoc/scripts/",
            }),
            React.createElement(core_1.Button, { type: "submit" }, "Scan"),
            (0, SaveOutputToTextFile_1.SaveOutputToTextFile_v2)(output, allowSave, hasSaved, handleSaveComplete),
            React.createElement(ConsoleWrapper_1["default"], { output: output, clearOutputCallback: clearOutput })
        )
    );
};
