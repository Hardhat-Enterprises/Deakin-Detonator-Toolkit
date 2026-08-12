import { Stack, Table, Title, Select, TextInput, Group } from "@mantine/core";
import { IconSearch } from "@tabler/icons";
import { useMemo, useState } from "react";
import { getTools } from "../components/RouteWrapper";
import ToolItem from "../components/ToolItem/ToolItem";

type Tool = {
    name: string;
    description: string;
    category: string;
    path: string;
};

const categories = [
    "All",
    "Attack Tools",
    "File Analysis and Recovery",
    "Information Gathering and Analysis",
    "Miscellaneous",
    "Network Scanning and Enumeration",
    "Password Cracking and Authentication Testing",
    "Vulnerability Assessment and Exploitation",
    "Web Application Testing",
];

const ToolsPage = () => {
    const tools: Tool[] = getTools();

    // Existing category filter (preserved) + new search
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [query, setQuery] = useState<string>("");

    // Category → Search pipeline
    const filteredTools = useMemo(() => {
        const q = query.toLowerCase().trim();

        // 1) category filter (same behavior as before)
        const categoryFiltered =
            !selectedCategory || selectedCategory === "All"
                ? tools
                : tools.filter((t) => t.category === selectedCategory);

        // 2) search across name/description/category (case-insensitive)
        if (!q) return categoryFiltered;

        return categoryFiltered.filter((t) =>
            [t.name, t.description, t.category].some((v) => v?.toLowerCase().includes(q))
        );
    }, [tools, selectedCategory, query]);

    return (
        <Stack align="center" spacing="lg" style={{ width: "100%", maxWidth: 1200 }}>
            <Title>Tools</Title>

            {/* Controls: search + category, side-by-side */}
            <Group grow align="flex-end" spacing="md" style={{ width: "100%" }}>
                <TextInput
                    value={query}
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    placeholder="Search tools by name, description, or category"
                    aria-label="Search tools"
                    icon={<IconSearch size={16} aria-hidden="true" />}
                    style={{ flex: 1 }}
                />

                <Select
                    value={selectedCategory}
                    onChange={(value) => setSelectedCategory(value || "All")}
                    label="Filter for a Category"
                    placeholder="Select category"
                    data={categories}
                    required
                    // Preserve the original color-scheme-aware custom styles
                    styles={(theme) => ({
                        input: {
                            backgroundColor: theme.colorScheme === "light" ? theme.white : theme.colors.dark[6],
                            color: theme.colorScheme === "light" ? theme.black : theme.white,
                            borderColor: theme.colorScheme === "light" ? theme.colors.gray[4] : theme.colors.dark[4],
                        },
                        dropdown: {
                            backgroundColor: theme.colorScheme === "light" ? theme.white : theme.colors.dark[7],
                            color: theme.colorScheme === "light" ? theme.black : theme.white,
                        },
                    })}
                    style={{ width: 280 }}
                />
            </Group>

            {/* A11y: announce result count */}
            <div style={{ width: "100%" }}>
                <p aria-live="polite" style={{ opacity: 0.7, margin: "4px 0 0" }}>
                    {filteredTools.length} result{filteredTools.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Preserve table spacing/structure */}
            <Table horizontalSpacing="xl" verticalSpacing="md" fontSize="md" style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th>Tool name</th>
                        <th>Tool description</th>
                        <th>Category</th>
                        <th /> {/* actions column */}
                    </tr>
                </thead>

                <tbody>
                    {filteredTools.map((tool) => (
                        <ToolItem
                            title={tool.name}
                            description={tool.description}
                            route={tool.path}
                            category={tool.category}
                            key={tool.name}
                        />
                    ))}
                </tbody>
            </Table>
        </Stack>
    );
};

export default ToolsPage;
