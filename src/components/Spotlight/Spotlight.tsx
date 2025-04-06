import { Input } from "@mantine/core";
import type { SpotlightAction } from "@mantine/spotlight";
import { openSpotlight, SpotlightProvider } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons";
import { useNavigate } from "react-router-dom";
import { RouteProperties, ROUTES } from "../RouteWrapper";

function SpotlightControl() {
    /*
    TODO This works fine, however it may be better if the input is unfocused
    by blurring the ref onSpotlightClose in the Search component, but I could
    not get this to work.
    */
    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
        openSpotlight();
        if (e.currentTarget) {
            e.currentTarget.blur();
        }
    };

    return (
        <Input
            variant="filled"
            radius="lg"
            size="sm"
            icon={<IconSearch size={16} />}
            placeholder="[Ctrl + K] Search..."
            onClick={handleClick}
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
            limit={6}
            highlightQuery
            actions={actions}
            searchIcon={<IconSearch size={18} />}
            filter={(query, actions) =>
                actions.filter((action) =>
                    (action.title.toLowerCase() + action.description?.toLocaleLowerCase()).includes(query.toLowerCase())
                )
            }
            searchPlaceholder="Search..."
            shortcut={['mod + K', '/']}
            nothingFoundMessage="Nothing found..."
            transition={"slide-down"}
            transitionDuration={300}
        >
            <SpotlightControl />
        </SpotlightProvider>
    );
}

export default Search;
