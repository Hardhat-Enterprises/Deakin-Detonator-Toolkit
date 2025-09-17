import { Button, Stack, Table, Dialog, TextInput, Text, AspectRatio, Group, Select } from "@mantine/core";
import { getWalkthroughs } from "../components/RouteWrapper";
import ToolItem from "../components/ToolItem/ToolItem";
import { IconVideoPlus } from "@tabler/icons";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../utils/CommandHelper";
import { showNotification } from "@mantine/notifications";
import { UserGuide } from "../components/UserGuide/UserGuide";
import { useMemo, useState } from "react";
import SearchInput from "../components/SearchInput";

export function WalkthroughsPage() {
    interface FormValues {
        URL: string;
        NAME: string;
    }

    const [opened, { toggle, close }] = useDisclosure(false);

    const form = useForm<FormValues>({
        initialValues: {
            URL: "",
            NAME: "",
        },
    });

    const onSubmit = async (values: FormValues) => {
        const args = [`exploits/AddVideo.py`, values.URL, values.NAME];
        const result = await CommandHelper.runCommand("python3", args);
        console.log(result);
    };

    const categories = [
        "All",
        "Information Gathering and Analysis",
        "Miscellaneous",
        "Network Scanning and Enumeration",
        "Penetration Testing",
        "Web Application Testing",
    ];

    const [selectedCategory, setSelectedCategory] = useState("");
    const [q, setQ] = useState("");
    const walkthroughs = getWalkthroughs();

    // Combine category filter + search
    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();

        return walkthroughs.filter((w) => {
            const categoryOk = !selectedCategory || selectedCategory === "All" || w.category === selectedCategory;

            if (!categoryOk) return false;
            if (!query) return true;

            const haystack = [w.name, w.description, w.category].filter(Boolean).join(" ").toLowerCase();

            return haystack.includes(query);
        });
    }, [walkthroughs, q, selectedCategory]);

    return (
        <Stack align="center" spacing="sm" style={{ width: "100%" }}>
            {UserGuide(
                "Walkthrough Videos",
                "How to add a Walkthrough Video \nStep 1: Use the add button to create a video page \nStep 2: Register it in the RouteWrapper"
            )}

            {/* Search + Category side-by-side */}
            <Group spacing="sm" style={{ width: "100%" }} grow>
                <SearchInput
                    placeholder="Search walkthroughs (name, description)…"
                    ariaLabel="Search walkthroughs"
                    onChange={setQ}
                />
                <Select
                    value={selectedCategory}
                    onChange={(value) => setSelectedCategory(value || "")}
                    placeholder="Select category"
                    data={categories}
                    required
                    styles={(theme) => ({
                        input: {
                            backgroundColor: theme.colorScheme === "light" ? theme.white : theme.colors.dark[6],
                            color: theme.colorScheme === "light" ? theme.black : theme.white,
                            borderColor: theme.colorScheme === "light" ? theme.colors.gray[4] : theme.colors.dark[4],
                        },
                        dropdown: {
                            backgroundColor: theme.colorScheme === "light" ? theme.white : theme.colors.dark[7],
                            color: theme.colorScheme === "light" ? theme.black : theme.white,
                        },
                    })}
                />
            </Group>

            <Table horizontalSpacing="xl" verticalSpacing="md" fontSize="md" style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th>Walkthrough name</th>
                        <th>Walkthrough description</th>
                        <th>Category</th>
                        <th>
                            <Button onClick={toggle} leftIcon={<IconVideoPlus size={20} />}>
                                Add Videos
                            </Button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan={4}>
                                <Text c="dimmed" size="sm">
                                    No walkthroughs match “{q || selectedCategory || "your filters"}”.
                                </Text>
                            </td>
                        </tr>
                    ) : (
                        filtered.map((walkthrough) => (
                            <ToolItem
                                title={walkthrough.name}
                                description={walkthrough.description}
                                route={walkthrough.path}
                                category={walkthrough.category}
                                key={walkthrough.name}
                            />
                        ))
                    )}
                </tbody>
            </Table>

            <Dialog
                opened={opened}
                withCloseButton
                onClose={close}
                size="lg"
                radius="md"
                position={{ top: 240, right: 40 }}
            >
                <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
                    <Text size="sm" mb="xs" weight={500}>
                        Enter embed video URL and NAME
                    </Text>
                    <Group>
                        <Text>URL:</Text>
                        <TextInput
                            styles={() => ({ root: { marginBottom: 10 } })}
                            required
                            {...form.getInputProps("URL")}
                            placeholder="https://www.youtube.com/embed/lMSJUkPPWEY"
                            sx={{ flex: 1 }}
                        />
                    </Group>
                    <Group>
                        <Text>Name:</Text>
                        <TextInput
                            styles={() => ({ root: { marginBottom: 10 } })}
                            required
                            {...form.getInputProps("NAME")}
                            placeholder="Walkthrough Example Page"
                            sx={{ flex: 1 }}
                        />
                    </Group>
                    <Button
                        type="submit"
                        onClick={() =>
                            showNotification({
                                title: "Done!",
                                message: "Remember to register it in the RouteWrapper!",
                                autoClose: false,
                            })
                        }
                    >
                        Add
                    </Button>
                </form>
            </Dialog>
        </Stack>
    );
}

export function VideoPlayer(path: string, title: string) {
    return (
        <Stack>
            <Text weight={600} size="lg">
                {title}
            </Text>
            <AspectRatio ratio={16 / 9}>
                <iframe
                    src={path}
                    title="Walkthrough video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </AspectRatio>
        </Stack>
    );
}
