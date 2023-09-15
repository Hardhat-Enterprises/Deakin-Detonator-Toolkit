import { Stack, Table, Title } from "@mantine/core";
import { getAttackVectors } from "../components/RouteWrapper";
import ToolItem from "../components/ToolItem/ToolItem";

export function AttackVectors() {
    const rows = getAttackVectors().map((tool) => {
        return (
            <ToolItem
                title={tool.name}
                description={tool.description}
                route={tool.path}
                category={tool.category}
                key={tool.name}
            />
        );
    });

    return (
        <Stack align={"center"}>
            <Title>Attack Vectors</Title>
            <Table horizontalSpacing="xl" verticalSpacing="md" fontSize="md">
                <thead>
                    <tr>
                        <th>Attack Vector name</th>
                        <th>Atack description</th>
                        <th>Controls</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </Table>
        </Stack>
    );
}
