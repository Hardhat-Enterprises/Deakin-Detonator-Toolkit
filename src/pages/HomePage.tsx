import { Image, Text, Stack, Title, Button, Grid, Card, CardSection, useMantineTheme } from "@mantine/core";
import { IconRocket, IconSchool } from "@tabler/icons";

const HomePage = () => {
    const theme = useMantineTheme(); 
    const getColor = (color: string) => theme.colors[color][theme.colorScheme === "dark" ? 5 : 7];

    return (
        <>
            <Stack align={"center"}>
                <Title>Welcome to the Deakin Detonator Toolkit</Title>
                <Text>
                    Your one-stop toolkit for both beginners and advanced penetration testers.
                </Text>
            </Stack>

            <Grid gutter="lg" mt="xl">
                {/* Beginner Section */}
                <Grid.Col span={6}>
                    <Card shadow="sm" p="lg" radius="md" withBorder>
                        <CardSection>
                            <Image
                                src="/logo/Rookie.png"  // Corrected path
                                alt="Beginner section preview"
                                height={200}
                            />
                        </CardSection>
                        <Title order={3} align="center" mt="md">
                            Beginner Section
                        </Title>
                        <Text align="center" mt="sm">
                            Perfect for those starting their journey in penetration testing. Learn the basics through guided walkthroughs and simple tools.
                        </Text>
                        <Button fullWidth color="blue" mt="md" leftIcon={<IconSchool size={18} />}>
                            Explore Beginner
                        </Button>
                    </Card>
                </Grid.Col>

                {/* Advanced Section */}
                <Grid.Col span={6}>
                    <Card shadow="sm" p="lg" radius="md" withBorder>
                        <CardSection>
                            <Image
                                src="/logo/Advanced.png"  // Corrected path
                                alt="Advanced section preview"
                                height={200}
                            />
                        </CardSection>
                        <Title order={3} align="center" mt="md">
                            Advanced Section
                        </Title>
                        <Text align="center" mt="sm">
                            Dive deep into advanced penetration testing techniques and tools. Ideal for experienced testers seeking complex strategies.
                        </Text>
                        <Button fullWidth color="violet" mt="md" leftIcon={<IconRocket size={18} />}>
                            Explore Advanced
                        </Button>
                    </Card>
                </Grid.Col>
            </Grid>
        </>
    );
};

export default HomePage;
