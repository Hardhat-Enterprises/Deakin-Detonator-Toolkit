import { Stack, Table, Title } from "@mantine/core";
import { getTools } from "../components/RouteWrapper";
import ToolItem from "../components/ToolItem/ToolItem";

const ToolsPage = () => {
    const rows = getTools().map((tool) => {
        return <ToolItem title={tool.name} description={tool.description} route={tool.path} key={tool.name} />;
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
