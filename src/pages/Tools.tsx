import { Stack, Table, Title, Select, useMantineColorScheme } from "@mantine/core";
import { useMemo, useState } from "react";
import { getTools } from "../components/RouteWrapper";
import ToolItem from "../components/ToolItem/ToolItem";

const ToolsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState("");
    const tools = getTools();

    // Generate categories using tools data
    const categories = useMemo(() => {
        const uniqueCategories = new Set(tools.map((tool) => tool.category));
        return ["All", ...Array.from(uniqueCategories).sort()];
    }, [tools]);

    let colorScheme: "light" | "dark" = "light";
    try {
        colorScheme = useMantineColorScheme().colorScheme;
    } catch (e) {
        // In test or non-provider environments, fallback to light
        colorScheme = "light";
    }

    return (
        <Stack align={"center"}>
            <Title>Tools</Title>

            <Select
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value || "")}
                label="Filter for a Category"
                placeholder="Select category"
                data={categories}
                required
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
            />

            <Table horizontalSpacing="xl" verticalSpacing="md" fontSize="md">
                <thead>
                    <tr>
                        <th>Tool name</th>
                        <th>Tool description</th>
                        <th>Category</th>
                    </tr>
                </thead>

                <tbody>
                    {tools.map((tool) => {
                        if (!selectedCategory || selectedCategory === "All" || tool.category === selectedCategory) {
                            return (
                                <ToolItem
                                    title={tool.name}
                                    description={tool.description}
                                    route={tool.path}
                                    category={tool.category}
                                    key={tool.name}
                                />
                            );
                        }
                        return null;
                    })}
                </tbody>
            </Table>
        </Stack>
    );
};

export default ToolsPage;
