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

export default function App() {
    const theme = useMantineTheme();
    const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
    const [opened, setOpened] = useState(false);

    const toggleColorScheme = (value?: ColorScheme) => {
        const nextColorScheme = value || (colorScheme === "dark" ? "light" : "dark");
        setColorScheme(nextColorScheme);
        document.body.className = nextColorScheme + "-mode"; // Update body class
        console.log("Color scheme toggled to:", nextColorScheme); // Log the color scheme change
    };

    const toggleOpened = () => {
        setOpened(!opened);
    };

    const handleGoBack = () => {
        window.history.back();
    };

    const handleGoForward = () => {
        window.history.forward();
    };

    useEffect(() => {
        document.body.className = colorScheme + "-mode"; // Initialize body class
    }, [colorScheme]);

    return (
        <div className="App">
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
                                        <Button onClick={handleGoBack} color="red">
                                            Go Back
                                        </Button>
                                    </Group>
                                </Aside>
                            </MediaQuery>
                        }
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
                                    <Text className={"large-text"} inherit variant={"gradient"} component={"span"}>
                                        Deakin Detonator Toolkit
                                    </Text>
                                </Center>
                            </Header>
                        }
                    >
                        <Routes>
                            {ROUTES.map((route) => (
                                <Route key={route.path} {...route}></Route>
                            ))}
                        </Routes>
                    </AppShell>
                    <NotificationsProvider />
                </MantineProvider>
            </ColorSchemeProvider>
        </div>
    );
}
