import { Group, Text, ThemeIcon, UnstyledButton } from "@mantine/core";
import React, { useState } from "react";
import { Home, QuestionMark, StepInto, Tools } from "tabler-icons-react";

interface MainLinkProps {
    icon: React.ReactNode;
    color: string;
    label: string;
}

function MainLink({ icon, color, label }: MainLinkProps) {
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
            <Group>
                <ThemeIcon color={color} variant="light">
                    {icon}
                </ThemeIcon>

                <Text size="sm">{label}</Text>
            </Group>
        </UnstyledButton>
    );
}

const aboutData = {
    icon: <QuestionMark size={16} />,
    color: "orange",
    label: "About",
};
const toolsData = { icon: <Tools size={16} />, color: "violet", label: "Tools" };
const walkthroughsData = { icon: <StepInto size={16} />, color: "blue", label: "Walkthroughs" };

export function MainLinks() {
    const [data, setData] = useState<MainLinkProps[]>([aboutData, toolsData, walkthroughsData]);
    const links = data.map((link) => <MainLink {...link} key={link.label} />);
    return <div>{links}</div>;
}
