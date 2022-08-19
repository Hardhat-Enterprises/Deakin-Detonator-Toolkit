import { Button, Group, Popover, Stack, Text, Title } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons";
import { useState } from "react";
import { ActionIcon } from "@mantine/core";

const ReferencesPage = () => {
    const [opened, setOpened] = useState(false);

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
                    <Group>
                        <ActionIcon
                            size="lg"
                            color="green"
                            variant="filled"
                            component="a"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://www.reactjs.org"
                        >
                            <IconExternalLink size={18} />
                        </ActionIcon>
                        <Popover width={418} position="bottom" withArrow shadow="md">
                            <Popover.Target>
                                <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>
                                    ReactJS
                                </Button>
                            </Popover.Target>
                            <Popover.Dropdown>
                                <Text size="sm">
                                    <p>Deakin Detonator Toolkit is built using ReactJS.</p>
                                    <p>URL: https://www.reactjs.org</p>
                                </Text>
                            </Popover.Dropdown>
                        </Popover>
                    </Group>

                    <Title order={4}>Tools:</Title>
                    <Group>
                        <ActionIcon
                            size="lg"
                            color="green"
                            variant="filled"
                            component="a"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://www.nmap.org"
                        >
                            <IconExternalLink size={18} />
                        </ActionIcon>
                        <Popover width={418} position="bottom" withArrow shadow="md">
                            <Popover.Target>
                                <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>
                                    Nmap
                                </Button>
                            </Popover.Target>
                            <Popover.Dropdown>
                                <Text size="sm">
                                    <p>Nmap a network scaning tool.</p>
                                    <p>URL: https://www.nmap.org</p>
                                </Text>
                            </Popover.Dropdown>
                        </Popover>
                    </Group>

                    <Group>
                        <ActionIcon
                            size="lg"
                            color="green"
                            variant="filled"
                            component="a"
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://www.openwall.com/john/"
                        >
                            <IconExternalLink size={18} />
                        </ActionIcon>
                        <Popover width={418} position="bottom" withArrow shadow="md">
                            <Popover.Target>
                                <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>
                                    JohnTheRipper
                                </Button>
                            </Popover.Target>
                            <Popover.Dropdown>
                                <Text size="sm">
                                    <p>JohnTheRipper is a free and open source password cracker.</p>
                                    <p>URL: https://www.openwall.com/john/</p>
                                </Text>
                            </Popover.Dropdown>
                        </Popover>
                    </Group>

                    {/* Below is code mirgrated from old phyton/thinker app. Please uncomment and update these as attack vectors are implimented into DDT */}

                    {/* <Title order={4}>Attack Vector One:</Title>
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://github.com/DanMcInerney/pymetasploit3"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Communication with the MSFRPC framework</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>The repository where 'pymetasploit3.msfrpc' module is imported from. Used as a guide for communication with the MSFRPC framework.</p>
                            <p>URL: https://github.com/DanMcInerney/pymetasploit3</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://stackoverflow.com/questions/26688936/how-to-get-pid-by-process-name"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Defining the 'kill_PID()' function</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>Used to help define the 'kill_PID()' function.</p>
                            <p>URL: https://stackoverflow.com/questions/26688936/how-to-get-pid-by-process-name</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://infosecaddicts.com/python-and-metasploit/"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Defining the 'find_session()' function</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>Used to help define the 'find_session()' function.</p>
                            <p>URL: https://infosecaddicts.com/python-and-metasploit/</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://stackoverflow.com/questions/166506/finding-local-ip-addresses-using-pythons-stdlib"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Defining the 'set_IP()' function</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>Used to help define the 'set_IP()' function.</p>
                            <p>URL: https://stackoverflow.com/questions/166506/finding-local-ip-addresses-using-pythons-stdlib</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                    <Title order={4}>Attack Vector Two:</Title>
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://github.com/webpwnized/mutillidae"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Mutillidae installation</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>Mutillidae is a deliberately broken web application which was installed as a guide through the creation and testing of Attack Vector Two's tool. This was necessary since the blue teams network was not operational.</p>
                            <p>URL: https://github.com/webpwnized/mutillidae</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://portswigger.net/web-security/file-path-traversal"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Understanding directory traversal attacks</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>An easy to read site regarding directory traversal attacks. Ideal for beginner/intermediate ethical hackers to help understand key directory traversal concepts. This site supported the creation of a tool to compromise a certain vulnerability.</p>
                            <p>URL: https://portswigger.net/web-security/file-path-traversal</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://portswigger.net/web-security/access-control/idor"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Understanding IDOR attacks</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>This site focuses on IDOR (Insecure Direct Object Reference) attacks. This site is easy to read for novice hackers and assisted in understanding key concept, so that a tool could be created to exploit a vulnerability.</p>
                            <p>URL: https://portswigger.net/web-security/access-control/idor</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                    <Title order={4}>Attack Vector Three:</Title>
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://infosec.smashedpixels.pro/metasploit-automatization-using-python/"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Finding a session and reading a console functions</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>Used this site to help find session functions and read console functions.</p>
                            <p>URL: https://infosec.smashedpixels.pro/metasploit-automatization-using-python/</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://stackoverflow.com/questions/26688936/how-to-get-pid-by-process-name"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Defining the 'close_msfrpc()' function</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>Used this site to help define the 'close_msfrpc()' function.</p>
                            <p>URL: https://stackoverflow.com/questions/26688936/how-to-get-pid-by-process-name</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://www.coalfire.com/the-coalfire-blog/may-2019/pymetasploit3-metasploit-automation-library"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Creating an exploit using pymetasploit3</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>Used this site as a guide to using pymetasploit3 to create an exploit.</p>
                            <p>URL: https://www.coalfire.com/the-coalfire-blog/may-2019/pymetasploit3-metasploit-automation-library</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://github.com/DanMcInerney/pymetasploit3"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Communication with the MSFRPC framework</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>The repository where 'pymetasploit3.msfrpc' module is imported from. Used as a guide for communication with the MSFRPC framework.</p>
                            <p>URL: https://github.com/DanMcInerney/pymetasploit3</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                    <Title order={4}>FTP Brute Force Tool:</Title>
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://allabouttesting.org/install-ftp-server-on-kali-linux/"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Installing a FTP server on Kali virtual machine</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>This site guided through the installation process of a FTP server on a Kali virtual machine for testing purposes.</p>
                            <p>URL: https://allabouttesting.org/install-ftp-server-on-kali-linux/</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://pythontic.com/ftplib/ftp/login"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Understanding how to login to FTP</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>This site helped in understanding how to login to FTP, including coding of parameters to pass through the login function.</p>
                            <p>URL: https://pythontic.com/ftplib/ftp/login</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                    <Title order={4}>HTTP Header Analyzer Tool:</Title>
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/watch?v=Oz902cJcCUg&ab_channel=JohnWatsonRooney"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Understanding HTTP headers</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>This site assisted in understanding how HTTP headers worked and what components of these headers were important.</p>
                            <p>URL: https://www.youtube.com/watch?v=Oz902cJcCUg&ab_channel=JohnWatsonRooney</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="http://www.learningaboutelectronics.com/Articles/How-to-retrieve-the-HTTP-headers-of-a-web-page-Python-http-client.php"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Coding functions and connecting a URL</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>This site helped with understanding how to code the functionalities behind the tool and how to connect to a URL.</p>
                            <p>URL: http://www.learningaboutelectronics.com/Articles/How-to-retrieve-the-HTTP-headers-of-a-web-page-Python-http-client.php</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                    <Title order={4}>Buffer Overflow:</Title>
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://princerohit8800.medium.com/buffer-overflow-exploiting-slmail-email-server-f90b27459911"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Creating overflow walkthrough</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>Source used to create overflow walkthrough.</p>
                            <p>URL: https://princerohit8800.medium.com/buffer-overflow-exploiting-slmail-email-server-f90b27459911</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                    <Title order={4}>Wordlist Generator:</Title>
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://github.com/Mebus/cupp"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Creating the Wordlist generator</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>Source used to create Wordlist generator.</p>
                            <p>URL: https://github.com/Mebus/cupp</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                    <Title order={4}>Video Player:</Title>
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://www.geeksforgeeks.org/pyglet-media-player/"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Creating a video player function</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>Source used to create video player function.</p>
                            <p>URL: https://www.geeksforgeeks.org/pyglet-media-player/</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                    <Title order={4}>Authentication Bypass:</Title>
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/watch?v=pRcenfXjf9A"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Conducting privilege escalation</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>Source used to conduct a privilege escalation to demonstrate an Authentication Bypass attack.</p>
                            <p>URL: https://www.youtube.com/watch?v=pRcenfXjf9A</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group>
                
                    <Title order={4}>TCP SYN Flooder:</Title>
                <Group>
                    <ActionIcon size="lg" color="green" variant="filled" component="a" target="_blank" rel="noopener noreferrer" href="https://github.com/Malam-X/TCP-Flood/blob/main/flood.py"><IconExternalLink size={18}/></ActionIcon>
                    <Popover width={418} position="bottom" withArrow shadow="md">
                        <Popover.Target>
                            <Button style={{ width: 418 }} onClick={() => setOpened((o) => !o)}>Creating the attack</Button>
                        </Popover.Target>
                        <Popover.Dropdown>
                            <Text size="sm">
                            <p>Source used to create TCP SYN Flooder attack.</p>
                            <p>URL: https://github.com/Malam-X/TCP-Flood/blob/main/flood.py</p>
                            </Text>
                        </Popover.Dropdown>
                    </Popover>
                </Group> */}
                </Stack>
            </Group>
        </>
    );
};

export default ReferencesPage;
