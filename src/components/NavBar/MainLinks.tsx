import { Group, Text, ThemeIcon, UnstyledButton } from "@mantine/core";
import { IconQuestionMark, IconStepInto, IconTools, IconSearch, IconTarget, IconReportAnalytics } from "@tabler/icons";
import React from "react";
import { Link } from "react-router-dom";

interface MainLinkProps {
    icon: React.ReactNode;
    color: string;
    label: string;
    route: string;
}

function MainLink({ icon, color, label, route }: MainLinkProps) {
    return (
        <UnstyledButton
            sx={(theme) => ({
                display: "block",
                width: "100%",
                padding: theme.spacing.xs,
                borderRadius: theme.radius.sm,
                color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

                "&:hover": {
                    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
                },
            })}
        >
            <Link to={route} style={{ textDecoration: "none", color: "inherit" }}>
                <Group>
                    <ThemeIcon color={color} variant="light">
                        {icon}
                    </ThemeIcon>
                    <Text size="sm">{label}</Text>
                </Group>
            </Link>
        </UnstyledButton>
    );
}

const aboutData = {
    icon: <IconQuestionMark size={16} />,
    color: "orange",
    label: "About",
    route: "/about",
};

const toolsData = {
    icon: <IconTools size={16} />,
    color: "violet",
    label: "Tools",
    route: "/tools",
};

const attackVectorsData = {
    icon: <IconTarget size={16} />,
    color: "red",
    label: "Attack Vectors",
    route: "/attack-vectors",
};

const walkthroughsData = {
    icon: <IconStepInto size={16} />,
    color: "blue",
    label: "Walkthroughs",
    route: "/walkthroughs",
};

const referencesData = {
    icon: <IconSearch size={16} />,
    color: "green",
    label: "References",
    route: "/references",
};

const scenarioTrainingData = {
    icon: <IconReportAnalytics size={16} />,
    color: "teal",
    label: "AI Training Scenario",
    route: "/scenario-training",
};

const data = [aboutData, toolsData, attackVectorsData, walkthroughsData, scenarioTrainingData, referencesData];

export function MainLinks() {
    const links = data.map((link) => <MainLink {...link} key={link.label} />);
    return <div>{links}</div>;
}
