import { Group, Text, ThemeIcon, UnstyledButton, useMantineColorScheme } from "@mantine/core";
import { Moon, Sun } from "tabler-icons-react";

export function ColorSchemeToggle() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const colourSchemeIcon = colorScheme === "dark" ? <Sun /> : <Moon />;
    const colourSchemeText = colorScheme === "dark" ? "Light mode" : "Dark mode";
    const colour = colorScheme === "dark" ? "yellow" : "gray";

    return (
        <>
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
                onClick={() => toggleColorScheme()}
            >
                <Group>
                    <ThemeIcon color={colour} variant={"light"}>
                        {colourSchemeIcon}
                    </ThemeIcon>
                    <Text size="sm">{colourSchemeText}</Text>
                </Group>
            </UnstyledButton>
        </>
    );
}
