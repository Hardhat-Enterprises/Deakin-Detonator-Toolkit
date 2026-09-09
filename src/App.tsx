import {
    AppShell,
    Burger,
    Center,
    ColorScheme,
    ColorSchemeProvider,
    Header,
    Image,
    MantineProvider,
    MediaQuery,
    Text,
    useMantineTheme,
    Button,
    Aside,
    Group,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navigation from "./components/NavBar/Navigation";
import { ROUTES } from "./components/RouteWrapper";
import { NotificationsProvider } from "@mantine/notifications";
import DisclaimerModal from "./pages/DisclaimerModal";

export default function App() {
    const theme = useMantineTheme();
    const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
    const [opened, setOpened] = useState(false);
    const [imageSrc, setImageSrc] = useState<string>("");
    const [disclaimerOpened, setDisclaimerOpened] = useState(false);

    const toggleColorScheme = (value?: ColorScheme) => {
        const nextColorScheme = value || (colorScheme === "dark" ? "light" : "dark");
        setColorScheme(nextColorScheme);
        document.body.className = nextColorScheme + "-mode";
        console.log("Color scheme toggled to:", nextColorScheme);
    };

    const toggleOpened = () => {
        setOpened(!opened);
    };

    useEffect(() => {
        document.body.className = colorScheme + "-mode";
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setImageSrc(prefersDarkScheme ? "/src/logo/logo-dark.png" : "/src/logo/logo-light.png");

        // Check if disclaimer has been shown in this session
        const disclaimerAccepted = sessionStorage.getItem("disclaimerAccepted");
        if (!disclaimerAccepted) {
            setDisclaimerOpened(true);
        }
    }, [colorScheme]);

    return (
        <div className="App">
            <DisclaimerModal opened={disclaimerOpened} onClose={() => setDisclaimerOpened(false)} />
            <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
                <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                    <AppShell
                        navbarOffsetBreakpoint="sm"
                        asideOffsetBreakpoint="sm"
                        fixed
                        navbar={<Navigation hidden={!opened} onNavBarClickCallback={toggleOpened} />}
                        aside={
                            <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
                                <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 120, lg: 120 }}>
                                    <Group style={{ justifyContent: "center" }}>
                                        <Button onClick={() => window.history.back()} color="red">
                                            Go Back
                                        </Button>
                                    </Group>
                                </Aside>
                            </MediaQuery>
                        }
                        header={
                            <Header height={70} p="md" style={{ padding: "10px" }}>
                                <Center
                                    inline
                                    style={{ display: "flex", justifyContent: "space-between", width: "100%" }}
                                >
                                    <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                                        <Burger
                                            opened={opened}
                                            onClick={toggleOpened}
                                            size="sm"
                                            color={theme.colors.gray[6]}
                                            mr="xl"
                                        />
                                    </MediaQuery>
                                    <Text className="large-text" inherit variant="gradient" component="span">
                                        Deakin Detonator Toolkit
                                    </Text>
                                    <Image
                                        radius="md"
                                        height={60}
                                        width="auto"
                                        fit="contain"
                                        src={imageSrc}
                                        alt="Logo"
                                    />
                                </Center>
                            </Header>
                        }
                    >
                        <Routes>
                            {ROUTES.map((route) => (
                                <Route key={route.path} {...route} />
                            ))}
                        </Routes>
                    </AppShell>
                    <NotificationsProvider />
                </MantineProvider>
            </ColorSchemeProvider>
        </div>
    );
}
