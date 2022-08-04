import {
    AppShell,
    Burger,
    Center,
    ColorScheme,
    ColorSchemeProvider,
    Header,
    MantineProvider,
    MediaQuery,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Navigation from "./components/NavBar/Navigation";
import NmapTool from "./components/NmapTool/NmapTool";
import SnmpCheck from "./components/SmnpCheck/SmnpCheck";
import AboutPage from "./pages/About";
import ToolsPage from "./pages/Tools";
import AttackVectorsPage from "./pages/Attack Vectors";
import WalkthroughsPage from "./pages/Walkthroughs";
import ReferencesPage from "./pages/References";

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
                        <Routes>
                            <Route path="/" element={<AboutPage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/attackvectors" element={<AttackVectorsPage />} />
                            <Route path="/tools" element={<ToolsPage />} />
                            <Route path="/tools/nmap" element={<NmapTool />} />
                            <Route path="/tools/snmp-check" element={<SnmpCheck />} />
                            <Route path="/walkthroughs" element={<WalkthroughsPage />} />
                            <Route path="/references" element={<ReferencesPage />} />
                        </Routes>
                    </AppShell>
                </MantineProvider>
            </ColorSchemeProvider>
        </div>
    );
}
