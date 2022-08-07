import AboutPage from "../pages/About";
import { AttackVectors } from "../pages/AttackVectors";
import ToolsPage from "../pages/Tools";
import { CVE202141773 } from "./CVE-2021-41773/CVE-2021-41773";
import NmapTool from "./NmapTool/NmapTool";
import { ShodanAPITool } from "./Shodan/Shodan-API-Tool";
import SnmpCheck from "./SmnpCheck/SmnpCheck";

export interface RouteProperties {
    name: string;
    path: string;
    element: JSX.Element;
}

export const ROUTES: RouteProperties[] = [
    {
        name: "Home",
        path: "/",
        element: <AboutPage />,
    },
    {
        name: "About",
        path: "/about",
        element: <AboutPage />,
    },
    {
        name: "Tools",
        path: "/tools",
        element: <ToolsPage />,
    },
    {
        name: "Attack Vectors",
        path: "/attack-vectors",
        element: <AttackVectors />,
    },
    {
        name: "Nmap",
        path: "/tools/nmap",
        element: <NmapTool />,
    },
    {
        name: "SnmpCheck",
        path: "/tools/snmp-check",
        element: <SnmpCheck />,
    },
    {
        name: "Shodan API tool",
        path: "/tools/shodan-api-tool",
        element: <ShodanAPITool />,
    },
    {
        name: "CVE-2021-41773",
        path: "/attack-vectors/cve-2021-41773",
        element: <CVE202141773 />,
    },
];
