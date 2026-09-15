# Supported Tools and Exploits

The Deakin Detonator Toolkit (DDT) provides graphical interfaces for a growing collection of penetration-testing tools and security testing demonstrations.

The lists below are generated automatically from the tools and attack vectors registered in the current DDT application. They should not be edited manually.

For information about the underlying security tools available with Kali Linux, see the [Kali Linux Tools](https://www.kali.org/tools/) catalogue.

## Have a suggestionfor a new tool, exploit or attack vector?

## Table of Contents

- [Tools](#-supported-tools)
- [Exploits and Attack Vectors](#-exploits-and-attack-vectors)

See [Suggesting a New Tool or Attack Vector](../CONTRIBUTING.md#suggesting-a-new-tool-or-attack-vector) for information about submitting a suggestion.

## 🧰 Supported Tools

<!-- GENERATED TOOLS START -->

**Current supported tools: 73**

| Tool              | Category                                         | Description                                                                                                                                                                              |
| ----------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Airbase NG        | Wireless Attacks and Rogue Access Point Creation | A network attack tool that can create a fake access point (AP) to capture and analyse traffic from devices that connect to it.                                                           |
| Aircrack NG       | Password Cracking and Authentication Testing     | A wireless network auditing tool designed for analysing packets captured from Wi-Fi networks, cracking WEP and WPA-PSK passwords, and identifying vulnerabilities in wireless networks.  |
| Amass             | Information Gathering and Analysis               | A tool for in-depth DNS enumeration and network mapping.                                                                                                                                 |
| Arjun             | Web Application Testing                          | A tool that helps find hidden GET and POST parameters for URL endpoints by analysing web traffic and identifying potential query parameters.                                             |
| ARP Fingerprint   | Network Scanning and Enumeration                 | A tool to analyse ARP (Address Resolution Protocol) traffic and identify the types of operating systems and network devices on a network.                                                |
| ARP Spoofing      | Attack Tools                                     | A tool used to poison the ARP cache by falsifying MAC address mappings between two targets, enabling interception or manipulation of network traffic.                                    |
| Arpaname          | Web Application Testing                          | A web application tool to perform reverse DNS lookups for IP addresses, mapping them back to associated domain names.                                                                    |
| Arping            | Network Scanning and Enumeration                 | A tool used to send ARP requests to a specified IP address to discover the MAC address.                                                                                                  |
| ArpScan           | Network Scanning and Enumeration                 | A tool that uses ARP requests to discover devices on a local network.                                                                                                                    |
| BED               | Information Gathering and Analysis               | A program designed to check network services (daemons) for potential vulnerabilities like buffer overflows and format string exploits.                                                   |
| Bully             | Network Scanning and Enumeration                 | A tool used for brute-forcing WPS PINs to gain unauthorised access to wireless networks.                                                                                                 |
| Cewl              | Password Cracking and Authentication Testing     | A tool that generates custom word lists by crawling and analysing web pages for useful words.                                                                                            |
| CloudBrute        | Cloud Security and Reconnaissance                | A tool used for discovering cloud-based infrastructure and services across various cloud providers through enumeration techniques.                                                       |
| Crunch            | Password Cracking and Authentication Testing     | A tool used to generate custom wordlists based on specified patterns, character sets, and lengths.                                                                                       |
| Dig               | Network Scanning and Enumeration                 | A command-line tool used for querying DNS servers to obtain domain name or IP address information.                                                                                       |
| dmitry            | Information Gathering and Analysis               | A tool for gathering information about a domain, including email addresses, subdomains, and IP addresses.                                                                                |
| DNSenum           | Information Gathering and Analysis               | A tool used to gather information about a domain's DNS, including subdomains, IP addresses, and DNS records.                                                                             |
| DNSMap            | Information Gathering and Analysis               | A tool that can visualise and analyse DNS records associated with a domain or IP address                                                                                                 |
| DNSRecon          | Information Gathering and Analysis               | A Python script that systematically searches for different hosts associated with a given domain, using DNS queries to discover subdomains, IP addresses, and other relevant DNS records. |
| Enum4Linux        | Network Scanning and Enumeration                 | A tool used to gather information from Windows machines using the SMB protocol, including user accounts and share details.                                                               |
| Exif              | Information Gathering and Analysis               | A tool used to extract metadata from different file types.                                                                                                                               |
| EyeWitness        | Web Application Testing                          | A tool used to capture screenshots and gather information such as banners, headers, and other details from web servers.                                                                  |
| Fcrackzip         | Password Cracking and Authentication Testing     | A tool for cracking the password of a protected ZIP file.                                                                                                                                |
| FFuf              | Web Application Testing                          | A web fuzzer used for discovering hidden files, directories and endpoints on web servers by brute-forcing URLs.                                                                          |
| Foremost          | File Analysis and Recovery                       | A tool used for file carving, which extracts specific types of files from disk images or data streams based on file headers and footers.                                                 |
| Fping             | Web Application Testing                          | A tool used to send Internet Control Message Protocol echo requests to determine if a target host is responding.                                                                         |
| FTPconnect        | Miscellaneous                                    | A tool used for connecting to and interacting with FTP servers.                                                                                                                          |
| Gitleaks          | Information Gathering and Analysis               | A tool used to detect sensitive information and secrets that may be exposed in Git repositories.                                                                                         |
| GoBuster          | Web Application Testing                          | A web directory brute-forcing tool used to discover hidden directories and files on web servers.                                                                                         |
| GoldenEye         | Attack Tools                                     | A tool used for performing denial-of-service (DoS) attacks by simulating HTTP requests to overwhelm a web server.                                                                        |
| Gyoithon          | Web Application Testing                          | An AI-powered penetration testing tool designed to automate the discovery and exploitation of vulnerabilities in HTTP/HTTPS-based web applications.                                      |
| Hashcat           | Password Cracking and Authentication Testing     | A password recovery tool that uses brute-force, dictionary, and other attack methods to crack hashed passwords.                                                                          |
| Hping3            | Network Scanning and Enumeration                 | A network packet crafting and analysis tool. It is used for testing firewalls, network performance, port scanning, and network auditing.                                                 |
| Hydra             | Password Cracking and Authentication Testing     | A tool used for brute-forcing login credentials across various protocols, such as HTTP, FTP, and SSH.                                                                                    |
| JohnTheRipper     | Password Cracking and Authentication Testing     | A password cracking tool that supports various algorithms and methods to crack hashed passwords.                                                                                         |
| Masscan           | Network Scanning and Enumeration                 | A quick and effective port scanning tool used for network reconnaissance.                                                                                                                |
| Metagoofil        | File Analysis and Recovery                       | A tool used for extracting metadata from documents found on web servers to gather information about potential targets.                                                                   |
| msfvenom          | Attack Tools                                     | A tool that can create payloads for various exploits and attack vectors, such as shellcode, Java applets, and executable files.                                                          |
| Nbtscan           | Network Scanning and Enumeration                 | A tool used for scanning and identifying NetBIOS names and associated IP addresses on a network.                                                                                         |
| Netcat            | Network Scanning and Enumeration                 | A tool that can create, read, and write network connections using TCP or UDP protocols.                                                                                                  |
| NetDiscover       | Network Scanning and Enumeration                 | A passive and active network discovery tool to find live hosts using ARP packets without sending traditional ICMP requests.                                                              |
| Nikto             | Web Application Testing                          | A web server scanner that detects vulnerabilities, misconfigurations, and potential security issues in web applications.                                                                 |
| Nmap              | Network Scanning and Enumeration                 | A network scanning tool used for discovering hosts, services, and vulnerabilities on a network.                                                                                          |
| NSLookup          | Network Scanning and Enumeration                 | A command-line tool used for querying DNS to obtain domain name or IP address information.                                                                                               |
| Nuclei            | Vulnerability Assessment and Exploitation        | A vulnerability scanner that automates security checks using template-based scanning to detect vulnerabilities and misconfigurations across network services and web applications.       |
| Parsero           | Web Application Testing                          | A Python script that reads a web server's robots.txt file to view and analyse Disallow entries.                                                                                          |
| Photon            | Information Gathering and Analysis               | A fast and flexible crawler designed for open source intelligence.                                                                                                                       |
| Rainbowcrack      | Password Cracking and Authentication Testing     | A tool that uses rainbow tables to crack password hashes.                                                                                                                                |
| Rtgen             | Password Cracking and Authentication Testing     | A tool that generates rainbow tables to be used in password cracking.                                                                                                                    |
| Rtsort            | Password Cracking and Authentication Testing     | A subfunction of the Rainbow Crack tool used for sorting and managing created rainbow tables.                                                                                            |
| SearchSploit      | Vulnerability Assessment and Exploitation        | A utility that allows users to search through a vast database of exploits, shellcodes, and security-related papers.                                                                      |
| Sherlock          | Information Gathering and Analysis               | A tool used to find and enumerate user accounts across various social media platforms.                                                                                                   |
| Shodan API tool   | Vulnerability Assessment and Exploitation        | A tool used for network scanning and querying of Shodan's database to gather information about connected devices and their vulnerabilities.                                              |
| SlowHttpTest      | Web Application Testing                          | A tool for simulating slow HTTP attacks to test web server resilience.                                                                                                                   |
| SMB Enumeration   | Network Scanning and Enumeration                 | A tool used to gather information about network shares, users, and other details from Windows machines using the SMB protocol.                                                           |
| SMB-Ghost Scanner | Vulnerability Assessment and Exploitation        | A tool used to detect whether a target is vulnerable to the CVE-2020-0796 vulnerability in SMBv3.                                                                                        |
| SnmpCheck         | Network Scanning and Enumeration                 | A tool used to identify and assess vulnerabilities in devices that use the SNMP protocol by querying SNMP information.                                                                   |
| SQLmap            | Web Application Testing                          | A tool for detecting and exploiting SQL injection flaws and taking control of database servers.                                                                                          |
| Sqlninja          | Vulnerability Assessment and Exploitation        | A tool used to exploit SQL injection vulnerabilities on web applications that use Microsoft SQL Server as back end.                                                                      |
| Subjack           | Web Application Testing                          | Subdomain takeover detection tool.                                                                                                                                                       |
| Sublist3r         | Web Application Testing                          | A tool that can efficiently discover subdomains associated with a given domain using various techniques, such as DNS queries, Google search, and passive DNS records.                    |
| Tcpdump           | Network Scanning and Enumeration                 | A tool used for packet capture and filtering across a network.                                                                                                                           |
| Testssl           | Network Scanning and Enumeration                 | A versatile command-line tool designed to check a server's SSL/TLS configuration and identify potential vulnerabilities.                                                                 |
| The Harvester     | Information Gathering and Analysis               | A tool used for gathering information from various public sources, such as search engines and social media, to find email addresses and domain details.                                  |
| Tiger             | Vulnerability Assessment and Exploitation        | An audit and intrusion detection tool used to protect UNIX based systems.                                                                                                                |
| Traceroute        | Network Scanning and Enumeration                 | A network diagnostic tool that tracks the path packets take as they travel from a source to a destination.                                                                               |
| Unicornscan       | Network Scanning and Enumeration                 | A tool used for scanning servers and hosts to identify open ports and services being utilised for network communications.                                                                |
| Urlsnarf          | Network Scanning and Enumeration                 | A tool used for capturing and logging HTTP requests and URLs transmitted over a network.                                                                                                 |
| Wafw00f           | Web Application Testing                          | A tool for detecting and fingerprinting web application firewalls (WAFs).                                                                                                                |
| WhatWeb           | Web Application Testing                          | A tool for identifying and analysing the web technologies used by websites, including web servers and frameworks.                                                                        |
| Whois             | Web Application Testing                          | A tool used to query and retrieve information about domain registrations, including registrants and contact details.                                                                     |
| Wifite2           | Network Scanning and Enumeration                 | A tool for attacking WEP, WPA, WPA2, and WPS-secured Wi-Fi networks using customizable options and a user-friendly interface.                                                            |
| WPScan            | Web Application Testing                          | A tool used to scan WordPress websites for vulnerabilities, security issues, and exposed sensitive information.                                                                          |

<!-- GENERATED TOOLS END -->

## 💥 Exploits and Attack Vectors

[Top](#table-of-contents)

<!-- GENERATED ATTACK VECTORS START -->

**Current attack vectors: 14**

| Attack Vector  | Description                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| CVE-2021-41773 | Apache 2.4.49 and 2.4.50 RCE                                                                                                       |
| CVE-2021-44228 | Vulnerability in the Apache Log4j 2 Java library allowing RCE                                                                      |
| CVE-2022-1388  | Undisclosed requests may bypass iControl REST authentication.                                                                      |
| CVE-2022-22954 | VMware Workspace ONE Access and Identity Manager Server-Side Template Injection Vulnerability                                      |
| CVE-2022-22963 | Spring Cloud Function SpEL injection RCE exploit.                                                                                  |
| CVE-2022-24112 | Apache APISIX Remote Code Execution Vulnerability                                                                                  |
| CVE-2022-26134 | Confluence Pre-Auth Remote Code Execution via OGNL Injection                                                                       |
| CVE-2022-27925 | Zimbra Collaboration (aka ZCS) 8.8.15 and 9.0 has mboximport functionality that receives a ZIP archive and extracts files from it. |
| CVE-2022-36804 | Pre-Auth RCE in Atlassian Bitbucket Server Vulnerability                                                                           |
| CVE-2023-22515 | Auth bypass to allow admin account creation in Atlassian Confluence                                                                |
| CVE-2023-22527 | Unauthenticated RCE in Atlassian Confluence via OGNL injection                                                                     |
| CVE-2023-23397 | NTLM hash leak via malicious Outlook reminder exploiting extended MAPI property                                                    |
| Find offset    | Find the offset to the instruction pointer in a buffer overflow vulnerable binary.                                                 |
| ZeroLogon      | Zero Logon will let the pentester to perform an authentication attempts on windows server                                          |

<!-- GENERATED ATTACK VECTORS END -->

[Back](../README.md)
