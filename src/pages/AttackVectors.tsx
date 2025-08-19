import { Stack, Table, Title, Text } from "@mantine/core";
import { useMemo, useState } from "react";
import { getAttackVectors } from "../components/RouteWrapper";
import ToolItem from "../components/ToolItem/ToolItem";
import SearchInput from "../components/SearchInput";

export function AttackVectors() {
    const attackVectors = getAttackVectors();
    const [q, setQ] = useState("");

    // Sort first, then filter
    const sortedAttackVectors = useMemo(
        () => [...attackVectors].sort((a, b) => a.name.localeCompare(b.name)),
        [attackVectors]
    );

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();

        return sortedAttackVectors.filter((item) => {
            if (!query) return true;

            const haystack = [item.name, item.description, item.category].filter(Boolean).join(" ").toLowerCase();

            return haystack.includes(query);
        });
    }, [sortedAttackVectors, q]);

    return (
        <Stack align="center" spacing="sm" style={{ width: "100%" }}>
            <Title>Attack Vectors</Title>

            {/* Full-width search bar */}
            <div style={{ width: "100%" }}>
                <SearchInput
                    placeholder="Search attack vectors (name, description)…"
                    ariaLabel="Search attack vectors"
                    onChange={setQ}
                    autoFocus
                />
            </div>

            <Table horizontalSpacing="xl" verticalSpacing="md" fontSize="md" style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th>Attack Vector name</th>
                        <th>Attack description</th>
                        <th>Controls</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={3}>
                                <Text c="dimmed" size="sm">
                                    No attack vectors match “{q}”.
                                </Text>
                            </td>
                        </tr>
                    ) : (
                        filtered.map((tool) => (
                            <ToolItem
                                title={tool.name}
                                description={tool.description}
                                route={tool.path}
                                category={tool.category}
                                key={tool.name}
                            />
                        ))
                    )}
                </tbody>
            </Table>
        </Stack>
    );
}
