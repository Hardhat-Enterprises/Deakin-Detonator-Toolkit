import { Group, Stack, Table, Title } from "@mantine/core";
import ToolItem from "../components/ToolItem/ToolItem";

const TOOLS = [
    {
        title: "Nmap",
        description: "Network map scanning tool",
        route: "/tools/nmap",
    },
    {
        title: "snmp-check",
        description: "SNMP enumeration tool",
        route: "/tools/snmp-check",
    },
];

const ToolsPage = () => {
    const rows = TOOLS.map((tool) => {
        return <ToolItem title={tool.title} description={tool.description} route={tool.route} key={tool.title} />;
    });

    return (
        <Stack align={"center"}>
            <Title>Tools</Title>
            <Table horizontalSpacing="xl" verticalSpacing="md" fontSize="md">
                <thead>
                    <tr>
                        <th>Tool name</th>
                        <th>Tool description</th>
                        <th>Controls</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </Table>
        </Stack>
    );
};

export default ToolsPage;
