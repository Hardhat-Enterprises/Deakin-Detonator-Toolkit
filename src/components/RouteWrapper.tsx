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
import SnmpCheck from "./SnmpCheck/SnmpCheck";
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
import Dmitry from "./Dmitry/Dmitry";
import DNSMap from "./DNSMap/DNSMap";
import Gyoithon from "./Gyoithon/Gyoithon";
import NbtscanTool from "./NbtscanTool/NbtscanTool";
import Cewl from "./Cewl/Cewl";
import NetcatTool from "./Netcat/Netcat";
import Sherlock from "./Sherlock/Sherlock";
import BEDTool from "./BedTool/BEDTool";
import Dnsrecon from "./Dnsrecon/Dnsrecon";
import Crackmapexec from "./Crackmapexec/Crackmapexec";
import FfufTool from "./Ffuf/FfufTool";
import Redeemer from "./WalkthroughPages/Redeemer";
import Fawn from "./WalkthroughPages/Fawn";
import Pentesting from "./WalkthroughPages/Pentesting";
import Traceroute from "./Traceroute/Traceroute";
import Crunch from "./Crunch/Crunch";
import Meow from "./WalkthroughPages/Meow";
import { FTPconnect } from "./FTP/FTPconnect";
import GoldenEye from "./GoldenEye/GoldenEye";
import WPScan from "./WPScan/WPScan";
import Eyewitness from "./eyewitness/eyewitness";
import MrRobot from "./WalkthroughPages/MrRobot";
import Parsero from "./parsero/parsero";
import Arjuntool from "./Arjuntool/Arjuntool";
import ForemostTool from "./Foremost/Foremost";
import Busqueda from "./WalkthroughPages/Busqueda";
import TheHarvester from "./theharvester/theharvester";
import PayloadGenerator from "./msfvenom/msfvenom";
import AircrackNG from "./AircrackNG/AircrackNG";
import AirbaseNG from "./AirbaseNG/AirbaseNG";
import Fcrackzip from "./Fcrackzip/Fcrackzip";
import GoBusterTool from "./GobusterTool/Gobuster";
import Keeper from "./WalkthroughPages/Keeper";
import Monitorstwo from "./WalkthroughPages/Monitorstwo";
import Pilgrimage from "./WalkthroughPages/Pilgrimage";
import Racecar from "./WalkthroughPages/Racecar";
import Topology from "./WalkthroughPages/Topology";
import Persistence from "./WalkthroughPages/Persistence";
import RTsort from "./RTsort/RTsort";
import Rainbowcrack from "./Rainbowcrack/Rainbowcrack";
import NSLookup from "./NSLookupTool/NSLookupTool";
import WhatWeb from "./WhatWeb/WhatWeb";

export interface RouteProperties {
    name: string;
    path: string;
    element: JSX.Element;
    description: string;
    category: string;
}

export const ROUTES: RouteProperties[] = [
    {
        name: "Home",
        path: "/",
        element: <AboutPage />,
        description: "Home page",
        category: "",
    },
    {
        name: "About",
        path: "/about",
        element: <AboutPage />,
        description: "About page",
        category: "",
    },
    {
        name: "Tools",
        path: "/tools",
        element: <ToolsPage />,
        description: "Tools page",
        category: "",
    },
    {
        name: "Attack Vectors",
        path: "/attack-vectors",
        element: <AttackVectors />,
        description: "Attack Vectors page",
        category: "",
    },
    {
        name: "Walkthroughs",
        path: "/walkthroughs",
        element: <WalkthroughsPage />,
        description: "Walkthroughs page",
        category: "",
    },
    {
        name: "References",
        path: "/references",
        element: <ReferencesPage />,
        description: "Attack Vectors page",
        category: "",
    },
    {
        name: "CVE-2021-41773",
        path: "/attack-vectors/cve-2021-41773",
        element: <CVE202141773 />,
        description: "Apache 2.4.49 and 2.4.50 RCE",
        category: "",
    },
    {
        name: "ZeroLogon",
        path: "/attack-vectors/ZeroLogon",
        element: <ZeroLogon />,
        description: "Zero Logon will let the penetester to perform an authentication attempts on windows server",
        category: "",
    },
    {
        name: "CVE-2021-44228",
        path: "/attack-vectors/cve-2021-44228",
        element: <CVE202144228 />,
        description: "Vulnerability in the Apache Log4j 2 Java library allowing RCE",
        category: "",
    },
    {
        name: "Find offset",
        path: "/attack-vectors/find-offset",
        element: <FindOffset />,
        description: "Find the offset to the instruction pointer in a buffer overflow vulnerable binary.",
        category: "",
    },
    {
        name: "CVE-2022-24112",
        path: "/attack-vectors/cve-2022-24112",
        element: <CVE202224112 />,
        description: "Apache APISIX Remote Code Execution Vulnerability",
        category: "",
    },
    {
        name: "Busqueda",
        path: "/walkthroughs/Busqueda",
        element: <Busqueda />,
        description: "A walkthrough on Busqueda Hack the Box challenge",
        category: "",
    },
    {
        name: "Fawn",
        path: "/walkthroughs/Fawn",
        element: <Fawn />,
        description: "A walkthrough on the Fawn HackTheBox Challenge showcasing DDT nmap tool",
        category: "",
    },
    {
        name: "Keeper",
        path: "/walkthroughs/Keeper",
        element: <Keeper />,
        description:
            "A walkthrough on the Keeper HackTheBox Challenge showcasing privilege escalation and web application security",
        category: "",
    },
    {
        name: "Monitorstwo",
        path: "/walkthroughs/Monitorstwo",
        element: <Monitorstwo />,
        description:
            "A walkthrough on the Monitorstwo HackTheBox Challenge centered around network monitoring and intrusion detection systems",
        category: "",
    },
    {
        name: "Meow",
        path: "/walkthroughs/Meow",
        element: <Meow />,
        description:
            "A walkthrough on the Meow HackTheBox challenge involving basic enumeration and exploitation techniques to gain access to the target system.",
        category: "",
    },
    {
        name: "MrRobot",
        path: "/walkthroughs/MrRobot",
        element: <MrRobot />,
        description: "A walkthrough on the Mr Robot TryHackMe Capture the flag",
        category: "",
    },
    {
        name: "Pentesting",
        path: "/walkthroughs/Pentesting",
        element: <Pentesting />,
        description: "A walkthrough on a Pentesting room with focus on brute force attack and privilege escalation",
        category: "",
    },
    {
        name: "Persistence",
        path: "/walkthroughs/Persistence",
        element: <Persistence />,
        description:
            "A walkthrough on HTB challenge: Persistence is Key with focus on forensics investigation on an FTP server",
        category: "",
    },
    {
        name: "Pilgrimage",
        path: "/walkthroughs/Pilgrimage",
        element: <Pilgrimage />,
        description:
            "A walkthrough on the Pilgrimage Hack the Box challenge focused on exploiting a web application vulnerability to gain access to the system",
        category: "",
    },
    {
        name: "Racecar",
        path: "/walkthroughs/Racecar",
        element: <Racecar />,
        description:
            "A walkthrough on Racecar Hack the Box challenge utilizing cryptographic analysis and reverse engineering skills to decipher and exploit a custom encryption algorithm",
        category: "",
    },
    {
        name: "Redeemer",
        path: "/walkthroughs/Redeemer",
        element: <Redeemer />,
        description:
            "A walkthrough on the Redeemer HackTheBox challenge showcasing enumeration and post-exploitation tasks, testing your expertise in penetration testing",
        category: "",
    },
    {
        name: "Topology",
        path: "/walkthroughs/Topology",
        element: <Topology />,
        description:
            "A walkthrough on Topology Hack the Box challenge which requires knowledge of network protocols, routing, and security configurations",
        category: "",
    },
    //TOOLS BELOW THIS COMMENT - PLEASE ADDE NEW TOOLS IN ALPHABETICAL ORDER
    {
        name: "Airbase NG",
        path: "/tools/AirbaseNG",
        element: <AirbaseNG />,
        description: "Airbase-ng is a tool to create fake access points",
        category: "Wireless Attacks and Rogue Access Point Creation",
    },
    {
        name: "Aircrack NG",
        path: "/tools/AircrackNG",
        element: <AircrackNG />,
        description: "A tool for cracking WEP and WPA/WPA2 passphrases using captured network packets",
        category: "Password Cracking and Authentication Testing",
    },
    {
        name: "AI-based pen-testing tool (Gyoithon)",
        path: "/tools/gyoithon",
        element: <Gyoithon />,
        description: "A HTTP/HTTPS port detector based on Naive Bayes and Deep Nueral Network",
        category: "Web Application Testing",
    },
    {
        name: "Arjun",
        path: "/tools/Arjuntool",
        element: <Arjuntool />,
        description: "Arjun can find query parameters for URL endpoints.",
        category: "Web Application Testing",
    },
    {
        name: "ARP Spoofing",
        path: "/tools/ARPSpoofing",
        element: <ARPSpoofing />,
        description: "ARP spoof tool to poison the MAC address between two targets.",
        category: "Attack Tools",
    },
    {
        name: "bed",
        path: "/tools/bed",
        element: <BEDTool />,
        description:
            "BED is a program which is designed to check daemons for potential buffer overflows, format strings",
        category: "Information Gathering and Analysis",
    },
    {
        name: "Cewl",
        path: "/tools/Cewl",
        element: <Cewl />,
        description: "Custom word list generator",
        category: "Password Cracking and Authentication Testing",
    },
    {
        name: "Crackmapexec",
        path: "/tools/Crackmapexec",
        element: <Crackmapexec />,
        description: "Crackmapexec is a swiss army knife use for pentesting Active Directory or Windows  environments.",
        category: "Vulnerability Assessment and Exploitation",
    },
    {
        name: "Crunch",
        path: "/tools/Crunch",
        element: <Crunch />,
        description: "Crunch is a wordlist generator where you can specify a standard character set or a custom one.",
        category: "Password Cracking and Authentication Testing",
    },
    {
        name: "Dirb",
        path: "/tools/Dirb",
        element: <DirbTool />,
        description: "Dirb tool",
        category: "Web Application Testing",
    },
    {
        name: "dmitry",
        path: "/tools/dmitry",
        element: <Dmitry />,
        description: "Deepmagic Information Gathering Tool",
        category: "Information Gathering and Analysis",
    },
    {
        name: "DNSenum",
        path: "/tools/dnsenum",
        element: <DnsenumTool />,
        description: "DNS enumeration tool",
        category: "Information Gathering and Analysis",
    },
    {
        name: "DNSMap",
        path: "/tools/dnsmap",
        element: <DNSMap />,
        description: "DNS Mapping Tool",
        category: "Information Gathering and Analysis",
    },
    {
        name: "Dnsrecon",
        path: "/tools/Dnsrecon",
        element: <Dnsrecon />,
        description: "Dnsrecon is a python script that is used to find different hosts",
        category: "Information Gathering and Analysis",
    },
    {
        name: "Enum4Linux",
        path: "/tools/enum4linux",
        element: <Enum4Linux />,
        description: "Windows and Samba information enumeration tool",
        category: "Network Scanning and Enumeration",
    },
    {
        name: "EyeWitness",
        path: "/tools/eyewitness",
        element: <Eyewitness />,
        description: "EyeWitness scans listed URLs and provides a HTML report about them, including screenshots.",
        category: "Web Application Testing",
    },
    {
        name: "Fcrackzip",
        path: "/tools/Fcrackzip",
        element: <Fcrackzip />,
        description: "A tool for cracking password of a protected zip file",
        category: "Password Cracking and Authentication Testing",
    },
    {
        name: "Ffuf",
        path: "/tools/Ffuf",
        element: <FfufTool />,
        description: "FFuf is a brute force web fuzzer for directory and resource discovery",
        category: "Web Application Testing",
    },
    {
        name: "Foremost",
        path: "/tools/foremost",
        element: <ForemostTool />,
        description: "File/Data recovery tool",
        category: "File Analysis and Recovery",
    },
    {
        name: "FTPconnect",
        path: "/tools/FTPconnect",
        element: <FTPconnect />,
        description: "FTPconnect tool",
        category: "Miscellaneous",
    },
    {
        name: "GoBuster",
        path: "/tools/GoBusterTool",
        element: <GoBusterTool />,
        description: "A tool used for directory and file brute-forcing on web servers.",
        category: "Web Application Testing",
    },
    {
        name: "GoldenEye",
        path: "/tools/GoldenEye",
        element: <GoldenEye />,
        description: "HTTP DoS Test Tool",
        category: "Attack Tools",
    },
    {
        name: "Hashcat",
        path: "/tools/hashcat",
        element: <Hashcat />,
        description: "Hashcat hash restoring tool",
        category: "Password Cracking and Authentication Testing",
    },
    {
        name: "Hydra",
        path: "/tools/Hydra",
        element: <Hydra />,
        description: "Login Cracker",
        category: "Password Cracking and Authentication Testing",
    },
    {
        name: "JohnTheRipper",
        path: "/tools/JohnTheRipper",
        element: <JohnTheRipper />,
        description: "Utility for cracking passwords",
        category: "Password Cracking and Authentication Testing",
    },
    {
        name: "Metagoofil",
        path: "/tools/metagoofil",
        element: <Metagoofil />,
        description:
            "Metagoofil is an information gathering tool designed for extracting metadata of public documents (pdf,doc,xls,ppt,docx,pptx,xlsx) belonging to a target company.",
        category: "File Analysis and Recovery",
    },
    {
        name: "msfvenom",
        path: "/tools/msfvenom",
        element: <PayloadGenerator />,
        description: "Generates payload files for use in exploits",
        category: "Attack Tools",
    },
    {
        name: "Nbtscan",
        path: "/tools/nbtscan",
        element: <NbtscanTool />,
        description: "Tool used for scanning NetBIOS information on a network",
        category: "Network Scanning and Enumeration",
    },
    {
        name: "Netcat",
        path: "/tools/Netcat",
        element: <NetcatTool />,
        description: "Netcat",
        category: "Network Scanning and Enumeration",
    },
    {
        name: "Nmap",
        path: "/tools/nmap",
        element: <NmapTool />,
        description: "Network scanning tool",
        category: "Network Scanning and Enumeration",
    },
    {
        name: "NSLookup",
        path: "/tools/nslookuptool",
        element: <NSLookup />,
        description: "Network scanning tool",
        category: "Network Scanning and Enumeration",
    },
    {
        name: "Parsero",
        path: "/tools/parsero",
        element: <Parsero />,
        description: "Python Script that reads Robots.txt of w webserver to view Disallow entries",
        category: "Web Application Testing",
    },
    {
        name: "RTsort",
        path: "/tools/RTsort",
        element: <RTsort />,
        description: "RTSort is a subfuntion of the Rainbow Crack tool. This function sorts created rainbow tables.",
        category: "Password Cracking and Authentication Testing",
    },
    {
        name: "Rainbowcrack",
        path: "/tools/Rainbowcrack",
        element: <Rainbowcrack />,
        description:
            "RainbowCrack is a computer program which generates rainbow tables to be used in password cracking",
        category: "Password cracking and Authentication testing",
    },
    {
        name: "SearchSploit",
        path: "/tools/SearchSploit",
        element: <SearchSploit />,
        description: "SearchSploit Utility. Allow you to search through exploits, shellcodes and papers.",
        category: "Vulnerabilityy Assessment and Exploitation",
    },
    {
        name: "Sherlock",
        path: "/tools/Sherlock",
        element: <Sherlock />,
        description: "Tool to find username across social network",
        category: "Information Gathering and Analysis",
    },
    {
        name: "Shodan API tool",
        path: "/tools/shodan-api-tool",
        element: <ShodanAPITool />,
        description: "Network scan using Shodan API",
        category: "Vulnerability Assessment and Exploitation",
    },
    {
        name: "SMB Enumeration",
        path: "/tools/SMBEnumeration",
        element: <SMBEnumeration />,
        description: "SMB Enumeration tool",
        category: "Network Scanning and Enumeration",
    },
    {
        name: "SMG-Ghost Scanner",
        path: "/tools/SMGGhostScanner",
        element: <SMGGhostScanner />,
        description: "Scan whether the target is vulnerable to CVE2020-0796.",
        category: "Vulnerability Assessment and Exploitation",
    },
    {
        name: "SnmpCheck",
        path: "/tools/snmpcheck",
        element: <SnmpCheck />,
        description: "Detects network devices using SNMP protocol",
        category: "Network Scanning and Enumeration",
    },
    {
        name: "The Harvester",
        path: "/tools/theharvester",
        element: <TheHarvester />,
        description: "Harvest subdomain names, e-mail addresses, etc. from different public sources",
        category: "Information Gathering and Analysis",
    },
    {
        name: "Traceroute",
        path: "/tools/Traceroute",
        element: <Traceroute />,
        description:
            "The traceroute utility displays the route used by IP packets on their way to a specified network (or Internet) host.",
        category: "Network Scanning and Enumeration",
    },
    {
        name: "Urlsnarf",
        path: "/tools/Urlsnarf",
        element: <Urlsnarf />,
        description: "HTTP Sniffer",
        category: "Network Scanning and Enumeration",
    },
    {
        name: "WhatWeb",
        path: "/tools/WhatWeb",
        element: <WhatWeb />,
        description: "WhatWeb scans websites and recognises web technologies.",
        category: "Web Application Testing",
    },
    {
        name: "WPScan",
        path: "/tools/WPScan",
        element: <WPScan />,
        description:
            "WPScan is an enumeration tool that scans remote WordPress installations in attempt to identify security issues.",
        category: "Web Application Testing",
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
