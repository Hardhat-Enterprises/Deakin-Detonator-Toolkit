import { Stack, Table, Title } from "@mantine/core";
import { getWalkthroughs } from "../components/RouteWrapper";
import ToolItem from "../components/ToolItem/ToolItem";
import { AspectRatio } from "@mantine/core";

export function WalkthroughsPage() {
    const rows = getWalkthroughs().map((tool) => {
        return <ToolItem title={tool.name} description={tool.description} route={tool.path} key={tool.name} />;
    });

    return (
        <Stack align={"center"}>
            <Title>Walkthroughs</Title>
            <Table horizontalSpacing="xl" verticalSpacing="md" fontSize="md">
                <thead>
                    <tr>
                        <th>Walkthrough name</th>
                        <th>Walkthrough description</th>
                        <th>Videos</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </Table>
        </Stack>
    );
}
export function VideoPlayer(path: string, title: string) {
    return (
        <Stack>
            <Title>{title}</Title>
            <AspectRatio ratio={16 / 9}>
                <iframe
                    src={path}
                    title="Walkthrough video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </AspectRatio>
        </Stack>
    );
}
