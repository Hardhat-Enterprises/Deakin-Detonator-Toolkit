import { Title, HoverCard, Text, Button, Group, Collapse, Box, Tabs } from "@mantine/core";
import { IconAbacus, IconBuildingLighthouse, IconManualGearbox, IconQuestionMark, IconSettings } from "@tabler/icons";
import styles from "./UserGuide.module.css";
import { jsx } from "@emotion/react";

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

export function UserGuideTab(
    title: string,
    description: string,
    steps: string,
    form: jsx.JSX.Element,
    tutorial: string,
    sourceLink: string
) {
    return (
        <>
            <Title>{title}</Title>
            <Tabs defaultValue="userGuide">
                <Tabs.List grow>
                    <Tabs.Tab value="userGuide" icon={<IconBuildingLighthouse width={16} height={16} />}>
                        User Guide
                    </Tabs.Tab>
                    <Tabs.Tab value="configuration" icon={<IconSettings width={16} height={16} />}>
                        Configuration
                    </Tabs.Tab>
                    <Tabs.Tab
                        value="tutorial"
                        disabled={tutorial == "" && sourceLink == ""}
                        icon={<IconAbacus width={16} height={16} />}
                    >
                        Tutorial
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="userGuide">
                    <Text className={styles.text} size="md">
                        <pre style={{ whiteSpace: "pre-wrap" }}>{description}</pre>
                        <pre style={{ whiteSpace: "pre-wrap" }}>{steps}</pre>
                    </Text>
                </Tabs.Panel>

                <Tabs.Panel value="configuration">
                    <Text className={styles.text} size="md">
                        <pre style={{ whiteSpace: "pre-wrap" }}>{form}</pre>
                    </Text>
                </Tabs.Panel>

                <Tabs.Panel value="tutorial">
                    <Text className={styles.text} size="md">
                        <pre style={{ whiteSpace: "pre-wrap" }}>{tutorial}</pre>
                        <pre style={{ whiteSpace: "pre-wrap" }}>{sourceLink}</pre>
                    </Text>
                </Tabs.Panel>
            </Tabs>
        </>
    );
}
