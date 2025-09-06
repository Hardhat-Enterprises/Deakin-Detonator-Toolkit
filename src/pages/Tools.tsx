import { Stack, Table, Title, Select, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { getTools } from "../components/RouteWrapper";
import ToolItem from "../components/ToolItem/ToolItem";
import { Group } from "@mantine/core";


type Tool = {
  name: string;
  description: string;
  category: string;
  path: string;
};

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

  const tools: Tool[] = getTools();

  // NEW: search + category state
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [query, setQuery] = useState<string>("");

  // NEW: combined filtering (category → search)
  const filteredTools = useMemo(() => {
    const q = query.toLowerCase().trim();

    // 1) filter by category first
    let arr =
      !selectedCategory || selectedCategory === "All"
        ? tools
        : tools.filter((t) => t.category === selectedCategory);

    // 2) then by text (name / description / category)
    if (!q) return arr;
    return arr.filter((t) =>
      [t.name, t.description, t.category].some((v) =>
        v?.toLowerCase().includes(q)
      )
    );
  }, [tools, selectedCategory, query]);

  return (
    <Stack align="center" spacing="lg" style={{ width: "100%", maxWidth: 1200 }}>
      <Title>Tools</Title>

      {/* Controls: search + category */}
      <Group grow align="flex-end" spacing="md" style={{ width: "100%" }}>
  <TextInput
    value={query}
    onChange={(e) => setQuery(e.currentTarget.value)}
    placeholder="Search tools by name, description, or category"
    aria-label="Search tools"
    icon={<IconSearch size={16} />}
    style={{ flex: 1 }}
  />

  <Select
    value={selectedCategory}
    onChange={(value) => setSelectedCategory(value || "All")}
    label="Filter for a Category"
    placeholder="Select category"
    data={categories}
    required
    style={{ width: 280 }}
  />
</Group>



      {/* a11y: announce result count */}
      <div style={{ width: "100%" }}>
        <p aria-live="polite" style={{ opacity: 0.7, margin: "4px 0 0" }}>
          {filteredTools.length} result
          {filteredTools.length !== 1 ? "s" : ""}
        </p>
      </div>

      <Table style={{ width: "100%" }}>
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




/*
import { Stack, Table, Title, Select, useMantineColorScheme} from "@mantine/core";
import { useState } from "react";
import { getTools } from "../components/RouteWrapper";
import ToolItem from "../components/ToolItem/ToolItem";

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
    const tools = getTools();

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
*/