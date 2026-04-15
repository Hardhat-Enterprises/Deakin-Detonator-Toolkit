import { Title, HoverCard, Text, Tabs, Anchor } from "@mantine/core";
import { IconAbacus, IconBuildingLighthouse, IconQuestionMark, IconSettings } from "@tabler/icons";
import styles from "./UserGuide.module.css";
import React from "react";

interface ComponentProps {
    title: string;
    description: string;
    steps: string;
    tutorial: string;
    sourceLink: string;
    children: React.ReactNode;
}

/**
 * Renders a user guide component with a title and description.
 * @deprecated
 */
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

/**
 * Renders a user guide component with a hover card that displays a description.
 * @deprecated
 */
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

/**
 * Renders a component with tabs for user guide, configuration, and tutorial.
 */
export function RenderComponent(component: ComponentProps) {
    const hasTutorial = component.tutorial && component.tutorial.trim() !== "";

    return (
        <>
            <Title align="center" style={{ paddingBottom: "10px" }}>
                {component.title}
            </Title>

            <Tabs defaultValue="configuration">
                <Tabs.List grow style={{ marginBottom: "10px" }}>
                    <Tabs.Tab value="userGuide" icon={<IconBuildingLighthouse width={16} height={16} />}>
                        User Guide
                    </Tabs.Tab>
                    <Tabs.Tab value="configuration" icon={<IconSettings width={16} height={16} />}>
                        Configuration
                    </Tabs.Tab>
                    <Tabs.Tab value="tutorial" icon={<IconAbacus width={16} height={16} />}>
                        Tutorial
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="userGuide">
                    <Title>What is {component.title}</Title>
                    <Text className={styles.text} size="md">
                        <pre style={{ whiteSpace: "pre-wrap" }}>{component.description}</pre>
                        <pre style={{ whiteSpace: "pre-wrap" }}>{component.steps}</pre>
                    </Text>
                </Tabs.Panel>

                <Tabs.Panel value="configuration">
                    <Title>Configure {component.title}</Title>
                    {component.children}
                </Tabs.Panel>

                <Tabs.Panel value="tutorial">
                    <div className={styles.tutorialContainer}>
                        {hasTutorial ? (
                            <iframe
                                src={component.tutorial}
                                style={{
                                    width: "100%",
                                    height: "800px",
                                    border: "none",
                                    borderRadius: "8px",
                                    display: "block",
                                }}
                                title={`${component.title} Tutorial`}
                                allowFullScreen
                                scrolling="yes"
                            />
                        ) : (
                            <div
                                style={{
                                    padding: "20px",
                                    border: "1px solid #444",
                                    borderRadius: "8px",
                                }}
                            >
                                <Title order={3} mb="md">
                                    Tutorial not available in embedded view
                                </Title>
                                <Text mb="sm">This tutorial cannot be displayed inside the toolkit.</Text>
                                <Text mb="sm">Please use the source link below for more information.</Text>
                                <Anchor href={component.sourceLink} target="_blank" rel="noopener noreferrer">
                                    Open source/reference link
                                </Anchor>
                            </div>
                        )}
                    </div>
                </Tabs.Panel>
            </Tabs>
        </>
    );
}
