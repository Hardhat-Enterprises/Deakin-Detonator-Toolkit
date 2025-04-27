import { Image, Text, Stack, Title, Accordion, Switch, Collapse, TypographyStylesProvider, Button, Grid, Card, CardSection, useMantineTheme } from "@mantine/core";
import { IconRobot, IconRobotOff } from "@tabler/icons";
import { useState } from "react";
import AskChatGPT from "../../components/AskChatGPT/AskChatGPT";


const BeginnerHomePage = () => {
    const [chatGPTToggle, setChatGPTToggle] = useState(false); // ChatGPT toggle, default false
    const [chatGPTResponse, setChatGPTResponse] = useState(""); // ChatGPT response
    const [chatGPTResponseTools, setChatGPTResponseTools] = useState(""); // ChatGPT response
    const [chatGPTShowResponse, setChatGPTShowResponse] = useState(true); // chatGPT show response, default true 

    const title = "BeginnerHomePage";
    const response = "<pre>" + chatGPTResponse + "</pre>";
    const responseTools = "<pre>" + chatGPTResponseTools + "</pre>";
    const whyQuestion = "Why would we use penetration testing? Can you give me some examples?";
    const toolsQuestion = "What are the most common Kali Linux penetration testing tools? How many pen testing tools exist?";
    //const recentQuestion = "Can you give me some recent examples of cybersecurity failures?";

    return (
        <>
            <Stack align={"center"}>
                <Title>Beginner Section</Title>
                <Text>Learn the how's and the why's.</Text>
                <Text></Text>
                <Switch
                    label="Toggle ChatGPT functionality"
                    checked={chatGPTToggle}
                    onChange={(value) => setChatGPTToggle(value.currentTarget.checked)}
                    size="md"
                    thumbIcon={chatGPTToggle ? (<IconRobot size={12} color={"blue"} />) : (<IconRobotOff size={12} />)} // checkbox 
                />
                <div></div>
            </Stack>
            <Accordion variant="contained">
                <Accordion.Item value="Why">
                    <Accordion.Control>Why penetration testing?</Accordion.Control>
                    <Accordion.Panel>
                        <Text align={"left"}>Penetration testing, or ethical hacking, is used to:</Text><br></br>
                        <li>Identify security issues within the system environment.</li>
                        <li>Simulate real-world cybersecurity attacks.</li>
                        <li>Evaluate potential cybersecurity risks.</li>
                        <li>Expose vulnerabilities of system.</li>
                        <li>Test compliance with regulations.</li>
                        <li>Test or demonstrate quality assurance requirements.</li>
                        <li>Ensure authorisation requirements and system data protection.</li>
                        <br></br>
                        <Collapse in={chatGPTToggle}>
                            <AskChatGPT toolName={title} output={whyQuestion} setChatGPTResponse={setChatGPTResponse} />
                            <br></br><br></br>
                            <Switch
                                label={"Show response: " + whyQuestion}
                                checked={chatGPTShowResponse}
                                onChange={(value) => setChatGPTShowResponse(value.currentTarget.checked)}
                                size="md"
                            />
                            <Collapse in={chatGPTShowResponse}>
                                <TypographyStylesProvider sx={{ '& pre': { whiteSpace: "pre-wrap", maxWidth: window.innerWidth - 10 } }}>
                                    <div dangerouslySetInnerHTML={{ __html: response }} /></TypographyStylesProvider>
                            </Collapse>
                        </Collapse>
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="Ethics">
                    <Accordion.Control>Ethical Considerations</Accordion.Control>
                    <Accordion.Panel>
                        <Text align={"left"}>Ethical considerations here.. short and sweet as user agreement already done. OR move to sticky bottom notice</Text>
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="Pen testing environment">
                    <Accordion.Control>Pen testing environment</Accordion.Control>
                    <Accordion.Panel>
                        <Text align={"left"}>Brief discussion on pen testing environment + common setup</Text>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>

            <div>
                <h2>Common Tools</h2>
                <div>
                    <Text align={"left"}>Network scanning tools - short description, and what do they do?</Text>
                    <br></br>
                    <Text align="left">Most common examples:</Text>
                    <li>Nmap: short description </li>
                    <li>Another tool</li>
                    <Button size="sm" color="green">Show me</Button>
                </div>
                <br></br>
                <div>
                    <Text align={"left"}>Vulnerability scanning tools - short description, and what do they do?</Text>
                    <br></br>
                    <li>Nmap: short description </li>
                    <li>Another tool</li>
                    <Button size="sm" color="pink" disabled>Show me</Button>
                </div>

            </div>
            <br></br>
            <Collapse in={chatGPTToggle}>
                <AskChatGPT toolName={title} output={toolsQuestion} setChatGPTResponse={setChatGPTResponseTools} />
                <br></br><br></br>
                <Switch
                    label={"Show response: " + toolsQuestion}
                    checked={chatGPTShowResponse}
                    onChange={(value) => setChatGPTShowResponse(value.currentTarget.checked)}
                    size="md"
                />
                <Collapse in={chatGPTShowResponse}>
                    <TypographyStylesProvider  sx={{ '& pre': { whiteSpace: "pre-wrap", maxWidth: window.innerWidth - 10 } }}>
                        <div dangerouslySetInnerHTML={{ __html: responseTools }} /></TypographyStylesProvider>
                </Collapse>
            </Collapse>
        </>
    );
};

export default BeginnerHomePage;
