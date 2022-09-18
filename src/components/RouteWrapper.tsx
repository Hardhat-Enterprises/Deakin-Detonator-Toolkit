import AboutPage from "../pages/About";
import { AttackVectors } from "../pages/AttackVectors";
import ReferencesPage from "../pages/References";
import ToolsPage from "../pages/Tools";
import { CVE202141773 } from "./CVE-2021-41773/CVE-2021-41773";
import CVE202144228 from "./CVE-2021-44228/CVE-2021-44228";
import { DirbTool } from "./DirbTool/DirbTool";
import FindOffset from "./FindOffset/FindOffset";
import Hashcat from "./Hashcat/Hashcat";
import JohnTheRipper from "./JohnTheRipper/JohnTheRipper";
import NmapTool from "./NmapTool/NmapTool";
import { ShodanAPITool } from "./Shodan/Shodan-API-Tool";
import SMBEnumeration from "./SMBEnumeration/SMBEnumeration";
import SnmpCheck from "./SmnpCheck/SmnpCheck";
import Hydra from "./Hydra/Hydra";
import Urlsnarf from "./Urlsnarf/Urlsnarf";
import { ZeroLogon } from "./ZeroLogon/Zerologon";
import SearchSploit from "./SearchSploit/SearchSploit";
import { WalkthroughsPage } from "../pages/Walkthroughs";
<<<<<<< HEAD
=======
import VulscanTool from "./VulscanTool/VulscanTool";
import { CVE20170144 } from "./CVE-2017-0144/CVE-2017-0144";
>>>>>>> 47c60a5 (CVE-2017-0144 attack vector/exploit added)

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
        name: "Walkthroughs",
        path: "/walkthroughs",
        element: <WalkthroughsPage />,
        description: "Walkthroughs page",
    },
    {
        name: "References",
        path: "/references",
        element: <ReferencesPage />,
        description: "Attack Vectors page",
    },
    {
        name: "Nmap",
        path: "/tools/nmap",
        element: <NmapTool />,
        description: "Network scanning tool",
    },
    {
        name: "SMB Enumeration",
        path: "/tools/SMBEnumeration",
        element: <SMBEnumeration />,
        description: "SMB Enumeration tool",
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
        description: "Utility for cracking passwords",
    },
    {
        name: "CVE-2021-41773",
        path: "/attack-vectors/cve-2021-41773",
        element: <CVE202141773 />,
        description: "Apache 2.4.49 and 2.4.50 RCE",
    },
    {
        name: "ZeroLogon",
        path: "/attack-vectors/ZeroLogon",
        element: <ZeroLogon />,
        description: "Zero Logon will let the penetester to perform an authentication attempts on windows server",
    },
    {
        name: "CVE-2021-44228",
        path: "/attack-vectors/cve-2021-44228",
        element: <CVE202144228 />,
        description: "Vulnerability in the Apache Log4j 2 Java library allowing RCE",
    },
    {
        name: "CVE-2017-0144",
        path: "/attack-vectors/cve-2017-0144",
        element: <CVE20170144 />,
        description: "Windows SMB (SMBv1) Remote Code Execution Vulnerability",
    },
    {
        name: "Find offset",
        path: "/attack-vectors/find-offset",
        element: <FindOffset />,
        description: "Find the offset to the instruction pointer in a buffer overflow vulnerable binary.",
    },
    {
        name: "Hashcat",
        path: "/tools/hashcat",
        element: <Hashcat />,
        description: "Hashcat hash restoring tool",
    },
    {
        name: "Hydra",
        path: "/tools/Hydra",
        element: <Hydra />,
        description: "Login Cracker",
    },
    {
        name: "Urlsnarf",
        path: "/tools/Urlsnarf",
        element: <Urlsnarf />,
        description: "HTTP Sniffer",
    },
    {
        name: "SearchSploit",
        path: "/tools/SearchSploit",
        element: <SearchSploit />,
        description: "SearchSploit Utility. Allow you to search through exploits, shellcodes and papers.",
    },
];

export function getTools() {
    return ROUTES.filter((route) => route.path.startsWith("/tools/"));
}

export function getAttackVectors() {
    return ROUTES.filter((route) => route.path.startsWith("/attack-vectors/"));
}

export function getWalkthroughs() {
    return ROUTES.filter((route) => route.path.startsWith("/walkthroughs/"));
}
