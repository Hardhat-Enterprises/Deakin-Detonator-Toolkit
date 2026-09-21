import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";
import prettier from "prettier";

const root = process.cwd();

const routeFile = path.join(root, "src", "components", "RouteWrapper.tsx");
const toolsDocument = path.join(root, "docs", "TOOLS.md");

const TOOLS_START = "<!-- GENERATED TOOLS START -->";
const TOOLS_END = "<!-- GENERATED TOOLS END -->";

const ATTACK_VECTORS_START = "<!-- GENERATED ATTACK VECTORS START -->";
const ATTACK_VECTORS_END = "<!-- GENERATED ATTACK VECTORS END -->";

function getPropertyName(property) {
    if (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) {
        return property.name.text;
    }

    return undefined;
}

function getStringProperty(object, propertyName) {
    for (const property of object.properties) {
        if (!ts.isPropertyAssignment(property)) {
            continue;
        }

        if (getPropertyName(property) !== propertyName) {
            continue;
        }

        if (ts.isStringLiteral(property.initializer) || ts.isNoSubstitutionTemplateLiteral(property.initializer)) {
            return property.initializer.text;
        }
    }

    return "";
}

function findRoutesArray(sourceFile) {
    let routesArray;

    function visit(node) {
        if (
            ts.isVariableDeclaration(node) &&
            ts.isIdentifier(node.name) &&
            node.name.text === "ROUTES" &&
            node.initializer &&
            ts.isArrayLiteralExpression(node.initializer)
        ) {
            routesArray = node.initializer;
            return;
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    if (!routesArray) {
        throw new Error("Unable to locate the ROUTES array in RouteWrapper.tsx.");
    }

    return routesArray;
}

function extractRoutes() {
    const source = fs.readFileSync(routeFile, "utf8");

    const sourceFile = ts.createSourceFile(routeFile, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    const routesArray = findRoutesArray(sourceFile);

    return routesArray.elements
        .filter((element) => ts.isObjectLiteralExpression(element))
        .map((route) => ({
            name: getStringProperty(route, "name"),
            path: getStringProperty(route, "path"),
            description: getStringProperty(route, "description"),
            category: getStringProperty(route, "category"),
        }));
}

function escapeMarkdown(value) {
    return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
}

function sortByName(routes) {
    return [...routes].sort((a, b) =>
        a.name.localeCompare(b.name, "en", {
            sensitivity: "base",
        }),
    );
}

function validateTools(tools) {
    for (const tool of tools) {
        if (!tool.name || !tool.path || !tool.description || !tool.category) {
            throw new Error(
                `Tool route "${tool.path || tool.name || "unknown"}" is missing required documentation metadata.`,
            );
        }
    }
}

function validateAttackVectors(attackVectors) {
    for (const attackVector of attackVectors) {
        if (!attackVector.name || !attackVector.path || !attackVector.description) {
            throw new Error(
                `Attack vector route "${attackVector.path || attackVector.name || "unknown"}" is missing required documentation metadata.`,
            );
        }
    }
}

function generateToolsSection(tools) {
    const rows = tools.map(
        (tool) =>
            `| ${escapeMarkdown(tool.name)} | ${escapeMarkdown(tool.category)} | ${escapeMarkdown(tool.description)} |`,
    );

    return [
        `**Current supported tools: ${tools.length}**`,
        "",
        "| Tool | Category | Description |",
        "| --- | --- | --- |",
        ...rows,
    ].join("\n");
}

function generateAttackVectorsSection(attackVectors) {
    const rows = attackVectors.map(
        (attackVector) => `| ${escapeMarkdown(attackVector.name)} | ${escapeMarkdown(attackVector.description)} |`,
    );

    return [
        `**Current attack vectors: ${attackVectors.length}**`,
        "",
        "| Attack Vector | Description |",
        "| --- | --- |",
        ...rows,
    ].join("\n");
}

function replaceGeneratedSection(document, startMarker, endMarker, content) {
    const startIndex = document.indexOf(startMarker);
    const endIndex = document.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
        throw new Error(`Unable to find generated documentation markers: ${startMarker} / ${endMarker}`);
    }

    if (endIndex < startIndex) {
        throw new Error(`Generated documentation markers are in the wrong order.`);
    }

    const before = document.slice(0, startIndex + startMarker.length);
    const after = document.slice(endIndex);

    return `${before}\n\n${content}\n\n${after}`;
}

const routes = extractRoutes();

const tools = sortByName(routes.filter((route) => route.path.startsWith("/tools/")));

const attackVectors = sortByName(routes.filter((route) => route.path.startsWith("/attack-vectors/")));

validateTools(tools);
validateAttackVectors(attackVectors);

let document = fs.readFileSync(toolsDocument, "utf8");

document = replaceGeneratedSection(document, TOOLS_START, TOOLS_END, generateToolsSection(tools));

document = replaceGeneratedSection(
    document,
    ATTACK_VECTORS_START,
    ATTACK_VECTORS_END,
    generateAttackVectorsSection(attackVectors),
);

const formatted = await prettier.format(document, {
    filepath: toolsDocument,
});

fs.writeFileSync(toolsDocument, formatted, "utf8");

console.log(`Generated ${tools.length} supported tools.`);
console.log(`Generated ${attackVectors.length} attack vectors.`);
console.log(`Updated ${path.relative(root, toolsDocument)}.`);
