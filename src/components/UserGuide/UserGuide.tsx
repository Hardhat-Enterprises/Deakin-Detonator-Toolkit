import { Title, HoverCard, Text } from "@mantine/core";
import { IconQuestionMark } from "@tabler/icons";
import styles from "./UserGuide.module.css";

export function UserGuide(title: string, description: string) {
    return (
        <Title>
            {title}
            <HoverCard width={900} shadow="md" position="bottom" closeDelay={1000}>
                <HoverCard.Target>
                    <IconQuestionMark size={24} color="red" />
                </HoverCard.Target>
                <HoverCard.Dropdown>
                    <Text className={styles.text} size="md">
                        <pre style={{ whiteSpace: "pre-wrap" }}>{description}</pre>
                    </Text>
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
                <Text className={styles.text} size="md">
                    <pre style={{ whiteSpace: "pre-wrap" }}>{description}</pre>
                </Text>
            </HoverCard.Dropdown>
        </HoverCard>
    );
}
