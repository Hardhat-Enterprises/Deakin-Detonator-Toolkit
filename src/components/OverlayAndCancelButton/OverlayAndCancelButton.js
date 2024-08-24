"use strict";
exports.__esModule = true;
exports.LoadingOverlayAndCancelButtonPkexec = exports.LoadingOverlayAndCancelButton = void 0;
var core_1 = require("@mantine/core");
var CommandHelper_1 = require("../../utils/CommandHelper");
/**
 * Overlay to successfully terminate processes for tools not requiring pkexec
 * @param loading - An object containing information about the process termination.
 * @param pid - The exit code of the terminated process.
 * @returns A Loading Overlay with cancel button
 */
function LoadingOverlayAndCancelButton(loading, pid) {
    // Sends a SIGTERM signal to gracefully terminate the active process passed as an argument
    var handleCancel = function () {
        if (pid !== null) {
            var args = ["-15", pid];
            CommandHelper_1.CommandHelper.runCommand("kill", args);
        }
    };
    return React.createElement(
        React.Fragment,
        null,
        React.createElement(core_1.LoadingOverlay, { visible: loading }),
        loading &&
            React.createElement(
                "div",
                null,
                React.createElement(
                    core_1.Button,
                    { variant: "outline", color: "red", style: { zIndex: 1001 }, onClick: handleCancel },
                    "Cancel"
                )
            )
    );
}
exports.LoadingOverlayAndCancelButton = LoadingOverlayAndCancelButton;
/**
 * Overlay to successfully terminate processes for tools using pkexec
 * @param loading - An object containing information about the process termination.
 * @param pid - The exit code of the terminated process.
 * @param onData- Callback function to handle data generated during the termination process.
 * @param onTermination - Callback function to provide termination details.
 * @throws If there is an error during cancel process or process ID fails to be acquired
 * @returns A Loading Overlay with cancel button
 */
function LoadingOverlayAndCancelButtonPkexec(loading, pid, onData, onTermination) {
    // Sends a SIGINT signal to gracefully terminate the active process passed as an argument
    var handleCancel = function () {
        try {
            //Run termination command if pid is found
            if (pid !== null) {
                var args = ["-2", pid];
                CommandHelper_1.CommandHelper.runCommandWithPkexec("kill", args, onData, onTermination);
            } else {
                //Throws error if failed to get process ID for termination
                throw new Error("Error: Failed to get process ID ");
            }
        } catch (e) {
            //Throws an error if exception happens in the cancel process
            throw e;
        }
    };
    //Returns a loadingoverlay function to handle process termination for pkexec
    return React.createElement(
        React.Fragment,
        null,
        React.createElement(core_1.LoadingOverlay, { visible: loading }),
        loading &&
            React.createElement(
                "div",
                null,
                React.createElement(
                    core_1.Button,
                    { variant: "outline", color: "red", style: { zIndex: 1001 }, onClick: handleCancel },
                    "Cancel"
                )
            )
    );
}
exports.LoadingOverlayAndCancelButtonPkexec = LoadingOverlayAndCancelButtonPkexec;
