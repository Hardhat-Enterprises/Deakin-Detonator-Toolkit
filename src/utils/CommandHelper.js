"use strict";
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
var __spreadArray =
    (this && this.__spreadArray) ||
    function (to, from, pack) {
        if (pack || arguments.length === 2)
            for (var i = 0, l = from.length, ar; i < l; i++) {
                if (ar || !(i in from)) {
                    if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                    ar[i] = from[i];
                }
            }
        return to.concat(ar || Array.prototype.slice.call(from));
    };
exports.__esModule = true;
exports.CommandHelper = void 0;
var shell_1 = require("@tauri-apps/api/shell");
exports.CommandHelper = {
    /**
     * Helper method to run the given command and return the stdout/stderr result.
     * @param commandString command to run
     * @param args arguments of the command
     * @returns a string containing the command + arguments, as well as the output of the command.
     */
    runCommand: function (commandString, args) {
        return __awaiter(this, void 0, void 0, function () {
            var command, handle, stdout, stderr, output;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = new shell_1.Command(commandString, args);
                        return [4 /*yield*/, command.execute()];
                    case 1:
                        handle = _a.sent();
                        stdout = handle.stdout;
                        stderr = handle.stderr;
                        output = "$ "
                            .concat(commandString, " ")
                            .concat(args.join(" "), "\n\n")
                            .concat(stdout, "\n")
                            .concat(stderr);
                        return [2 /*return*/, output];
                }
            });
        });
    },
    getCommandHandle: function (commandString, args) {
        return __awaiter(this, void 0, void 0, function () {
            var command, handle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = new shell_1.Command(commandString, args);
                        return [4 /*yield*/, command.spawn()];
                    case 1:
                        handle = _a.sent();
                        return [2 /*return*/, handle];
                }
            });
        });
    },
    /**
     * Helper method to run the given command and return the stdout/stderr result.
     * This replaces runCommand() and allows for a process to be manually terminated by the user
     *
     * @param commandString command to run
     * @param args arguments of the command
     * @returns the pid string that can be used to terminate the executing process
     * and a string containing the executed command + arguments, as well as the output of the command.
     */
    runCommandGetPidAndOutput: function (commandString, args, onData, onTermination) {
        return __awaiter(this, void 0, void 0, function () {
            var command, handle, pid, stdout, stderr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = new shell_1.Command(commandString, args);
                        return [4 /*yield*/, command.spawn()];
                    case 1:
                        handle = _a.sent();
                        pid = handle.pid.toString();
                        stdout = "";
                        stderr = "";
                        if (command.stdout) {
                            command.stdout.on("data", function (data) {
                                data = data.replace(
                                    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                                    ""
                                ); // Uses regex to look for and remove any ANSI colour stylings
                                stdout += data.toString() + "\n";
                                onData(data.toString());
                            });
                        }
                        if (command.stderr) {
                            command.stderr.on("data", function (data) {
                                stderr += data.toString() + "\n";
                                onData(data.toString());
                            });
                        }
                        return [
                            2 /*return*/,
                            new Promise(function (resolve, reject) {
                                command.on("close", function (_a) {
                                    var code = _a.code,
                                        signal = _a.signal;
                                    if (pid !== undefined) {
                                        onTermination({ code: code, signal: signal });
                                        resolve({ pid: pid, output: "".concat(stdout, "\n").concat(stderr) });
                                    } else {
                                        reject(new Error("Failed to get process PID."));
                                    }
                                });
                                if (pid !== undefined) {
                                    resolve({
                                        pid: pid,
                                        output: "$ "
                                            .concat(commandString, " ")
                                            .concat(args.join(" "), "\n\n")
                                            .concat(stdout, "\n")
                                            .concat(stderr),
                                    });
                                } else {
                                    reject(new Error("Failed to get process PID."));
                                }
                            }),
                        ];
                }
            });
        });
    },
    /**
     * Implementation note, known bug, and limitations:
     *
     * Purpose:
     * This function was introduced to facilitate developers in testing their code that requires elevated privileges. Prior to this,
     * it was not possible to test code segments that demanded 'sudo'. With the incorporation of 'pkexec', we can now invoke commands
     * with elevated privileges, thereby enabling more comprehensive testing.
     *
     * Current Bug:
     * One of the limitations of this current implementation is that it doesn't keep track of the Child PID once the command starts.
     * This essentially means that, as of now, there's no way to cancel or interrupt the command once it has been initiated.
     * We are aware of this limitation and there are plans to address this in the future. However, for the time being, the bug persists.
     *
     * Implementation Limitation:
     * When using this function, every command executed in the current component (e.g., functions like nmap or airbase-ng) will be run
     * with root privileges. This means users will be prompted for the password every single time, leading to a potential user-experience
     * inconvenience. Developers and users should be aware of this behavior and use the function judiciously.
     *
     * Scope Bug:
     * There is an observed behavior wherein if you don't use `pkexec`, the `scope` is essential for specific commands (e.g., `snmp-check`)
     * in order for the command to execute. However, when `pkexec` is employed, the scope seems to default to `pkexec`, making other scopes
     * (like `snmp-check`) redundant or not required. This is an important nuance to be aware of when relying on the `scope` behavior.
     *
     * Usage:
     * If you're looking to test commands requiring elevated privileges, simply replace the `runCommandGetPidAndOutput()` with this
     * `runCommandWithPkexec()` function. When the command is executed correctly, a GUI will pop up prompting for the password of your
     * machine. Ensure that you, or the user executing the command, know the password beforehand, as this is a security measure to gain
     * elevated privileges.
     *
     * Note: It's essential to be cautious when testing with elevated privileges, especially in production or critical environments.
     */
    /**
     * Execute a command with elevated privileges using 'pkexec'.
     * This function mimics the behavior of `runCommandGetPidAndOutput()` but escalates privileges.
     * 'pkexec' provides a GUI for user password input, making it a more user-friendly method for privilege escalation.
     * This is especially useful for commands that traditionally need 'sudo'.
     *
     * @param commandString The primary command string to be executed.
     * @param args Array of arguments to pass to the command.
     * @param onData Callback function invoked upon receiving data from the command's output.
     * @param onTermination Callback function invoked when the command process terminates.
     * @returns A promise resolving to an object containing the PID and combined output of the command, or rejecting with an error message.
     */
    runCommandWithPkexec: function (commandString, args, onData, onTermination) {
        return __awaiter(this, void 0, void 0, function () {
            var command, handle, pid, stdout, stderr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = new shell_1.Command("pkexec", __spreadArray([commandString], args, true));
                        return [4 /*yield*/, command.spawn()];
                    case 1:
                        handle = _a.sent();
                        pid = handle.pid.toString();
                        console.log(pid);
                        stdout = "";
                        stderr = "";
                        if (command.stdout) {
                            command.stdout.on("data", function (data) {
                                stdout += data.toString() + "\n";
                                onData(data.toString());
                            });
                        }
                        if (command.stderr) {
                            command.stderr.on("data", function (data) {
                                stderr += data.toString() + "\n";
                                onData(data.toString());
                            });
                        }
                        return [
                            2 /*return*/,
                            new Promise(function (resolve, reject) {
                                command.on("close", function (_a) {
                                    var code = _a.code,
                                        signal = _a.signal;
                                    if (pid !== undefined) {
                                        onTermination({ code: code, signal: signal });
                                        resolve({ pid: pid, output: "".concat(stdout, "\n").concat(stderr) });
                                    } else {
                                        reject(new Error("Failed to get process PID."));
                                    }
                                });
                                if (pid !== undefined) {
                                    resolve({
                                        pid: pid,
                                        output: "$ pkexec "
                                            .concat(commandString, " ")
                                            .concat(args.join(" "), "\n\n")
                                            .concat(stdout, "\n")
                                            .concat(stderr),
                                    });
                                } else {
                                    reject(new Error("Failed to get process PID."));
                                }
                            }),
                        ];
                }
            });
        });
    },
};
