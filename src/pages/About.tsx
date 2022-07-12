import { Button, Center, Group, Stack, Text, Title } from "@mantine/core";
import { Plus } from "tabler-icons-react";
import React from "react";
import { Command } from "@tauri-apps/api/shell";

const AboutPage = () => {
    const runCommand = async () => {
        const command = new Command("cat", ["/home/jordyn/DDT-PoC/package.json"]);
        const handle = await command.execute();
        console.log(handle.stdout);
    };

    return (
        <Group direction={"column"} position={"center"}>
            <Title>About the toolkit</Title>
            <Center>
                <Stack>
                    <Text>In it's simplest definition, Deakin Detonator Toolkit is a penetration testing toolkit.</Text>
                    <Text>
                        Made by university students, DDT is our capstone project, completed over successive trimesters.
                    </Text>
                    <Text>
                        The toolkit allows you to make use of a variety of tools, without needing the "know-how" of each
                        command.
                    </Text>
                    <Text>
                        We have simplified the penetration testing experience for both newcomers who are still learning
                        and those who have been hacking for years.
                    </Text>
                </Stack>
            </Center>
            <Button leftIcon={<Plus />} onClick={runCommand}>
                Run command
            </Button>
        </Group>
    );
};

export default AboutPage;
