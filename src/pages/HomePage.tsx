import { Image, Text, Stack, Title, Button, Grid, Card, CardSection, useMantineTheme } from "@mantine/core";
import { IconRocket, IconSchool } from "@tabler/icons";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const navigate = useNavigate();

    const handleBeginnerGuideBtnClick = () => {
        navigate("/beginner-guides");
    };

    return (
        <>
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
