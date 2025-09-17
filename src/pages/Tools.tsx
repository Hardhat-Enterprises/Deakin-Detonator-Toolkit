import { Stack, Table, Title, Select, Text, Group } from "@mantine/core";
import { useState, useMemo } from "react";
import { getTools } from "../components/RouteWrapper";
import ToolItem from "../components/ToolItem/ToolItem";
// adjust this import if your path differs
import SearchInput from "../components/SearchInput";

const ToolsPage = () => {
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

    const [selectedCategory, setSelectedCategory] = useState("");
    const [q, setQ] = useState("");
    const tools = getTools();

    const filteredTools = useMemo(() => {
        const query = q.trim().toLowerCase();

        return tools.filter((tool) => {
            const categoryOk = !selectedCategory || selectedCategory === "All" || tool.category === selectedCategory;

            if (!categoryOk) return false;
            if (!query) return true;

            const haystack = [tool.name, tool.description, tool.category].filter(Boolean).join(" ").toLowerCase();

            return haystack.includes(query);
        });
    }, [tools, q, selectedCategory]);

    return (
        <Stack align="center" spacing="sm" style={{ width: "100%" }}>
            <Title>Tools</Title>

            {/* Search + Category filter in a single row */}
            <Group spacing="sm" style={{ width: "100%" }} grow>
                <SearchInput placeholder="Search tools (name, description)…" ariaLabel="Search tools" onChange={setQ} />

                <Select
                    value={selectedCategory}
                    onChange={(value) => setSelectedCategory(value || "")}
                    placeholder="Select category"
                    data={categories}
                    required
                />
            </Group>

            <Table horizontalSpacing="xl" verticalSpacing="md" fontSize="md" style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th>Tool name</th>
                        <th>Tool description</th>
                        <th>Category</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredTools.length === 0 ? (
                        <tr>
                            <td colSpan={3}>
                                <Text c="dimmed" size="sm">
                                    No tools match “{q || selectedCategory || "your filters"}”.
                                </Text>
                            </td>
                        </tr>
                    ) : (
                        filteredTools.map((tool) => (
                            <ToolItem
                                title={tool.name}
                                description={tool.description}
                                route={tool.path}
                                category={tool.category}
                                key={tool.name}
                            />
                        ))
                    )}
                </tbody>
            </Table>
        </Stack>
    );
};

export default ToolsPage;
