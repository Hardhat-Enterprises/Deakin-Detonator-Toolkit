"use strict";
exports.__esModule = true;
exports.RenderComponent = exports.UserGuide2 = exports.UserGuide = void 0;
var core_1 = require("@mantine/core");
var icons_1 = require("@tabler/icons");
var UserGuide_module_css_1 = require("./UserGuide.module.css");
var react_1 = require("react");
/**
 * Renders a user guide component with a title and description.
 * @deprecated
 * @param title - The title of the user guide.
 * @param description - The description of the user guide.
 * @returns The rendered user guide component.
 */
function UserGuide(title, description) {
    return react_1["default"].createElement(
        core_1.Title,
        null,
        title,
        react_1["default"].createElement(
            core_1.HoverCard,
            { width: 900, shadow: "md", position: "bottom", closeDelay: 1000 },
            react_1["default"].createElement(
                core_1.HoverCard.Target,
                null,
                react_1["default"].createElement(icons_1.IconQuestionMark, { size: 24, color: "red" })
            ),
            react_1["default"].createElement(
                core_1.HoverCard.Dropdown,
                null,
                react_1["default"].createElement(
                    core_1.Text,
                    { className: UserGuide_module_css_1["default"].text, size: "md" },
                    react_1["default"].createElement("pre", { style: { whiteSpace: "pre-wrap" } }, description)
                )
            )
        )
    );
}
exports.UserGuide = UserGuide;
/**
 * Renders a user guide component with a hover card that displays a description.
 * @deprecated
 * @param description - The description to be displayed in the hover card.
 * @returns The rendered user guide component.
 */
function UserGuide2(description) {
    return react_1["default"].createElement(
        core_1.HoverCard,
        { width: 900, shadow: "md", position: "bottom", closeDelay: 300 },
        react_1["default"].createElement(
            core_1.HoverCard.Target,
            null,
            react_1["default"].createElement(icons_1.IconQuestionMark, { size: 32, color: "red" })
        ),
        react_1["default"].createElement(
            core_1.HoverCard.Dropdown,
            null,
            react_1["default"].createElement(
                core_1.Text,
                { className: UserGuide_module_css_1["default"].text, size: "md" },
                react_1["default"].createElement("pre", { style: { whiteSpace: "pre-wrap" } }, description)
            )
        )
    );
}
exports.UserGuide2 = UserGuide2;
/**
 * Renders a component with tabs for user guide, configuration, and tutorial.
 *
 * @param component - The component props.
 * @returns The rendered component.
 */
function RenderComponent(component) {
    return react_1["default"].createElement(
        react_1["default"].Fragment,
        null,
        react_1["default"].createElement(
            core_1.Title,
            { align: "center", style: { paddingBottom: "10px" } },
            component.title
        ),
        react_1["default"].createElement(
            core_1.Tabs,
            { defaultValue: "configuration" },
            react_1["default"].createElement(
                core_1.Tabs.List,
                { grow: true, style: { marginBottom: "10px" } },
                react_1["default"].createElement(
                    core_1.Tabs.Tab,
                    {
                        value: "userGuide",
                        icon: react_1["default"].createElement(icons_1.IconBuildingLighthouse, {
                            width: 16,
                            height: 16,
                        }),
                    },
                    "User Guide"
                ),
                react_1["default"].createElement(
                    core_1.Tabs.Tab,
                    {
                        value: "configuration",
                        icon: react_1["default"].createElement(icons_1.IconSettings, { width: 16, height: 16 }),
                    },
                    "Configuration"
                ),
                react_1["default"].createElement(
                    core_1.Tabs.Tab,
                    {
                        value: "tutorial",
                        disabled: true,
                        icon: react_1["default"].createElement(icons_1.IconAbacus, { width: 16, height: 16 }),
                    },
                    "Tutorial"
                )
            ),
            react_1["default"].createElement(
                core_1.Tabs.Panel,
                { value: "userGuide" },
                react_1["default"].createElement(core_1.Title, null, "What is ", component.title),
                react_1["default"].createElement(
                    core_1.Text,
                    { className: UserGuide_module_css_1["default"].text, size: "md" },
                    react_1["default"].createElement(
                        "pre",
                        { style: { whiteSpace: "pre-wrap" } },
                        component.description
                    ),
                    react_1["default"].createElement("pre", { style: { whiteSpace: "pre-wrap" } }, component.steps)
                )
            ),
            react_1["default"].createElement(
                core_1.Tabs.Panel,
                { value: "configuration" },
                react_1["default"].createElement(core_1.Title, null, "Configure ", component.title),
                component.children
            ),
            react_1["default"].createElement(
                core_1.Tabs.Panel,
                { value: "tutorial" },
                react_1["default"].createElement(
                    core_1.Text,
                    { className: UserGuide_module_css_1["default"].text, size: "md" },
                    react_1["default"].createElement("pre", { style: { whiteSpace: "pre-wrap" } }, component.tutorial),
                    react_1["default"].createElement("pre", { style: { whiteSpace: "pre-wrap" } }, component.sourceLink)
                )
            )
        )
    );
}
exports.RenderComponent = RenderComponent;
