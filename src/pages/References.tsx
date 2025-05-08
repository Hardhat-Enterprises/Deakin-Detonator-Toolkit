import { Accordion, Group, Stack, Title, useMantineTheme } from "@mantine/core";
import { IconTools, IconTarget, IconStepInto } from "@tabler/icons";
import { Reference } from "../components/Reference/Reference";

const ReferencesPage = () => {
    const theme = useMantineTheme();
    const getColor = (color: string) => theme.colors[color][theme.colorScheme === "dark" ? 5 : 7];

    return (
        <>
            {/* Page Title */}
            <Group position={"center"}>
                <Title order={1}>References</Title>
            </Group>

            <Accordion multiple>
                {/* GUI Development Category */}
                <Accordion.Item value="GUIDevelopment">
                    <Accordion.Control icon={<IconTools size={16} color={getColor("blue")} />}>
                        <Title order={4}>GUI Development</Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <Group position="center" spacing="md">
                            <Stack align="center" spacing="md">
                                <Reference
                                    name={"ReactJS"}
                                    description={"Deakin Detonator Toolkit is built using ReactJS"}
                                    url={"https://www.reactjs.org"}
                                />
                                <Reference
                                    name={"Mantine"}
                                    description={"Mantine is a React UI component library"}
                                    url={"https://mantine.dev"}
                                />
                                <Reference
                                    name={"TypeScript"}
                                    description={"TypeScript is a typed superset of JavaScript"}
                                    url={"https://www.typescriptlang.org"}
                                />
                            </Stack>
                        </Group>
                    </Accordion.Panel>
                </Accordion.Item>

                {/* Tools Category */}
                <Accordion.Item value="Tools">
                    <Accordion.Control icon={<IconTools size={16} color={getColor("violet")} />}>
                        <Title order={4}>Tools</Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <Group position="center" spacing="md">
                            <Stack align="center" spacing="md">
                                <Reference
                                    name={"Airbase-NG"}
                                    description={
                                        "Airbase-ng is multi-purpose tool aimed at attacking clients as opposed to the Access Point (AP) itself."
                                    }
                                    url={"https://www.kali.org/tools/aircrack-ng/#airbase-ng"}
                                />
                                <Reference
                                    name={"Aircrack-NG"}
                                    description={
                                        "Aircrack-ng is a network security tool used for cracking WEP and WPA/WPA2 passwords by capturing and analyzing wireless network traffic."
                                    }
                                    url={"https://www.kali.org/tools/aircrack-ng/"}
                                />
                                <Reference
                                    name={"Amass"}
                                    description={
                                        "The OWASP Amass Project performs network mapping of attack surfaces and external asset discovery using open source information gathering and active reconnaissance techniques."
                                    }
                                    url={"https://github.com/owasp-amass/amass"}
                                />

                                <Reference
                                    name={"Arjun"}
                                    description={
                                        "Arjun is a tool for finding hidden HTTP GET and POST parameters in web apps."
                                    }
                                    url={"https://www.kali.org/tools/arjun/"}
                                />
                                <Reference
                                    name={"Arpaname"}
                                    description={"Translate IP addresses to the corresponding ARPA names."}
                                    url={"https://www.kali.org/tools/bind9/#arpaname"}
                                />
                                <Reference
                                    name={"Arpfingerprint"}
                                    description={
                                        "Arpfingerprint is a tool within arp-scan which fingerprint a system using ARP."
                                    }
                                    url={"https://www.kali.org/tools/arp-scan/#arp-fingerprint"}
                                />
                                <Reference
                                    name={"Arping"}
                                    description={
                                        "Arping is a tool that sends ARP/ICMP requests to a target device and displays the reply messages."
                                    }
                                    url={"https://www.kali.org/tools/arping/"}
                                />
                                <Reference
                                    name={"ArpScan"}
                                    description={
                                        "Arp-scan is a network scanning tool that actively sends ARP requests to discover devices and IP addresses on a local network."
                                    }
                                    url={"https://www.kali.org/tools/arp-scan/"}
                                />
                                <Reference
                                    name={"ArpSpoof"}
                                    description={
                                        "Arpspoof is a tool within dsniff package. It intercept packets on a switched LAN."
                                    }
                                    url={"https://www.kali.org/tools/dsniff/#arpspoof"}
                                />
                                <Reference
                                    name={"BED"}
                                    description={
                                        "BED is a program which is designed to check daemons for potential buffer overflows, format strings et. al."
                                    }
                                    url={"https://www.kali.org/tools/bed/"}
                                />
                                <Reference
                                    name={"Bully"}
                                    description={
                                        "Bully is a tool used for brute-forcing WPA/WPA2 Wi-Fi passwords by leveraging dictionary attacks and exploiting weak passphrases."
                                    }
                                    url={"https://www.kali.org/tools/bully/"}
                                />
                                <Reference
                                    name={"Cewl"}
                                    description={
                                        "CeWL (Custom Word List generator) is a ruby app which spiders a given URL."
                                    }
                                    url={"https://www.kali.org/tools/cewl/"}
                                />

                                <Reference
                                    name={"CloudBrute"}
                                    description={
                                        "Cloudbrute is a tool for cloud enumeration and infrastructure discovery in various cloud providers."
                                    }
                                    url={"https://www.kali.org/tools/cloudbrute/"}
                                />
                                <Reference
                                    name={"CrackMapExec"}
                                    description={
                                        "CrackMapExec is a post-exploitation tool used for pentesting Windows/Active Directory environments."
                                    }
                                    url={"https://www.kali.org/tools/crackmapexec/"}
                                />
                                <Reference
                                    name={"Crunch"}
                                    description={"Crunch is a wordlist generator."}
                                    url={"https://www.kali.org/tools/crunch/"}
                                />
                                <Reference
                                    name={"DMitry"}
                                    description={
                                        "DMitry is a tool for gathering information about a host, including subdomains, emails, and open ports."
                                    }
                                    url={"https://www.kali.org/tools/dmitry/"}
                                />
                                <Reference
                                    name={"DNSenum"}
                                    description={
                                        "Dnsenum is a multithreaded perl script to enumerate DNS information of a domain and to discover non-contiguous ip blocks."
                                    }
                                    url={"https://www.kali.org/tools/dnsenum/"}
                                />
                                <Reference
                                    name={"DNSMap"}
                                    description={"DNSMap can scan for subdomains using brute-forcing techniques."}
                                    url={"https://www.kali.org/tools/dnsmap/"}
                                />
                                <Reference
                                    name={"DNSRecon"}
                                    description={
                                        "DNSRecon is a tool used for DNS enumeration, capable of performing zone transfers, record enumeration, and brute-forcing of subdomains."
                                    }
                                    url={"https://www.kali.org/tools/dnsrecon/"}
                                />
                                <Reference
                                    name={"Enum4Linux"}
                                    description={
                                        "Enux4Linux is a tool for enumerating information from Windows and Samba systems."
                                    }
                                    url={"https://www.kali.org/tools/enum4linux/"}
                                />
                                <Reference
                                    name={"ExifTool"}
                                    description={
                                        "ExifTool is a customizable set of Perl modules plus a full-featured command-line application called exiftool for reading and writing meta information in a wide variety of files."
                                    }
                                    url={"https://www.kali.org/tools/libimage-exiftool-perl/"}
                                />
                                <Reference
                                    name={"Eyewitness"}
                                    description={
                                        "EyeWitness is designed to take screenshots of websites, provide some server header info, and identify default credentials if possible."
                                    }
                                    url={"https://www.kali.org/tools/eyewitness/"}
                                />
                                <Reference
                                    name={"Fcrackzip"}
                                    description={"fcrackzip is a fast password cracker."}
                                    url={"https://www.kali.org/tools/fcrackzip/"}
                                />
                                <Reference
                                    name={"Ffuf"}
                                    description={
                                        "ffuf is a fast web fuzzer written in Go that allows typical directory discovery, virtual host discovery (without DNS records) and GET and POST parameter fuzzing."
                                    }
                                    url={"https://www.kali.org/tools/ffuf/"}
                                />
                                <Reference
                                    name={"Foremost"}
                                    description={
                                        "Foremost is a forensic program to recover lost files based on their headers, footers, and internal data structures."
                                    }
                                    url={"https://www.kali.org/tools/foremost/"}
                                />
                                <Reference
                                    name={"Fping"}
                                    description={
                                        "Fping is a ping like program which uses the Internet Control Message Protocol (ICMP) echo request to determine if a target host is responding."
                                    }
                                    url={"https://www.kali.org/tools/fping/"}
                                />
                                <Reference
                                    name={"FTPconnect"}
                                    description={
                                        "The standard ftp command-line client used to transfer files between systems over the File Transfer Protocol (FTP)."
                                    }
                                    url={"https://www.kali.org/tools/tnftp/"}
                                />
                                <Reference
                                    name={"Gitleaks"}
                                    description={
                                        "Gitleaks is a SAST tool for detecting and preventing hardcoded secrets like passwords, api keys, and tokens in git repos."
                                    }
                                    url={"https://www.kali.org/tools/gitleaks/"}
                                />
                                <Reference
                                    name={"GoBuster"}
                                    description={"GoBuster is a tool used to brute-force."}
                                    url={"https://www.kali.org/tools/gobuster/"}
                                />
                                <Reference
                                    name={"GoldenEye"}
                                    description={"GoldenEye is a HTTP DoS Test Tool."}
                                    url={"https://www.kali.org/tools/goldeneye/"}
                                />
                                <Reference
                                    name={"GyoiThon"}
                                    description={"GyoiThon is Intelligence Gathering tool for Web Server."}
                                    url={"https://www.kali.org/tools/goldeneye/"}
                                />
                                <Reference
                                    name={"Hashcat"}
                                    description={"Hashcat has cracking tools"}
                                    url={"https://hashcat.net/hashcat"}
                                />
                                <Reference
                                    name={"Hping3"}
                                    description={
                                        "hping3 is a network tool able to send custom ICMP/UDP/TCP packets and to display target replies like ping does with ICMP replies."
                                    }
                                    url={"https://www.kali.org/tools/hping3/"}
                                />
                                <Reference
                                    name={"Hydra"}
                                    description={
                                        "Hydra is a parallelised login cracker which supports numerous protocols to attack."
                                    }
                                    url={"https://www.kali.org/tools/hydra/"}
                                />
                                <Reference
                                    name={"JohnTheRipper"}
                                    description={"JohnTheRipper is a free and open source password cracking tool."}
                                    url={"https://www.openwall.com/john"}
                                />
                                <Reference
                                    name={"Masscan"}
                                    description={"MASSCAN is TCP port scanner."}
                                    url={"https://www.kali.org/tools/masscan/"}
                                />
                                <Reference
                                    name={"Metagoofil"}
                                    description={"Metagoofil is an information gathering tool."}
                                    url={"https://www.kali.org/tools/metagoofil/"}
                                />
                                <Reference
                                    name={"MSFvenom"}
                                    description={
                                        "MSFVenom is a command-line tool that is part of the Metasploit framework."
                                    }
                                    url={"https://www.offsec.com/metasploit-unleashed/msfvenom/"}
                                />
                                <Reference
                                    name={"NBTscan"}
                                    description={
                                        "NBTscan is a program for scanning IP networks for NetBIOS name information."
                                    }
                                    url={"https://www.kali.org/tools/nbtscan/"}
                                />
                                <Reference
                                    name={"Netcat"}
                                    description={
                                        "Netcat is a UNIX tool that reads and writes data across network connections using TCP and UDP protocols."
                                    }
                                    url={"https://www.kali.org/tools/netcat/"}
                                />
                                <Reference
                                    name={"Nikto"}
                                    description={"Nikto is a pluggable web server and CGI scanner."}
                                    url={"https://www.kali.org/tools/nikto/"}
                                />
                                <Reference
                                    name={"Nmap"}
                                    description={"Nmap a network scanning tool."}
                                    url={"https://www.nmap.org"}
                                />
                                <Reference
                                    name={"NSLookup"}
                                    description={"NSlookup  is  a program to query Internet domain name servers."}
                                    url={"https://www.kali.org/tools/bind9/#nslookup"}
                                />
                                <Reference
                                    name={"Parsero"}
                                    description={
                                        "Parsero is a tool used to scan and parse the robots.txt file of a website."
                                    }
                                    url={"https://www.kali.org/tools/parsero/"}
                                />
                                <Reference
                                    name={"Photon"}
                                    description={
                                        "This package includes a fast and flexible crawler designed for open source intelligence (OSINT)."
                                    }
                                    url={"https://www.kali.org/tools/photon/"}
                                />
                                <Reference
                                    name={"RainbowCrack"}
                                    description={"RainbowCrack is a tool used to crack hashes with rainbow tables."}
                                    url={"https://www.kali.org/tools/rainbowcrack/"}
                                />
                                <Reference
                                    name={"RTsort"}
                                    description={"RTSort is a tool within RainbowCrack, used to sort rainbow table."}
                                    url={"https://www.kali.org/tools/rainbowcrack/"}
                                />
                                <Reference
                                    name={"RTgen"}
                                    description={
                                        "RTgen is a tool within RainbowCrack, used to implement hash algorithms."
                                    }
                                    url={"https://www.kali.org/tools/rainbowcrack/"}
                                />
                                <Reference
                                    name={"SearchSploit"}
                                    description={
                                        "SearchSploit is a tool to search the Exploit Database for public exploits and vulnerabilities."
                                    }
                                    url={"https://www.kali.org/tools/exploitdb/#searchsploit"}
                                />
                                <Reference
                                    name={"Sherlock"}
                                    description={"Sherlock is used to search for usernames across social networks."}
                                    url={"https://www.kali.org/tools/sherlock/"}
                                />
                                <Reference
                                    name={"Shodan"}
                                    description={
                                        "Shodan is a repository of information about internet connected devices."
                                    }
                                    url={"https://www.shodan.io/"}
                                />
                                <Reference
                                    name={"SlowHttpTest"}
                                    description={
                                        "SlowHttpTest is a tool used to  simulate some application layer Denial of Service attacks by prolonging HTTP connections in different ways."
                                    }
                                    url={"https://www.kali.org/tools/slowhttptest/"}
                                />
                                <Reference
                                    name={"SMBEnumeration"}
                                    description={
                                        "SMBenumeration is a tool used for enumerating information from SMB (Server Message Block)."
                                    }
                                    url={"https://securiumsolutions.com/smb-enumeration-a-guide-step-by-step/"}
                                />
                                <Reference
                                    name={"SMBGhostScanner"}
                                    description={
                                        "SMB Ghost Scanner is a tool used for network scanning and vulnerability assessment."
                                    }
                                    url={"https://github.com/w1ld3r/SMBGhost_Scanner?tab=readme-ov-file"}
                                />
                                <Reference
                                    name={"Snmp-check"}
                                    description={"Snmp-check is a tool for enumerating on SNMP services."}
                                    url={"https://www.kali.org/tools/snmpcheck/"}
                                />
                                <Reference
                                    name={"SQLMap"}
                                    description={
                                        "sqlmap automates the process of detecting and exploiting SQL injection flaws."
                                    }
                                    url={"https://github.com/sqlmapproject/sqlmap"}
                                />
                                <Reference
                                    name={"Sqlninja"}
                                    description={"Sqlninja is an SQL injection tool."}
                                    url={"https://www.kali.org/tools/sqlninja/"}
                                />
                                <Reference
                                    name={"Subjack"}
                                    description={
                                        "Subjack is a tool to detect subdomain takeovers. It identifies vulnerable subdomains that could be hijacked."
                                    }
                                    url={"https://www.kali.org/tools/subjack/"}
                                />
                                <Reference
                                    name={"Sublist3r"}
                                    description={
                                        "Sublist3r is a tool designed to enumerate subdomains of websites using OSINT."
                                    }
                                    url={"https://www.kali.org/tools/sublist3r/"}
                                />
                                <Reference
                                    name={"Tcpdump"}
                                    description={
                                        "Tcpdump is a powerful commmand line packet analyser with a wide variety of configurations."
                                    }
                                    url={"https://www.tcpdump.org/"}
                                />
                                <Reference
                                    name={"TheHarvester"}
                                    description={
                                        "The Harvester is a tool for gathering emails, subdomains, IPs, and URLs from public sources for reconnaissance."
                                    }
                                    url={"https://www.kali.org/tools/theharvester/"}
                                />
                                <Reference
                                    name={"Testssl.sh"}
                                    description={
                                        "testssl.sh is a free command line tool which checks a server's service on any port for the support of TLS/SSL ciphers, protocols as well as cryptographic flaws."
                                    }
                                    url={"https://testssl.sh/"}
                                />
                                <Reference
                                    name={"Tiger"}
                                    description={
                                        "Toolset used to perform security audits of operating system components."
                                    }
                                    url={"https://www.kali.org/tools/tiger/"}
                                />
                                <Reference
                                    name={"Traceroute"}
                                    description={
                                        "The traceroute utility displays the route used by IP packets on their way to a specified network (or Internet) host."
                                    }
                                    url={"https://www.kali.org/tools/traceroute/"}
                                />
                                <Reference
                                    name={"Unicornscan"}
                                    description={
                                        "Unicornscan is a new information gathering and correlation engine built for and by members of the security research and testing communities."
                                    }
                                    url={"https://www.kali.org/tools/unicornscan/"}
                                />
                                <Reference
                                    name={"Urlsnarf"}
                                    description={
                                        "Urlsnarf is a tool within dsniff package, which contains tools for listening and creating network traffic"
                                    }
                                    url={"https://www.kali.org/tools/dsniff/"}
                                />
                                <Reference
                                    name={"WafW00f"}
                                    description={
                                        "WafW00f is a tool to identify and fingerprint Web Application Firewalls (WAFs)."
                                    }
                                    url={"https://www.kali.org/tools/wafw00f/"}
                                />
                                <Reference
                                    name={"WhatWeb"}
                                    description={"WhatWeb identifies websites."}
                                    url={"https://www.kali.org/tools/whatweb/"}
                                />
                                <Reference
                                    name={"Whois"}
                                    description={"Whois is a command-line tool used to query databases."}
                                    url={"https://www.kali.org/tools/whois/"}
                                />
                                <Reference
                                    name={"Wifite"}
                                    description={"Wifite is a tool to audit WEP or WPA encrypted wireless networks."}
                                    url={"https://www.kali.org/tools/wifite/"}
                                />
                                <Reference
                                    name={"WPScan"}
                                    description={
                                        "WPScan is an enumeration tool that scans remote WordPress installations in attempt to identify security issues."
                                    }
                                    url={"https://www.kali.org/tools/wpscan/"}
                                />
                            </Stack>
                        </Group>
                    </Accordion.Panel>
                </Accordion.Item>

                {/* Attack Vectors Category-- */}
                <Accordion.Item value="AttackVectors">
                    <Accordion.Control icon={<IconTarget size={16} color={getColor("red")} />}>
                        <Title order={4}>Attack Vectors</Title>
                    </Accordion.Control>
                    <Accordion.Panel>
                        <Group position="center" spacing="md">
                            <Stack align="center" spacing="md">
                                <Reference
                                    name={"CVE-2022-1388"}
                                    description={
                                        "CVE-2022-1388 allows undisclosed requests to bypass iControl REST authentication."
                                    }
                                    url={"https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2022-1388"}
                                />
                                <Reference
                                    name={"CVE-2021-41773"}
                                    description={"CVE-2021-41773 allows directory traversal attacks."}
                                    url={"cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-41773"}
                                />
                                <Reference
                                    name={"CVE-2021-44228"}
                                    description={"CVE-2021-44228 allows Remote Code Execution."}
                                    url={"cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44228"}
                                />
                                <Reference
                                    name={"CVE-2022-24112"}
                                    description={"Apache APISIX - Remote Code Execution."}
                                    url={"https://github.com/M4xSec/Apache-APISIX-CVE-2022-24112"}
                                />
                                <Reference
                                    name={"CVE-2022-27925"}
                                    description={"Zimbra Collaboration Suite - Remote Code Execution."}
                                    url={"https://github.com/M4xSec/Apache-APISIX-CVE-2022-24112"}
                                />
                                <Reference
                                    name={"CVE-2022-26134"}
                                    description={"CVE-2022-26134 allows Remote Code Execution."}
                                    url={"https://github.com/hev0x/CVE-2022-26134"}
                                />
                                <Reference
                                    name={"CVE-2022-27925"}
                                    description={"Zimbra Collaboration Suite - Remote Code Execution"}
                                    url={"https://arcticwolf.com/resources/blog/cve-2022-27925/"}
                                />
                                <Reference
                                    name={"CVE-2022-36804"}
                                    description={"CVE-2022-36804 allows privilege escalation."}
                                    url={"https://nvd.nist.gov/vuln/detail/CVE-2022-36804"}
                                />
                                <Reference
                                    name={"CVE-2023-22527"}
                                    description={"CVE-2023-22527 allows RCE in Atlassian Confluence."}
                                    url={"https://nvd.nist.gov/vuln/detail/CVE-2023-22527"}
                                />
                                <Reference
                                    name={"FindOffset"}
                                    description={
                                        "Find Offset identifies where a buffer overflow overwrites key memory addresses like EIP."
                                    }
                                    url={
                                        "https://book.hacktricks.xyz/binary-exploitation/rop-return-oriented-programing/ret2lib/ret2lib-+-printf-leak-arm64#find-offset"
                                    }
                                />
                                <Reference
                                    name={"Zerologon"}
                                    description={
                                        "ZeroLogon allow domain admin access by exploiting weak Netlogon cryptography."
                                    }
                                    url={
                                        "https://www.infosecinstitute.com/resources/vulnerabilities/zerologon-cve-2020-1472-technical-overview-and-walkthrough/"
                                    }
                                />
                            </Stack>
                        </Group>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </>
    );
};

export default ReferencesPage;
