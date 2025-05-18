import {
    Image,
    Text,
    Stack,
    Title,
    Button,
    Grid,
    Card,
    CardSection,
    useMantineTheme,
    Modal,
    Accordion,
} from "@mantine/core";
import { IconRocket, IconSchool } from "@tabler/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();

    const handleBeginnerGuideBtnClick = () => {
        navigate("/beginner-guides");
    };

    const [modalOpened, setModalOpened] = useState(true);
    return (
        <>
            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Welcome to the Deakin Detonator Toolkit"
                centered
                closeOnEscape={false}
                withCloseButton={false}
                closeOnClickOutside={false}
                overlayOpacity={0.7}
                overlayBlur={3}
                size="xl"
                styles={{
                    title: { fontSize: "2rem", fontWeight: "bold", textAlign: "center", width: "100%" },
                }}
            >
                <Image
                    src="src/logo/logo-dark.png"
                    alt="logo"
                    width={300}
                    style={{ display: "block", margin: "0 auto" }}
                />
                <Text align="center" style={{ overflowWrap: "break-word", whiteSpace: "normal" }}>
                    Hacking is a crime. This application is for <strong>Educational Purposes Only!</strong>
                    <br />
                    <br />
                    Misuse of this application can lead to violation of Australian and/or International Law.
                    <br />
                    <br />
                    By using this application, you confirm that you have obtained proper authorization from all relevant
                    parties before conducting any penetration testing with this software.
                    <br />
                    <br />
                    <strong>
                        <u>You</u>
                    </strong>{" "}
                    are solely responsible for managing this authorization.
                </Text>
                <Button fullWidth onClick={() => setModalOpened(false)} mt="lg">
                    I Understand
                </Button>
            </Modal>

            <Stack align={"center"}>
                <Title>Welcome to the Deakin Detonator Toolkit</Title>
                <Text>Your one-stop toolkit for both beginners and advanced penetration testers.</Text>
            </Stack>

            <Grid gutter="lg" mt="xl">
                {/* Beginner Section */}
                <Grid.Col span={6}>
                    <Card shadow="sm" p="lg" radius="md" withBorder>
                        <CardSection>
                            <Image
                                src="src/logo/Rookie.png"
                                alt="Beginner section preview"
                                height={window.outerHeight / 2}
                            />
                        </CardSection>
                        <Title order={3} align="center" mt="md">
                            Beginner Section
                        </Title>
                        <Text align="center" mt="sm">
                            Perfect for those starting their journey in penetration testing. Learn the basics through
                            guided walkthroughs and simple tools.
                        </Text>
                        <Button
                            fullWidth
                            color="blue"
                            mt="md"
                            leftIcon={<IconSchool size={18} />}
                            onClick={handleBeginnerGuideBtnClick}
                        >
                            Explore Beginner
                        </Button>
                    </Card>
                </Grid.Col>

                {/* Advanced Section */}
                <Grid.Col span={6}>
                    <Card shadow="sm" p="lg" radius="md" withBorder>
                        <CardSection>
                            <Image
                                src="src/logo/Advanced.png"
                                alt="Advanced section preview"
                                height={window.outerHeight / 2}
                            />
                        </CardSection>
                        <Title order={3} align="center" mt="md">
                            Advanced Section
                        </Title>
                        <Text align="center" mt="sm">
                            Dive deep into advanced penetration testing techniques and tools. Ideal for experienced
                            testers seeking complex strategies.
                        </Text>
                        <Button fullWidth color="violet" mt="md" leftIcon={<IconRocket size={18} />} disabled>
                            Explore Advanced
                        </Button>
                    </Card>
                </Grid.Col>
            </Grid>
        </>
    );
};

export default HomePage;
