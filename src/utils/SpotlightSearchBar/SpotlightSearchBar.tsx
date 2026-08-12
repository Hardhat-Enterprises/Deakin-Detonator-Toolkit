import { Input } from "@mantine/core";
import type { SpotlightAction } from "@mantine/spotlight";
import { openSpotlight, SpotlightProvider } from "@mantine/spotlight";
import { IconSearch } from "@tabler/icons";
import { useNavigate } from "react-router-dom";
import { RouteProperties, ROUTES } from "../../components/RouteWrapper";

/**
 * SpotlightControl Component
 * Renders an input field that triggers the Spotlight search interface.
 * The input field blurs itself after being clicked to avoid remaining focused.
 */
function SpotlightControl() {
    /**
     * Handles the click event on the input field.
     * Opens the Spotlight search interface and blurs the input field.
     * @param e - The mouse event triggered by clicking the input field.
     */
    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
        openSpotlight(); // Opens the Spotlight search interface
        if (e.currentTarget) {
            e.currentTarget.blur(); // Blurs the input field to unfocus it
        }
    };

    return (
        <Input
            variant="filled" // Input style variant
            radius="lg" // Rounded corners
            size="sm" // Small input size
            icon={<IconSearch size={16} />} // Search icon inside the input
            placeholder="Quick search here..." // Placeholder text for the input
            onClick={handleClick} // Trigger Spotlight search on click
        />
    );
}

/**
 * Search Component
 * Provides the Spotlight search functionality for navigating between routes.
 * Maps application routes to Spotlight actions and renders the SpotlightProvider.
 */
function Search() {
    const navigate = useNavigate(); // React Router hook for navigation

    /**
     * Maps a route to a SpotlightAction object.
     * Each action represents a searchable item in the Spotlight interface.
     * @param route - A route object containing name and path.
     * @returns A SpotlightAction object for the Spotlight search.
     */
    const mapRouteToSpotlightAction = (route: RouteProperties): SpotlightAction => {
        return {
            title: route.name, // The name of the route (displayed in Spotlight)
            description: route.path, // The path of the route (displayed in Spotlight)
            onTrigger: () => navigate(route.path), // Navigate to the route when triggered
        };
    };

    // Generate Spotlight actions from the application's routes
    const actions: SpotlightAction[] = ROUTES.map(mapRouteToSpotlightAction);

    return (
        <SpotlightProvider
            limit={6} // Limit the number of search results displayed
            highlightQuery // Highlight the query in the search results
            actions={actions} // The list of Spotlight actions
            searchIcon={<IconSearch size={18} />} // Icon displayed in the Spotlight search bar
            /**
             * Custom filter function for Spotlight search.
             * Filters actions based on the query matching the title or description.
             * @param query - The user's search query.
             * @param actions - The list of Spotlight actions.
             * @returns Filtered actions matching the query.
             */
            filter={(query, actions) =>
                actions.filter((action) =>
                    (action.title.toLowerCase() + action.description?.toLowerCase()).includes(query.toLowerCase())
                )
            }
            searchPlaceholder="Search..." // Placeholder text for the Spotlight search bar
            shortcut={["mod + k", "/"]} // Keyboard shortcut to open Spotlight (e.g., Ctrl+K)
            nothingFoundMessage="Nothing found..." // Message displayed when no results are found
            transition={"slide-down"}
            transitionDuration={300}
        >
            <SpotlightControl />
        </SpotlightProvider>
    );
}

export default Search;
