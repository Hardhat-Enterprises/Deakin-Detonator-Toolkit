import { Input, Group } from "@mantine/core";
import { SpotlightProvider, openSpotlight } from "@mantine/spotlight";
import type { SpotlightAction } from "@mantine/spotlight";
import { IconHome, IconSearch, IconTools } from "@tabler/icons";

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

const actions: SpotlightAction[] = [
    {
        title: "Home",
        description: "Get to home page",
        onTrigger: () => console.log("Home"),
        icon: <IconHome size={18} />,
    },
    {
        title: "Tools",
        description: "Get to tools page",
        onTrigger: () => console.log("Tools"),
        icon: <IconTools size={18} />,
    },
];

function Search() {
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
