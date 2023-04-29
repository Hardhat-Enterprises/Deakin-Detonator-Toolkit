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
import SMGGhostScanner from "./SMGGhostScanner/SMGGhostScanner";
import ARPSpoofing from "./ArpSpoof/ArpSpoof";
import { CVE202224112 } from "./CVE-2022-24112/CVE-2022-24112";
import Enum4Linux from "./Enum4Linux/Enum4Linux";
import DnsenumTool from "./DNSenumTool/DNSenumTool";
import Metagoofil from "./metagoofil/metagoofil";
import DNSMap from "./DNSMap/DNSMap";
import Gyoithon from "./Gyoithon/Gyoithon";
import Cewl from "./Cewl/Cewl";
import NetcatTool from "./Netcat/Netcat";
import Sherlock from "./Sherlock/Sherlock";
import BEDTool from "./BedTool/BEDTool";
import Dnsrecon from "./Dnsrecon/Dnsrecon";
import Redeemer from "./WalkthroughPages/Redeemer";
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
        name: "DNSenum",
        path: "/tools/dnsenum",
        element: <DnsenumTool />,
        description: "DNS enumeration tool",
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
    {
        name: "SMG-Ghost Scanner",
        path: "/tools/SMGGhostScanner",
        element: <SMGGhostScanner />,
        description: "Scan whether the target is vulnerable to CVE2020-0796.",
    },
    {
        name: "ARP Spoofing",
        path: "/tools/ARPSpoofing",
        element: <ARPSpoofing />,
        description: "ARP spoof tool to poison the MAC address between two targets.",
    },
    {
        name: "Enum4Linux",
        path: "/tools/enum4linux",
        element: <Enum4Linux />,
        description: "Windows and Samba information enumeration tool",
    },
    {
        name: "Metagoofil",
        path: "/tools/metagoofil",
        element: <Metagoofil />,
        description:
            "Metagoofil is an information gathering tool designed for extracting metadata of public documents (pdf,doc,xls,ppt,docx,pptx,xlsx) belonging to a target company.",
    },
    {
        name: "CVE-2022-24112",
        path: "/attack-vectors/cve-2022-24112",
        element: <CVE202224112 />,
        description: "Apache APISIX Remote Code Execution Vulnerability",
    },
    {
        name: "DNSMap",
        path: "/tools/dnsmap",
        element: <DNSMap />,
        description: "DNS Mapping Tool",
    },
    {
        name: "AI-based pen-testing tool (Gyoithon)",
        path: "/tools/gyoithon",
        element: <Gyoithon />,
        description: "A HTTP/HTTPS port detector based on Naive Bayes and Deep Nueral Network",
    },
    {
        name: "Cewl",
        path: "/tools/Cewl",
        element: <Cewl />,
        description: "Custom word list generator",
    },
    {
        name: "Netcat",
        path: "/tools/Netcat",
        element: <NetcatTool />,
        description: "Netcat",
    },
    {
        name: "Sherlock",
        path: "/tools/Sherlock",
        element: <Sherlock />,
        description: "Tool to find username across social network",
    },
    {
        name: "bed",
        path: "/tools/bed",
        element: <BEDTool />,
        description:
            "BED is a program which is designed to check daemons for potential buffer overflows, format strings",
    },
    {
        name: "Dnsrecon",
        path: "/tools/Dnsrecon",
        element: <Dnsrecon />,
        description: "Dnsrecon is a python script that is used to find different hosts",
    },
    {
        name: "Redeemer",
        path: "/walkthroughs/Redeemer",
        element: <Redeemer />,
        description: "A walkthrough on the Redeemer HackTheBox challenge showcasing nmap tool",
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
