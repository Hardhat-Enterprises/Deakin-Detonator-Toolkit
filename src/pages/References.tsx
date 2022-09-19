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
                    <Title order={4}>Attack Vectors:</Title>
                    <Reference
                        name={"CVE-2017-0144 - Eternal Blue"}
                        description={"Windows SMB Remote Code Execution Vulnerability"}
                        url={"https://cve.mitre.org/cgi-bin/cvename.cgi?name=cve-2017-0144"}
                    />
                </Stack>
            </Group>
        </>
    );
};

export default ReferencesPage;
