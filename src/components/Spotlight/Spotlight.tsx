import { Input } from "@mantine/core";
import { SpotlightProvider, openSpotlight } from "@mantine/spotlight";
import type { SpotlightAction } from "@mantine/spotlight";
import { IconHome, IconSearch, IconStepInto, IconTools, IconWaveSawTool } from "@tabler/icons";
import { useNavigate } from "react-router-dom";

/**Trigger point in intrface */
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
        /** main */
        {
            title: "Home",
            group: "Main",
            description: "Get to home page",
            onTrigger: () => navigate("/"),
            icon: <IconHome size={18} />,
        },
        {
            title: "Tools",
            group: "Main",
            description: "Get to tools page",
            onTrigger: () => navigate("/tools"),
            icon: <IconTools size={18} />,
        },
        {
            title: "Attack Vectors",
            group: "Main",
            description: "Get to attack vectors page",
            onTrigger: () => navigate("/attack-vectors"),
            icon: <IconWaveSawTool size={18} />,
        },
        {
            title: "Walkthroughs",
            group: "Main",
            description: "Get to Walkthroughs page",
            onTrigger: () => navigate("/walkthroughs"),
            icon: <IconStepInto size={18} />,
        },
        /** tools */
        {
            title: "Nmap",
            group: "Tools",
            description: "Get to Nmap page",
            onTrigger: () => navigate("/tools/nmap"),
            icon: <IconTools size={18} />,
        },
        {
            title: "Snmp-check",
            group: "Tools",
            description: "Get to Snmp-check page",
            onTrigger: () => navigate("/tools/snmp-check"),
            icon: <IconTools size={18} />,
        },
        {
            title: "Shodan API",
            group: "Tools",
            description: "Get to Shodan API page",
            onTrigger: () => navigate("/tools/shordan-api-tool"),
            icon: <IconTools size={18} />,
        },
        /** attack vectors */
        {
            title: "CVE 2021-41773",
            group: "Attack Vector",
            description: "Get to this vector",
            onTrigger: () => navigate("/attack-vectors/cve-2021-41773"),
            icon: <IconTools size={18} />,
        },
    ];

    /**Spotlight interface setting */
    return (
        <SpotlightProvider
            limit={4}
            highlightQuery
            actions={actions}
            searchIcon={<IconSearch size={18} />}
            filter={(query, actions) =>
                actions.filter((action) =>
                    (action.title.toLowerCase() + action.group?.toString().toLowerCase()).includes(query.toLowerCase())
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
