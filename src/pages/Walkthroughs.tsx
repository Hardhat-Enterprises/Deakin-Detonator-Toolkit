import {
    Button,
    Stack,
    Table,
    Title,
    Dialog,
    TextInput,
    Text,
    AspectRatio,
    Group,
    Select,
    useMantineColorScheme,
} from "@mantine/core";
import { getWalkthroughs } from "../components/RouteWrapper";
import ToolItem from "../components/ToolItem/ToolItem";
import { IconVideoPlus } from "@tabler/icons";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../utils/CommandHelper";
import { showNotification } from "@mantine/notifications";
import { UserGuide } from "../components/UserGuide/UserGuide";
import { useState } from "react";

export function WalkthroughsPage() {
    interface FormValues {
        URL: string;
        NAME: string;
    }

    const { colorScheme } = useMantineColorScheme();

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
    const walkthroughs = getWalkthroughs();

    return (
        <Stack align={"center"}>
            {UserGuide(
                "Walkthrough Videos",
                "How to add a Walkthrough Video \nStep 1: Use the add button to create a video page \nStep 2: Register it in the RouteWrapper"
            )}

            <Select
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value || "")}
                label="Filter for a Category"
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

            <Table horizontalSpacing="xl" verticalSpacing="md" fontSize="md">
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
                    {walkthroughs.map((walkthrough) => {
                        if (
                            !selectedCategory ||
                            selectedCategory === "All" ||
                            walkthrough.category === selectedCategory
                        ) {
                            return (
                                <ToolItem
                                    title={walkthrough.name}
                                    description={walkthrough.description}
                                    route={walkthrough.path}
                                    category={walkthrough.category}
                                    key={walkthrough.name}
                                />
                            );
                        }
                        return null;
                    })}
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
                        type={"submit"}
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
            <Title>{title}</Title>
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
