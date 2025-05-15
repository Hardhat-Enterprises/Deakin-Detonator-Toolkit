import { Navbar } from "@mantine/core";
import { ColorSchemeToggle } from "../ColorSchemeToggle/ColorSchemeToggle";
import Search from "../../utils/SpotlightSearchBar/SpotlightSearchBar";
import { MainLinks } from "./MainLinks";

export interface NavigationProps {
    hidden: boolean;
    onNavBarClickCallback: () => void;
}

export default function Navigation({ hidden, onNavBarClickCallback }: NavigationProps) {
    return (
        <Navbar p="xs" width={{ sm: 300 }} hidden={hidden} hiddenBreakpoint="sm" onClick={onNavBarClickCallback}>
            <Navbar.Section>
                <Search />
            </Navbar.Section>
            <Navbar.Section grow mt="md">
                <MainLinks />
            </Navbar.Section>
            <Navbar.Section>
                <ColorSchemeToggle />
            </Navbar.Section>
        </Navbar>
    );
}
