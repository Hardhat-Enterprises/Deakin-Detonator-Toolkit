"use strict";
exports.__esModule = true;
exports.SaveOutputToTextFile_v2 = exports.SaveOutputToTextFile = void 0;
var core_1 = require("@mantine/core");
var fs_1 = require("@tauri-apps/api/fs");
var react_1 = require("react");
function SaveOutputToTextFile(outputToSave) {
    var _a = (0, react_1.useState)(false),
        checkedSaveOutputToFile = _a[0],
        setCheckedSaveOutputToFile = _a[1];
    var _b = (0, react_1.useState)(""),
        filename = _b[0],
        setFilename = _b[1];
    var handleFilenameChange = function (e) {
        var newFilename = e.currentTarget.value;
        setFilename(newFilename);
    };
    if (outputToSave && filename && checkedSaveOutputToFile) {
        var outputDir = "./Deakin-Detonator-Toolkit/OutputFiles/";
        (0, fs_1.createDir)(outputDir, { dir: fs_1.BaseDirectory.Home, recursive: true });
        (0, fs_1.writeTextFile)(outputDir + filename, outputToSave, { dir: fs_1.BaseDirectory.Home });
    }
    return React.createElement(
        React.Fragment,
        null,
        React.createElement(core_1.Checkbox, {
            label: "Save Output To File",
            checked: checkedSaveOutputToFile,
            onChange: function (e) {
                return setCheckedSaveOutputToFile(e.currentTarget.checked);
            },
        }),
        checkedSaveOutputToFile &&
            React.createElement(core_1.TextInput, {
                label: "Output filename",
                placeholder: "output.txt",
                value: filename,
                onChange: handleFilenameChange,
            })
    );
}
exports.SaveOutputToTextFile = SaveOutputToTextFile;
function SaveOutputToTextFile_v2(outputToSave, allowSave, hasSaved, onSave) {
    var _a = (0, react_1.useState)(""),
        filename = _a[0],
        setFilename = _a[1];
    var handleFilenameChange = function (e) {
        var newFilename = e.currentTarget.value;
        setFilename(newFilename);
    };
    var handleSave = function () {
        if (outputToSave && filename && allowSave) {
            var outputDir = "./Deakin-Detonator-Toolkit/OutputFiles/";
            (0, fs_1.createDir)(outputDir, { dir: fs_1.BaseDirectory.Home, recursive: true });
            (0, fs_1.writeTextFile)(outputDir + filename, outputToSave, { dir: fs_1.BaseDirectory.Home });
            onSave(); // Call the onSave callback to perform post save actions in caller
        }
    };
    return React.createElement(
        React.Fragment,
        null,
        allowSave &&
            React.createElement(
                React.Fragment,
                null,
                React.createElement(core_1.TextInput, {
                    label: "Output filename",
                    placeholder: "output.txt",
                    value: filename,
                    onChange: handleFilenameChange,
                }),
                React.createElement(core_1.Button, { type: "button", onClick: handleSave }, "Save Output To File")
            ),
        hasSaved &&
            React.createElement(
                "div",
                { className: "save-message" },
                "Output has been saved! ",
                React.createElement("br", null),
                "Output save file: /Deakin-Detonator-Toolkit/OutputFiles/",
                filename
            )
    );
}
exports.SaveOutputToTextFile_v2 = SaveOutputToTextFile_v2;
