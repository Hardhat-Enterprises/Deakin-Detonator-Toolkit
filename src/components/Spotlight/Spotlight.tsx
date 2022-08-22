import { Input } from "@mantine/core";
import type { SpotlightAction } from "@mantine/spotlight";
import { openSpotlight, SpotlightProvider } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons";
import { useNavigate } from "react-router-dom";
import { RouteProperties, ROUTES } from "../RouteWrapper";

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

    const mapRouteToSpotlightAction = (route: RouteProperties): SpotlightAction => {
        return {
            title: route.name,
            description: route.path,
            onTrigger: () => navigate(route.path),
        };
    };

    const actions: SpotlightAction[] = ROUTES.map(mapRouteToSpotlightAction);

    return (
        <SpotlightProvider
            limit={4}
            highlightQuery
            actions={actions}
            searchIcon={<IconSearch size={18} />}
            filter={(query, actions) =>
                actions.filter((action) =>
                    (action.title.toLowerCase() + action.description?.toLocaleLowerCase()).includes(query.toLowerCase())
                )
            }
            searchPlaceholder="Search..."
            shortcut="mod + shift + 1"
            nothingFoundMessage="Nothing found..."
        >
            <SpotlightControl />
        </SpotlightProvider>
    );
}

export default Search;
