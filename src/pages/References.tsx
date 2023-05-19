import { Group, Stack, Title } from "@mantine/core";
import { Reference } from "../components/Reference/Reference";

const ReferencesPage = () => {
    return (
        <>
            <Group position={"center"}>
                <div>
                    <p>
                        <Title>References</Title>
                    </p>
                </div>
            </Group>

            <Group position={"center"} align={"left"}>
                <Stack>
                    <Title order={4}>GUI Development:</Title>
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
                    <Title order={4}>Tools:</Title>
                    <Reference
                        name={"Nmap"}
                        description={"Nmap a network scanning tool."}
                        url={"https://www.nmap.org"}
                    />
                    <Reference
                        name={"Hashcat"}
                        description={"Hashcat has cracking tools"}
                        url={"https://hashcat.net/hashcat"}
                    />
                    <Reference
                        name={"JohnTheRipper"}
                        description={"JohnTheRipper is a free and open source password cracking tool."}
                        url={"https://www.openwall.com/john"}
                    />
                    <Reference
                        name={"Impacket"}
                        description={"Impacket is a collection of Python classes for working with network protocols."}
                        url={"https://github.com/SecureAuthCorp/impacket"}
                    />
                    <Reference
                        name={"Hydra"}
                        description={
                            "Hydra is a parallelised login cracker which supports numerous protocols to attack."
                        }
                        url={"https://www.kali.org/tools/hydra/"}
                    />
                    <Reference
                        name={"Urlsnarf"}
                        description={
                            "Urlsnarf is a tool within dsniff package, which contains tools for listening and creating network traffic"
                        }
                        url={"https://www.kali.org/tools/dsniff/"}
                    />
                    <Reference
                        name={"Snmp-check"}
                        description={"Snmp-check is a tool for enumerating on SNMP services."}
                        url={"https://www.kali.org/tools/snmpcheck/"}
                    />
                    <Reference
                        name={"Shodan"}
                        description={"Shodan is a repository of information about internet connected devices."}
                        url={"https://www.shodan.io/"}
                    />
                    <Reference
                        name={"Exploitdb"}
                        description={
                            "Exploitdb is used for the searchsploit tool. Contains information about exploits and vulnerabilities."
                        }
                        url={"https://github.com/offensive-security/exploitdb"}
                    />
                    <Reference
                        name={"Dirb"}
                        description={
                            "Dirb is a tool that can scan a website, enumerating directories and files that may be present."
                        }
                        url={"https://www.kali.org/tools/dirb/"}
                    />
                    <Reference
                        name={"Enum4Linux"}
                        description={"Enux4Linux is a tool for enumerating information from Windows and Samba systems."}
                        url={"https://www.kali.org/tools/enum4linux/"}
                    />
                    <Reference
                        name={"Dnsenum"}
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
                        name={"Cewl"}
                        description={"CeWL (Custom Word List generator) is a ruby app which spiders a given URL."}
                        url={"https://www.kali.org/tools/cewl/"}
                    />
                    <Reference
                        name={"Netcat"}
                        description={
                            "Netcat is a UNIX tool that reads and writes data across network connections using TCP and UDP protocols."
                        }
                        url={"https://www.kali.org/tools/netcat/"}
                    />
                    <Reference
                        name={"Sherlock"}
                        description={"Sherlock is used to search for usernames across social networks."}
                        url={"https://www.kali.org/tools/sherlock/"}
                    />
                    <Reference
                        name={"Traceroute"}
                        description={
                            "The traceroute utility displays the route used by IP packets on their way to a specified network (or Internet) host."
                        }
                        url={"https://www.kali.org/tools/traceroute/"}
                    />

                    <Title order={4}>Attack Vectors:</Title>
                    <Reference
                        name={"CVE-2022-24112"}
                        description={"Apache APISIX - Remote Code Execution."}
                        url={"https://apisix.apache.org/"}
                    />
                </Stack>
            </Group>
        </>
    );
};

export default ReferencesPage;
