import { Title, HoverCard, Text } from "@mantine/core";
import { IconQuestionMark } from "@tabler/icons";

export function UserGuide(title: string, description: string) {
    return (
        <Title>
            {title}
            <HoverCard width={900} shadow="md" position="bottom" closeDelay={1000}>
                <HoverCard.Target>
                    <IconQuestionMark size={24} color="red" />
                </HoverCard.Target>
                <HoverCard.Dropdown>
                    <pre>
                        <Text size="md">{description}</Text>
                    </pre>
                </HoverCard.Dropdown>
            </HoverCard>
        </Title>
    );
}

export function UserGuide2(description: string) {
    return (
        <HoverCard width={900} shadow="md" position="bottom" closeDelay={300}>
            <HoverCard.Target>
                <IconQuestionMark size={32} color="red" />
            </HoverCard.Target>
            <HoverCard.Dropdown>
                <pre>
                    <Text size="md">{description}</Text>
                </pre>
            </HoverCard.Dropdown>
        </HoverCard>
    );
}
