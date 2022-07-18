import { ActionIcon, MantineColor, Popover, Text } from "@mantine/core";
import { useState } from "react";

interface ToolItemIconPopoverProps {
    hoverText: string;
    actionCallback: () => void;
    icon: JSX.Element;
    color: MantineColor;
}

export default function ToolitemIconPopover({ icon, actionCallback, hoverText, color }: ToolItemIconPopoverProps) {
    const [opened, setOpened] = useState(false);

    return (
        <Popover
            opened={opened}
            onClose={() => setOpened(false)}
            position="bottom"
            placement="center"
            withArrow
            trapFocus={false}
            closeOnEscape={false}
            transition="pop-top-left"
            styles={{ body: { pointerEvents: "none" } }}
            target={
                <ActionIcon
                    onMouseEnter={() => setOpened(true)}
                    onMouseLeave={() => setOpened(false)}
                    onClick={actionCallback}
                    color={color}
                >
                    {icon}
                </ActionIcon>
            }
        >
            <Text>{hoverText}</Text>
        </Popover>
    );
}
