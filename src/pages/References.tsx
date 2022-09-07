import { Group, Stack, Title } from "@mantine/core";
import { Reference } from "../components/Reference/Reference";

const ReferencesPage = () => {
    return (
        <>
            <Group position={"center"}>
                <div>
                    <p>
                        <Title>References</Title>
                    </p>
                </div>
            </Group>

            <Group position={"center"} align={"left"}>
                <Stack>
                    <Title order={4}>GUI Development:</Title>
                    <Reference
                        name={"ReactJS"}
                        description={"Deakin Detonator Toolkit is built using ReactJS"}
                        url={"https://www.reactjs.org"}
                    />
                    <Title order={4}>Tools:</Title>
                    <Reference
                        name={"Nmap"}
                        description={"Nmap a network scanning tool."}
                        url={"https://www.nmap.org"}
                    />
                    <Reference
                        name={"Hashcat"}
                        description={"Hashcat has cracking tools"}
                        url={"https://hashcat.net/hashcat"}
                    />{" "}
                    <Reference
                        name={"JohnTheRipper"}
                        description={"JohnTheRipper is a free and open source password cracking tool."}
                        url={"https://www.openwall.com/john"}
                    />
                </Stack>
            </Group>
        </>
    );
};

export default ReferencesPage;
