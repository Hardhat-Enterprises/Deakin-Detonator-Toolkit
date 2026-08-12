import React, { useState, useRef, useEffect } from "react";
import { Box, Tooltip, Text, Badge, Paper, Group, ActionIcon, CopyButton, useMantineTheme } from "@mantine/core";
import { IconBulb, IconGridDots, IconCopy, IconCheck } from "@tabler/icons";

interface HintPosition {
    x: number;
    y: number;
}

interface Hint {
    position: HintPosition;
    message: string;
    visible?: boolean;
}

interface HintedToolGridProps {
    tool: React.ReactNode;
    hints?: Hint[];
    developmentMode?: boolean;
}

const HintedToolGrid: React.FC<HintedToolGridProps> = ({ tool, hints = [], developmentMode = false }) => {
    const theme = useMantineTheme();
    const [viewedHints, setViewedHints] = useState<Set<string>>(new Set());
    const [showHints, setShowHints] = useState<boolean>(true);
    const [lastClickPosition, setLastClickPosition] = useState<HintPosition | null>(null);
    const [initialHeight, setInitialHeight] = useState<number | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const toolContainerRef = useRef<HTMLDivElement>(null);

    // Hook created as a workaround to check if hints should be displayed based off component height
    // Its a workaround cause I cant modify the attack tools directly
    // Still works cause the heights arent fixed (for each tab) in attack tools
    // If the code is ever improved in the attack tools, a new workaround is required
    useEffect(() => {
        if (toolContainerRef.current) {
            const height = toolContainerRef.current.offsetHeight;
            setInitialHeight(height);

            // Set up ResizeObserver to track height changes
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const newHeight = entry.contentRect.height;

                    // Compare with initial height and update showHints state (tiny floating point differences are allowed)
                    if (initialHeight !== null) {
                        setShowHints(Math.abs(newHeight - initialHeight) < 1);
                    }
                }
            });

            resizeObserver.observe(toolContainerRef.current);

            return () => {
                if (toolContainerRef.current) {
                    resizeObserver.unobserve(toolContainerRef.current);
                }
            };
        }
    }, [initialHeight]);

    const handleHintClick = (hintId: string) => {
        setViewedHints((prev) => new Set([...prev, hintId]));
    };

    const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!developmentMode || !gridRef.current) return;

        const rect = gridRef.current.getBoundingClientRect();
        const x = parseFloat((((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
        const y = parseFloat((((e.clientY - rect.top) / rect.height) * 100).toFixed(1));

        setLastClickPosition({ x, y });
    };

    // Rendering function for grid lines
    const renderGridLines = () => {
        if (!developmentMode) return null;

        const gridLines = [];

        // Generate vertical lines
        for (let i = 0; i <= 100; i += 20) {
            gridLines.push(
                <div
                    key={`v-${i}`}
                    style={{
                        position: "absolute",
                        left: `${i}%`,
                        top: 0,
                        bottom: 0,
                        width: "1px",
                        backgroundColor: "rgba(255, 0, 0, 0.5)",
                        pointerEvents: "none",
                    }}
                >
                    <span
                        style={{
                            position: "absolute",
                            backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.colors.gray[0],
                            padding: "2px",
                            fontSize: theme.fontSizes.xs,
                            color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.dark[9],
                        }}
                    >
                        {i}%
                    </span>
                </div>
            );
        }
        // Generate horizontal lines
        for (let i = 0; i <= 100; i += 20) {
            gridLines.push(
                <div
                    key={`h-${i}`}
                    style={{
                        position: "absolute",
                        top: `${i}%`,
                        left: 0,
                        right: 0,
                        height: "1px",
                        backgroundColor: "rgba(255, 0, 0, 0.5)",
                        pointerEvents: "none",
                    }}
                >
                    <span
                        style={{
                            position: "absolute",
                            backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[9] : theme.colors.gray[0],
                            padding: "2px",
                            fontSize: theme.fontSizes.xs,
                            color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.dark[9],
                        }}
                    >
                        {i}%
                    </span>
                </div>
            );
        }

        return gridLines;
    };

    // Function for rendering dev mode box for coordinate copying
    const renderDevPanel = () => {
        if (!developmentMode) return null;

        return (
            <Paper
                p="xs"
                withBorder
                sx={(theme) => ({
                    position: "absolute",
                    zIndex: 1001,
                    backgroundColor:
                        theme.colorScheme === "dark"
                            ? theme.fn.rgba(theme.colors.dark[7], 0.9)
                            : theme.fn.rgba(theme.white, 0.9),
                })}
            >
                <Group spacing="xs">
                    <IconGridDots size={16} color="red" />
                    <Text size="sm" color="red" weight={700}>
                        DEV MODE
                    </Text>

                    {lastClickPosition && (
                        <>
                            <Text size="sm" weight={600}>
                                Position: x: {lastClickPosition.x}%, y: {lastClickPosition.y}%
                            </Text>
                            <CopyButton
                                value={`{ x: ${lastClickPosition.x}, y: ${lastClickPosition.y} }`}
                                timeout={2000}
                            >
                                {({ copied, copy }) => (
                                    <ActionIcon color={copied ? "teal" : "blue"} onClick={copy}>
                                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                    </ActionIcon>
                                )}
                            </CopyButton>
                        </>
                    )}
                </Group>
            </Paper>
        );
    };

    // Function for rendering click position
    const renderClickPosition = () => {
        if (!developmentMode || !lastClickPosition) return null;

        return (
            <>
                {/* Red dot at click position */}
                <div
                    style={{
                        position: "absolute",
                        top: `${lastClickPosition.y}%`,
                        left: `${lastClickPosition.x}%`,
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        zIndex: 1002,
                        backgroundColor: "red",
                    }}
                />

                {/* Coordinates at click position */}
                <div
                    style={{
                        position: "absolute",
                        top: `${lastClickPosition.y + 2}%`,
                        left: `${lastClickPosition.x + 2}%`,
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        color: "white",
                        padding: "5px 8px",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        zIndex: 1002,
                        pointerEvents: "none",
                    }}
                >
                    x: {lastClickPosition.x}%, y: {lastClickPosition.y}%
                </div>
            </>
        );
    };

    // Changed the maxwidth to an fixed value to retain hint x position
    // Height shouldnt be changed cause this component shouldnt be scrollable and shouldnt restrict height calculations of the "section box"
    // Currently The Guides wont accuratly position hints if the section box width is less than 896px
    return (
        <Box sx={{ position: "relative", maxWidth: "896px", margin: "0 auto", aspectRatio: "16/9" }}>
            {/* Development mode panel */}
            {renderDevPanel()}

            {/* Tool container */}
            <div ref={toolContainerRef} className="tool-container">
                {tool}
            </div>

            {/* Overlay container */}
            <div
                ref={gridRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1000,
                    pointerEvents: developmentMode ? "auto" : "none",
                    cursor: developmentMode ? "crosshair" : "default",
                }}
                onClick={handleGridClick}
            >
                {/* Grid lines */}
                {renderGridLines()}

                {/* Hint badges */}
                {showHints &&
                    hints
                        .filter((h) => h.visible !== false)
                        .map((hint, index) => {
                            const hintId = index.toString();
                            const isViewed = viewedHints.has(hintId);

                            return (
                                <Tooltip
                                    key={hintId}
                                    label={hint.message}
                                    position="right"
                                    withArrow
                                    width={250}
                                    multiline
                                >
                                    <Badge
                                        sx={{
                                            position: "absolute",
                                            top: `${hint.position.y}%`,
                                            left: `${hint.position.x}%`,
                                            cursor: "pointer",
                                            pointerEvents: "auto",
                                            opacity: isViewed ? 0.6 : 1,
                                            zIndex: 1001,
                                        }}
                                        size="lg"
                                        radius="xl"
                                        color={isViewed ? "gray" : "blue"}
                                        onClick={() => handleHintClick(hintId)}
                                    >
                                        <IconBulb size={13} />
                                    </Badge>
                                </Tooltip>
                            );
                        })}

                {/* Click position indicator */}
                {renderClickPosition()}
            </div>
        </Box>
    );
};

export default HintedToolGrid;
