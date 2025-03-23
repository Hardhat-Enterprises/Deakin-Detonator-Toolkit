import { useState } from "react";
import { Modal, Button, Image, Text, Accordion, useMantineTheme, Stack, Title } from "@mantine/core";
import { IconStepInto, IconTools, IconSearch, IconTarget } from "@tabler/icons";

const AboutPage = () => {
    const theme = useMantineTheme();
    const [modalOpened, setModalOpened] = useState(true);
    const getColor = (color: string) => theme.colors[color][theme.colorScheme === "dark" ? 5 : 7];

    const imageContainerStyles = {
        width: "100%",
        maxWidth: "100%",
        overflowX: "auto" as "auto", // Add horizontal scrollbar for overflow
        display: "flex",
        justifyContent: "center",
    };

    const imageStyles = {
        minWidth: 400, // Ensures the image doesn't shrink below its intended width
        maxWidth: "100%", // Ensures the image scales down on smaller screens
    };

    return (
        <>
            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title=""
                centered
                closeOnEscape={false}
                withCloseButton={false}

                overlayOpacity={0.7}
                overlayBlur={3}
            >
                
                <Image src="src/logo/logo-dark.png" alt="logo"/>
                <Text align={"center"}>DDT does not condone unethical hacking,</Text> 
                <Text align={"center"}> Misuse can lead to jail time.</Text>  
                <Text align={"center"}>Hacking is BAD! Don't Hack!</Text>
                <Button fullWidth onClick={() => setModalOpened(false)} mt="md">
                    I Understand
                </Button>
            </Modal>
            <Stack align={"center"}>
                <Title>About the Deakin Detonator Toolkit</Title>
                <Text>In its simplest definition, Deakin Detonator Toolkit is a penetration testing toolkit.</Text>
                <Text>
                    Made by university students, DDT is our capstone project, completed over successive trimesters.
                </Text>
                <Text>
                    The toolkit allows you to make use of a variety of tools, without needing the "know-how" of each
                    command.
                </Text>
                <Text>
                    We have simplified the penetration testing experience for both newcomers who are still learning and
                    those who have been hacking for years.
                </Text>
                <Text>Learn more about what the Deakin Detonator Toolkit provides down below:</Text>
            </Stack>

            <Accordion variant="contained">
                <Accordion.Item value="Tools">
                    <Accordion.Control icon={<IconTools size={16} color={getColor("violet")} />}>
                        Tools
                    </Accordion.Control>
                    <Accordion.Panel>
                        <div style={imageContainerStyles}>
                            <Image
                                radius="md"
                                src="static/tools_page_screenshot.png"
                                alt="Screenshot of the Tools page"
                                style={imageStyles}
                            />
                        </div>
                        <Text align={"center"}>
                            The Tools page of the Deakin Detonator Toolkit provides you with a list of different tools
                            and controls for cyber security analysis. These tools can support network scanning, password
                            cracking, and much more. To explore this section of the Deakin Detonator Toolkit further,
                            press on the "Tools" category displayed on the left-hand navigation bar.
                        </Text>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="AttackVectors">
                    <Accordion.Control icon={<IconTarget size={16} color={getColor("red")} />}>
                        Attack Vectors
                    </Accordion.Control>
                    <Accordion.Panel>
                        <div style={imageContainerStyles}>
                            <Image
                                radius="md"
                                src="static/attackvectors_page_screenshot.png"
                                alt="Screenshot of the Attack Vectors page"
                                style={imageStyles}
                            />
                        </div>
                        <Text align={"center"}>
                            The Attack Vectors page of the Deakin Detonator Toolkit provides you with a list of
                            different exploits that can be used to infiltrate various operating systems. To explore this
                            section of the Deakin Detonator Toolkit further, press on the "Attack Vectors" category
                            displayed on the left-hand navigation bar.
                        </Text>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="Walkthroughs">
                    <Accordion.Control icon={<IconStepInto size={16} color={getColor("blue")} />}>
                        Walkthroughs
                    </Accordion.Control>
                    <Accordion.Panel>
                        <div style={imageContainerStyles}>
                            <Image
                                radius="md"
                                src="static/walkthroughs_page_screenshot.png"
                                alt="Screenshot of the Walkthroughs page"
                                style={imageStyles}
                            />
                        </div>
                        <Text align={"center"}>
                            The Walkthroughs page of the Deakin Detonator Toolkit provides you with a list of tutorial
                            videos. These tutorial videos can provide an explanation on how to use some of the Tools and
                            Attack Vectors listed on the Deakin Detonator Toolkit. To explore this section of the Deakin
                            Detonator Toolkit further, press on the "Walkthroughs" category displayed on the left-hand
                            navigation bar.
                        </Text>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="References">
                    <Accordion.Control icon={<IconSearch size={16} color={getColor("green")} />}>
                        References
                    </Accordion.Control>
                    <Accordion.Panel>
                        <div style={imageContainerStyles}>
                            <Image
                                radius="md"
                                src="static/references_page_screenshot.png"
                                alt="Screenshot of the References page"
                                style={imageStyles}
                            />
                        </div>
                        <Text align={"center"}>
                            The References page of the Deakin Detonator Toolkit provides you with a list of sources that
                            were used to help create the Deakin Detonator Toolkit and its contents. These sources may
                            provide a further understanding of the tools, attack vectors, and walkthrough videos within
                            the Deakin Detonator Toolkit. To explore this section of the Deakin Detonator Toolkit
                            further, press on the "References" category displayed on the left-hand navigation bar.
                        </Text>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </>
    );
};

export default AboutPage;
