"use strict";
exports.__esModule = true;
var react_1 = require("react");
var core_1 = require("@mantine/core");
var prism_1 = require("@mantine/prism");
var ConsoleWrapper = function (_a) {
    var output = _a.output,
        clearOutputCallback = _a.clearOutputCallback,
        hideClearButton = _a.hideClearButton,
        _b = _a.title,
        title = _b === void 0 ? "Output" : _b;
    // Use ref to refer to the output container
    var outputContainerRef = (0, react_1.useRef)(null);
    // Scroll to the bottom of the output container whenever the output updates
    (0, react_1.useEffect)(
        function () {
            if (outputContainerRef.current) {
                var element = outputContainerRef.current;
                element.scrollTop = element.scrollHeight;
            }
        },
        [output]
    );
    if (output) {
        return React.createElement(
            React.Fragment,
            null,
            React.createElement(core_1.Title, null, title),
            React.createElement(
                "div",
                { ref: outputContainerRef, style: { maxHeight: "250px", overflowY: "auto" } },
                React.createElement(prism_1.Prism, { language: "bash" }, output)
            ),
            !hideClearButton &&
                React.createElement(core_1.Button, { color: "red", onClick: clearOutputCallback }, "Clear output")
        );
    } else {
        return null;
    }
};
exports["default"] = ConsoleWrapper;
