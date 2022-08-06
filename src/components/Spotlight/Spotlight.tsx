import { Input, Group } from "@mantine/core";
import { SpotlightProvider, openSpotlight } from "@mantine/spotlight";
import type { SpotlightAction } from "@mantine/spotlight";
import { IconHome, IconSearch, IconTools } from "@tabler/icons";
import { useNavigate } from "react-router-dom";

function SpotlightControl() {
    return (
        <Input
            variant="filled"
            radius="lg"
            size="sm"
            icon={<IconSearch size={16} />}
            placeholder="Quick search here..."
            onClick={() => openSpotlight()}
        />
    );
}

function Search() {
    let navigate = useNavigate();

    const actions: SpotlightAction[] = [
        {
            title: "Home",
            description: "Get to home page",
            onTrigger: () => navigate("/"),
            icon: <IconHome size={18} />,
        },
        {
            title: "Tools",
            description: "Get to tools page",
            onTrigger: () => navigate("/tools"),
            icon: <IconTools size={18} />,
        },
    ];

    return (
        <SpotlightProvider
            actions={actions}
            searchIcon={<IconSearch size={18} />}
            searchPlaceholder="Search..."
            shortcut="mod + shift + 1"
            nothingFoundMessage="Nothing found..."
        >
            <SpotlightControl />
        </SpotlightProvider>
    );
}

export default Search;
