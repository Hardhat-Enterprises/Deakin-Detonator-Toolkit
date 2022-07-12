import { useState } from "react";
import "./App.css";
import {
    AppShell,
    Burger,
    Button,
    Center,
    ColorScheme,
    ColorSchemeProvider,
    Header,
    MantineProvider,
    MediaQuery,
    Text,
    useMantineTheme,
} from "@mantine/core";
import Navigation from "./components/NavBar/Navigation";
import AboutPage from "./components/AboutPage/AboutPage";
import { Plus } from "tabler-icons-react";
import { Command } from "@tauri-apps/api/shell";

export default function App() {
    const theme = useMantineTheme();
    const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
    const [opened, setOpened] = useState(false);

    const toggleColorScheme = (value?: ColorScheme) => {
        const nextColorScheme = value || (colorScheme === "dark" ? "light" : "dark");
        setColorScheme(nextColorScheme);
    };

    const toggleOpened = () => {
        setOpened(!opened);
    };

    const runCommand = async () => {
        const command = new Command("cat", ["/home/jordyn/DDT-PoC/package.json"]);
        const handle = await command.execute();
        console.log(handle.stdout);
    };

    return (
        <div className="App">
            <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
                <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                    <AppShell
                        navbarOffsetBreakpoint="sm"
                        asideOffsetBreakpoint="sm"
                        fixed
                        navbar={<Navigation hidden={!opened} onNavBarClickCallback={toggleOpened} />}
                        header={
                            <Header height={70} p="md">
                                <Center inline>
                                    <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                                        <Burger
                                            opened={opened}
                                            onClick={toggleOpened}
                                            size="sm"
                                            color={theme.colors.gray[6]}
                                            mr="xl"
                                        />
                                    </MediaQuery>
                                    <Text className={"large-text"} inherit variant="gradient" component="span">
                                        Deakin Detonator Toolkit
                                    </Text>
                                </Center>
                            </Header>
                        }
                    >
                        <AboutPage />
                        <Button leftIcon={<Plus />} onClick={runCommand}>
                            Run command
                        </Button>
                    </AppShell>
                </MantineProvider>
            </ColorSchemeProvider>
        </div>
    );
}
