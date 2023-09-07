import { Button, Stack, Table, Title, Dialog, TextInput, Text, AspectRatio, Group } from "@mantine/core";
import { getWalkthroughs } from "../components/RouteWrapper";
import ToolItem from "../components/ToolItem/ToolItem";
import { IconVideoPlus } from "@tabler/icons";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { CommandHelper } from "../utils/CommandHelper";
import { showNotification } from "@mantine/notifications";
import { UserGuide } from "../components/UserGuide/UserGuide";

export function WalkthroughsPage() {
    interface FormValues {
        URL: string;
        NAME: string;
    }
    const rows = getWalkthroughs().map((tool) => {
        return <ToolItem title={tool.name} description={tool.description} route={tool.path} category={tool.category} key={tool.name} />;
    });
    const [opened, { toggle, close }] = useDisclosure(false);

    let form = useForm({
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
    return (
        <Stack align={"center"}>
            {UserGuide(
                "Walkthrough Videos",
                "How to add a Walkthrough Video \nStep 1: Use the add button to create a video page \nStep 2: Register it in the RouteWrapper"
            )}
            <Table horizontalSpacing="xl" verticalSpacing="md" fontSize="md">
                <thead>
                    <tr>
                        <th>Walkthrough name</th>
                        <th>Walkthrough description</th>
                        <th>
                            <Button onClick={toggle} leftIcon={<IconVideoPlus size={20} />}>
                                Add Videos
                            </Button>
                        </th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
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
                            styles={(theme) => ({ root: { marginBottom: 10 } })}
                            required
                            {...form.getInputProps("URL")}
                            placeholder="https://www.youtube.com/embed/lMSJUkPPWEY"
                            sx={{ flex: 1 }}
                        />
                    </Group>
                    <Group>
                        <Text>Name:</Text>
                        <TextInput
                            styles={(theme) => ({ root: { marginBottom: 10 } })}
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
                                message: "Remember to rgister it in the RouteWrapper!",
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
