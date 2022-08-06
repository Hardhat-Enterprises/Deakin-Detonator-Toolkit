import { Stack, Table, Title } from "@mantine/core";
import ToolItem from "../components/ToolItem/ToolItem";

const VECTORS = [
    {
        title: "CVE 2021-41773",
        description: "Apache 2.4.49 and 2.4.50 RCE",
        route: "/attack-vectors/cve-2021-41773",
    },
    {
        title: "CVE-2020-1472 | Zero_Log_On",
        description: "Zero Logon vlunerability",
        route: "/attack-vectors/cve-2021-41773",
    }
    
];

export function AttackVectors() {
    const rows = VECTORS.map((tool) => {
        return <ToolItem title={tool.title} description={tool.description} route={tool.route} key={tool.title} />;
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
