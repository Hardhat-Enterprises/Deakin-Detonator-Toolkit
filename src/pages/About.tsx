import { Stack, Text, Title } from "@mantine/core";

const AboutPage = () => {
    return (
        <Stack align={"center"}>
            <Title>About the toolkit</Title>
            <Text>In it's simplest definition, Deakin Detonator Toolkit is a penetration testing toolkit.</Text>
            <Text>Made by university students, DDT is our capstone project, completed over successive trimesters.</Text>
            <Text>
                The toolkit allows you to make use of a variety of tools, without needing the "know-how" of each
                command.
            </Text>
            <Text>
                We have simplified the penetration testing experience for both newcomers who are still learning and
                those who have been hacking for years.
            </Text>
        </Stack>
    );
};

export default AboutPage;
