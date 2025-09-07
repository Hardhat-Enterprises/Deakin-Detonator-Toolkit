import { Image, Text, Accordion, useMantineTheme, Stack, Title } from "@mantine/core";
import { IconStepInto, IconTools, IconSearch, IconTarget, IconReportAnalytics, IconNews } from "@tabler/icons";

const AboutPage = () => {
    const theme = useMantineTheme();

    const getColor = (color: string) => theme.colors[color][theme.colorScheme === "dark" ? 5 : 7];
    
    const getScreenshot = (baseName: string) => {
        const isDarkMode = theme.colorScheme === "dark";
        
        // Handle different page screenshots based on theme
        switch (baseName) {
            case "tools":
                return isDarkMode ? "static/tools_dark.png" : "static/tools_light.png";
            case "attackvectors":
                return isDarkMode ? "static/attack_vector_dark.png" : "static/attack_vector_light.png";
            case "walkthroughs":
                return isDarkMode ? "static/walkthrough_dark.png" : "static/walkthrough_light.png";
            case "ai_training":
                return isDarkMode ? "static/AI_training_dark.png" : "static/AI_training_light.png";
            case "cyber_news":
                return isDarkMode ? "static/cyber_news_dark.png" : "static/cyber_news_light.png";
            case "references":
                return isDarkMode ? "static/reference_dark.png" : "static/reference_light.png";
            default:
                return `static/${baseName}_page_screenshot.png`;
        }
    };

    const imageContainerStyles = {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        marginTop: "1.5rem",
        marginBottom: "1rem",
    };

    const imageStyles = {
        maxWidth: "100%",
        height: "auto",
        width: "auto",
    };

    const textStyles = {
        textAlign: "center" as "center",
        lineHeight: 1.6,
        fontSize: "16px",
        margin: "0 auto",
        maxWidth: "none",
    };

    const accordianStyle = {
        width: "100%",
        maxWidth: "none",
        margin: "1rem 0",
        padding: "0",
    };

    return (
        <div style={{ padding: "1rem", minHeight: "100vh" }}>
            <Stack align={"center"} spacing="lg" style={{ marginBottom: "2rem" }}>
                <Title order={1} style={{ textAlign: "center", marginBottom: "1rem" }}>
                    About the Deakin Detonator Toolkit
                </Title>
                <div style={{ maxWidth: "900px", textAlign: "center", lineHeight: 1.8 }}>
                    <Text size="lg" style={{ marginBottom: "1rem" }}>
                        In its simplest definition, Deakin Detonator Toolkit is a penetration testing toolkit.
                    </Text>
                    <Text size="lg" style={{ marginBottom: "1rem" }}>
                        Made by university students, DDT is our capstone project, completed over successive trimesters.
                    </Text>
                    <Text size="lg" style={{ marginBottom: "1rem" }}>
                        The toolkit allows you to make use of a variety of tools, without needing the "know-how" of each command.
                    </Text>
                    <Text size="lg" style={{ marginBottom: "1rem" }}>
                        We have simplified the penetration testing experience for both newcomers who are still learning and those who have been hacking for years.
                    </Text>
                    <Text size="lg" weight={500}>
                        Learn more about what the Deakin Detonator Toolkit provides down below:
                    </Text>
                </div>
            </Stack>

            <Accordion variant="contained" transitionDuration={800} style={accordianStyle}>
                <Accordion.Item value="Tools">
                    <Accordion.Control icon={<IconTools size={16} color={getColor("violet")} />}>
                        Tools
                    </Accordion.Control>
                    <Accordion.Panel style={{ padding: "2rem" }}>
                        <Text style={textStyles}>
                            The Tools page of the Deakin Detonator Toolkit provides you with a list of different tools
                            and controls for cyber security analysis. These tools can support network scanning, password
                            cracking, and much more. To explore this section of the Deakin Detonator Toolkit further,
                            press on the "Tools" category displayed on the left-hand navigation bar.
                        </Text>
                        <div style={imageContainerStyles}>
                            <Image
                                radius="md"
                                src={getScreenshot("tools")}
                                alt="Screenshot of the Tools page"
                                style={imageStyles}
                            />
                        </div>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="AttackVectors">
                    <Accordion.Control icon={<IconTarget size={16} color={getColor("red")} />}>
                        Attack Vectors
                    </Accordion.Control>
                    <Accordion.Panel style={{ padding: "2rem" }}>
                        <Text style={textStyles}>
                            The Attack Vectors page of the Deakin Detonator Toolkit provides you with a list of
                            different exploits that can be used to infiltrate various operating systems. To explore this
                            section of the Deakin Detonator Toolkit further, press on the "Attack Vectors" category
                            displayed on the left-hand navigation bar.
                        </Text>
                        <div style={imageContainerStyles}>
                            <Image
                                radius="md"
                                src={getScreenshot("attackvectors")}
                                alt="Screenshot of the Attack Vectors page"
                                style={imageStyles}
                            />
                        </div>
                    </Accordion.Panel>
                </Accordion.Item>


                <Accordion.Item value="Walkthroughs">
                    <Accordion.Control icon={<IconStepInto size={16} color={getColor("blue")} />}>
                        Walkthroughs
                    </Accordion.Control>
                    <Accordion.Panel style={{ padding: "2rem" }}>
                        <Text style={textStyles}>
                            The Walkthroughs page of the Deakin Detonator Toolkit provides you with a list of tutorial
                            videos. These tutorial videos can provide an explanation on how to use some of the Tools and
                            Attack Vectors listed on the Deakin Detonator Toolkit. To explore this section of the Deakin
                            Detonator Toolkit further, press on the "Walkthroughs" category displayed on the left-hand
                            navigation bar.
                        </Text>
                        <div style={imageContainerStyles}>
                            <Image
                                radius="md"
                                src={getScreenshot("walkthroughs")}
                                alt="Screenshot of the Walkthroughs page"
                                style={imageStyles}
                            />
                        </div>
                    </Accordion.Panel>
                </Accordion.Item>


                <Accordion.Item value="AITraining">
                    <Accordion.Control icon={<IconReportAnalytics size={16} color={getColor("teal")} />}>
                        AI Training Scenarios
                    </Accordion.Control>
                    <Accordion.Panel style={{ padding: "2rem" }}>
                        <Text style={textStyles}>
                            The AI Training Scenarios page of the Deakin Detonator Toolkit provides you with GPT-4 powered
                            penetration testing scenarios tailored to your skill level. These dynamic scenarios help you
                            practice attack methodologies and develop strategies in a guided environment. To explore this
                            section of the Deakin Detonator Toolkit further, press on the "AI Training Scenarios" category
                            displayed on the left-hand navigation bar.
                        </Text>
                        <div style={imageContainerStyles}>
                            <Image
                                radius="md"
                                src={getScreenshot("ai_training")}
                                alt="Screenshot of the AI Training Scenarios page"
                                style={imageStyles}
                            />
                        </div>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="CyberNews">
                    <Accordion.Control icon={<IconNews size={16} color={getColor("cyan")} />}>
                        Cyber News
                    </Accordion.Control>
                    <Accordion.Panel style={{ padding: "2rem" }}>
                        <Text style={textStyles}>
                            The Cyber News page of the Deakin Detonator Toolkit provides you with the latest cybersecurity
                            news, vulnerability reports, and industry updates. Stay informed about emerging threats, new
                            attack vectors, security patches, and trending topics in the cybersecurity community. This
                            section helps you stay up-to-date with the rapidly evolving cybersecurity landscape. To explore
                            this section of the Deakin Detonator Toolkit further, press on the "Cyber News" category
                            displayed on the left-hand navigation bar.
                        </Text>
                        <div style={imageContainerStyles}>
                            <Image
                                radius="md"
                                src={getScreenshot("cyber_news")}
                                alt="Screenshot of the Cyber News page"
                                style={imageStyles}
                            />
                        </div>
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item value="References">
                    <Accordion.Control icon={<IconSearch size={16} color={getColor("green")} />}>
                        References
                    </Accordion.Control>
                    <Accordion.Panel style={{ padding: "2rem" }}>
                        <Text style={textStyles}>
                            The References page of the Deakin Detonator Toolkit provides you with a list of sources that
                            were used to help create the Deakin Detonator Toolkit and its contents. These sources may
                            provide a further understanding of the tools, attack vectors, and walkthrough videos within
                            the Deakin Detonator Toolkit. To explore this section of the Deakin Detonator Toolkit
                            further, press on the "References" category displayed on the left-hand navigation bar.
                        </Text>
                        <div style={imageContainerStyles}>
                            <Image
                                radius="md"
                                src={getScreenshot("references")}
                                alt="Screenshot of the References page"
                                style={imageStyles}
                            />
                        </div>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </div>
    );
};

export default AboutPage;
