import AboutPage from "../pages/About";
import { AttackVectors } from "../pages/AttackVectors";
import ToolsPage from "../pages/Tools";
import { CVE202141773 } from "./CVE-2021-41773/CVE-2021-41773";
import { DirbTool } from "./DirbTool/DirbTool";
import FindOffset from "./FindOffset/FindOffset";
import JohnTheRipper from "./JohnTheRipper/JohnTheRipper";
import NmapTool from "./NmapTool/NmapTool";
import { ShodanAPITool } from "./Shodan/Shodan-API-Tool";
import SnmpCheck from "./SmnpCheck/SmnpCheck";

export interface RouteProperties {
    name: string;
    path: string;
    element: JSX.Element;
    description: string;
}

export const ROUTES: RouteProperties[] = [
    {
        name: "Home",
        path: "/",
        element: <AboutPage />,
        description: "Home page",
    },
    {
        name: "About",
        path: "/about",
        element: <AboutPage />,
        description: "About page",
    },
    {
        name: "Tools",
        path: "/tools",
        element: <ToolsPage />,
        description: "Tools page",
    },
    {
        name: "Attack Vectors",
        path: "/attack-vectors",
        element: <AttackVectors />,
        description: "Attack Vectors page",
    },
    {
        name: "Nmap",
        path: "/tools/nmap",
        element: <NmapTool />,
        description: "Network scanning tool",
    },
    {
        name: "SnmpCheck",
        path: "/tools/snmpcheck",
        element: <SnmpCheck />,
        description: "SNMP enumeration tool",
    },
    {
        name: "Shodan API tool",
        path: "/tools/shodan-api-tool",
        element: <ShodanAPITool />,
        description: "Network scan using Shodan API",
    },
    {
        name: "Dirb",
        path: "/tools/Dirb",
        element: <DirbTool />,
        description: "Dirb tool",
    },
    {
        name: "JohnTheRipper",
        path: "/tools/JohnTheRipper",
        element: <JohnTheRipper />,
        description: "Utility for cracking passcodes",
    },
    {
        name: "CVE-2021-41773",
        path: "/attack-vectors/cve-2021-41773",
        element: <CVE202141773 />,
        description: "Apache 2.4.49 and 2.4.50 RCE",
    },
];

export function getTools() {
    return ROUTES.filter((route) => route.path.startsWith("/tools/"));
}

export function getAttackVectors() {
    return ROUTES.filter((route) => route.path.startsWith("/attack-vectors/"));
}
