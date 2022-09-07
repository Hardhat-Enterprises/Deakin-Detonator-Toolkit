import { Group, ActionIcon, Popover, Button, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconExternalLink } from "@tabler/icons";
import { useState } from "react";

interface ReferenceProps {
    name: string;
    description: string;
    url: string;
}

export function Reference({ name, description, url }: ReferenceProps) {
    const [opened, { close, open }] = useDisclosure(false);

    return (
        <Group>
            <Popover width={418} position="bottom" withArrow shadow="md" opened={opened}>
                <Popover.Target>
                    <Button style={{ width: 418 }} onMouseEnter={open} onMouseLeave={close}>
                        {name}
                    </Button>
                </Popover.Target>
                <Popover.Dropdown>
                    <Text size="sm">
                        <p>{description}</p>
                        <p>URL: {url}</p>
                    </Text>
                </Popover.Dropdown>
            </Popover>
            <ActionIcon
                size="lg"
                color="green"
                variant="filled"
                component="a"
                target="_blank"
                rel="noopener noreferrer"
                href={url}
            >
                <IconExternalLink size={18} />
            </ActionIcon>
        </Group>
    );
}
