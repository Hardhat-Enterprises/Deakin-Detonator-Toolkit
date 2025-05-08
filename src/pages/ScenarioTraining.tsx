// ScenarioTraining.tsx

import { useState, useRef } from "react";
import {
    Accordion,
    Button,
    Stack,
    Title,
    Text,
    Textarea,
    NativeSelect,
    MultiSelect,
    LoadingOverlay,
    Paper,
    Group,
    Notification,
    Space,
    Center,
} from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons";
import { getAttackVectors, getTools } from "../components/RouteWrapper";
import { writeTextFile } from "@tauri-apps/api/fs";
import { save } from "@tauri-apps/api/dialog";
import { RenderComponent } from "../components/UserGuide/UserGuide";

// Title and description for the User Guide tab
const title = "AI Scenario Training";
const description =
    "AI Scenario Training helps users learn how to think like a red teamer. It uses GPT-4 to generate full penetration testing scenarios based on a chosen CVE or technique, the difficulty level, and tools available in the GUI. If a tool is missing from PT-GUI, it clearly tells the user to run it through the command line instead.\n\nThe goal is to guide users through a realistic attack plan with context, objectives, tools, hints, and remediation. It doesn't create a live lab but it helps users understand the flow of a red team assessment in a structured and educational way.";

// Setup instructions for API key
const steps =
    "Step 1: Go to https://platform.openai.com and log in or sign up.\n" +
    "Step 2: Click on your profile > Settings > API Keys > Create new secret key.\n" +
    "Step 3: Copy your new API key.\n" +
    "Step 4: In the root directory of PT-GUI, create a file named .env.\n" +
    "Step 5: Paste the key into the file like this:\n" +
    'VITE_OPENAI_API_KEY="your-secret-key"\n' +
    "Step 6: Save the file. Restart the toolkit if it was already running.\n" +
    "Step 7: Open the AI Scenario Training page, choose your attack vector, tools, and difficulty, then click Generate Scenario.\n" +
    "Step 8: Review the scenario, expand the hints, and fill in your report. You can save your full write-up as a .txt file.";

const tutorial = "https://docs.google.com/document/d/1jh0OMh8S9XdyKnwbcyllkvhe6v_nRD3z4sCBtxJMOk8/edit?usp=sharing";

const ScenarioTraining = () => {
    // UI state hooks
    const [difficulty, setDifficulty] = useState("Easy");
    const [vector, setVector] = useState("");
    const [tools, setTools] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [scenarioSections, setScenarioSections] = useState<Record<string, string>>({});
    const [userReport, setUserReport] = useState("");
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Fetching all available tools and attack vectors
    const availableTools = getTools().map((t) => t.name);
    const availableToolsLower = availableTools.map((t) => t.toLowerCase());
    const attackVectorOptions = getAttackVectors().map((v) => ({
        value: v.name,
        label: v.name,
    }));
    const toolOptions = availableTools.map((t) => ({
        value: t,
        label: t,
    }));

    // Helper function to parse GPT-4's response into structured scenario sections
    const formatScenarioOutput = (text: string): Record<string, string> => {
        const sections = [
            "Scenario Context",
            "Objective",
            "Attack Vector",
            "Recommended PT-GUI Tools",
            "Step-by-step Hints",
            "Expected Outcome",
            "Remediation Suggestions",
        ];
        const result: Record<string, string> = {};
        for (let i = 0; i < sections.length; i++) {
            const start = new RegExp(`${i + 1}\\.\\s*${sections[i]}:`, "i");
            const end = new RegExp(`\\n${i + 2}\\.\\s*${sections[i + 1]}:`, "i");
            const startIndex = text.search(start);
            const endIndex = text.search(end);
            if (startIndex !== -1) {
                const key = sections[i];
                let value =
                    endIndex !== -1
                        ? text.slice(startIndex, endIndex).replace(start, "").trim()
                        : text.slice(startIndex).replace(start, "").trim();

                if (key === "Remediation Suggestions") {
                    value = value
                        .split(/\n|\r/)
                        .filter((line) => line.trim())
                        .map((line) => `• ${line.trim().replace(/^[-*•]\s*/, "")}`)
                        .join("\n");
                }

                result[key] = value;
            }
        }
        return result;
    };

    // Core function to trigger GPT-4 scenario generation
    const handleGenerate = async () => {
        setLoading(true);
        abortRef.current = new AbortController();

        const toolListForGPT = availableTools.join(", ");

        const prompt = `
You are a senior penetration testing instructor creating a training scenario.

Here is the full list of tools available in PT-GUI: ${toolListForGPT}

Only tools in this list should be labeled as "Available in PT-GUI". All others must be labeled "Not available in PT-GUI, use via CLI".

Scenario Specification:
- Difficulty: ${difficulty}
- Attack Vector: ${vector}


If the selected tools are not sufficient to complete the attack, you must suggest additional tools. Validate all extra tools against the PT-GUI tool list provided.

You are required to include all selected tools in the Recommended PT-GUI Tools section, regardless of relevance to the CVE. You must still write an entry for each selected tool, even if it is not suitable. Clearly label it as not relevant and explain why briefly. Do not omit any selected tools.

Generate a realistic penetration test scenario with the following structure:

1. Scenario Context : Describe a realistic fictional company (give it a name), list key departments (e.g., HR, IT, R&D), their infrastructure setup (on-premises, cloud, hybrid; Windows/Linux; web apps, services), and explain the reason for the assessment (e.g., compliance audit, recent breach, product launch).

2. Objective : Clearly describe the specific goal of the penetration test. What exactly is the tester trying to exploit or gain access to, and why is this goal technically and business-critical?

3. Attack Vector : Provide a detailed technical explanation of the CVE or attack technique:
   - Explain how the vulnerability works step-by-step
   - Where this vulnerability commonly exists
   - Why it is exploitable in this scenario

4. Recommended PT-GUI Tools:
   - Mention the category of the tool (e.g., Information Gathering, Exploitation, Post-Exploitation)
   - If the tool is in PT-GUI, write: "[ToolName] is available in PT-GUI."
   - If the tool is not in PT-GUI, write: "[ToolName] is NOT available in the toolkit. Use it manually via CLI."
   - Explain how to use the tool in this scenario, including:
     - What parameters to set
     - What to look for in the output
     - How it helps in this specific attack context (validate availability strictly using the list above)

5. Step-by-step Hints : Tailor the detail level based on difficulty:
   - Easy: Write fully detailed, beginner-friendly numbered steps. Include example commands, GUI instructions, and expected outputs. Explain why each step matters.
   - Medium: Provide high-level technical steps with less explanation. Assume some prior knowledge.
   - Hard: Only offer minimal guidance or key checkpoints. Expect the user to infer the rest.

6. Expected Outcome : Describe what a successful exploitation or analysis will result in. This could include things like session hijack, database leak, admin access, file download, or visible web application behavior change.

7. Remediation Suggestions : Offer specific, real-world security mitigation steps. This may include:
   - Input validation techniques
   - Patching instructions
   - Secure coding practices
   - Security headers (CSP, X-Content-Type-Options, etc.)
   - Logging and monitoring suggestions

Avoid generic or vague suggestions. Each sentence should provide clear, actionable insight for someone training in penetration testing. Do not include unnecessary filler or repeated phrases.
`.trim();

        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                signal: abortRef.current.signal,
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.85,
                }),
            });

            const data = await response.json();
            const output = data.choices?.[0]?.message?.content || "No scenario generated.";
            const parsedSections = formatScenarioOutput(output);
            setScenarioSections(parsedSections);
        } catch (err: any) {
            if (err.name === "AbortError") {
                setScenarioSections({ "Scenario Context": "Request was cancelled by the user." });
            } else {
                setScenarioSections({
                    "Scenario Context": "Error generating scenario. Check your API key or internet connection.",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Abort the current API request
    const cancelRequest = () => {
        if (abortRef.current) abortRef.current.abort();
    };

    // Save full scenario and user notes as a .txt file
    const handleSaveReport = async () => {
        try {
            const fileName = `PTGUI_Scenario_Report_${Date.now()}.txt`;
            const fullText =
                Object.entries(scenarioSections)
                    .map(([title, content]) => `=== ${title} ===\n${content}`)
                    .join("\n\n") +
                "\n\n=== User Notes ===\n" +
                userReport;

            const selectedPath = await save({
                defaultPath: fileName,
                filters: [{ name: "Text File", extensions: ["txt"] }],
            });

            if (selectedPath) {
                await writeTextFile(selectedPath as string, fullText);
                setSaveStatus(`Saved successfully as \"${selectedPath}\"`);
            } else {
                setSaveStatus("Save cancelled by user.");
            }
        } catch (err) {
            console.error("Save error:", err);
            setSaveStatus("Failed to save the report.");
        }
    };

    // UI rendering logic
    return (
        <RenderComponent title={title} description={description} steps={steps} tutorial={tutorial}>
            <Stack p="md" spacing="lg">
                <NativeSelect
                    label="Select Difficulty"
                    data={["Easy", "Medium", "Hard"]}
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.currentTarget.value)}
                />
                <NativeSelect
                    label="Select Attack Vector"
                    data={attackVectorOptions}
                    value={vector}
                    onChange={(e) => setVector(e.currentTarget.value)}
                />
                <MultiSelect
                    label="Optional: Select Tools"
                    data={toolOptions}
                    value={tools}
                    onChange={setTools}
                    searchable
                    clearable
                />

                <Center>
                    <Group spacing="md">
                        <Button onClick={handleGenerate} loading={loading}>
                            Generate Scenario
                        </Button>
                        {loading && (
                            <Button color="red" variant="outline" onClick={cancelRequest}>
                                Cancel
                            </Button>
                        )}
                    </Group>
                </Center>

                {Object.keys(scenarioSections).length > 0 && (
                    <>
                        <Paper shadow="sm" p="md" withBorder mt="md">
                            <Title order={4}>Scenario Details</Title>
                            <Text size="xs" color="dimmed" italic>
                                Disclaimer: This scenario is generated using GPT-4 and is intended for educational and
                                simulation purposes only. Please verify any steps before applying them in real
                                environments.
                            </Text>

                            <Stack spacing="sm" mt="md">
                                {Object.entries(scenarioSections).map(([heading, content]) => {
                                    if (heading === "Step-by-step Hints") return null;
                                    return (
                                        <div key={heading}>
                                            <Text weight={700} size="sm">
                                                {heading}
                                            </Text>
                                            <Text size="sm" style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                                                {content}
                                            </Text>
                                        </div>
                                    );
                                })}
                            </Stack>

                            {scenarioSections["Step-by-step Hints"] && (
                                <Accordion mt="lg">
                                    <Accordion.Item value="hints">
                                        <Accordion.Control>Click to view Step-by-step Hints</Accordion.Control>
                                        <Accordion.Panel>
                                            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                                                {scenarioSections["Step-by-step Hints"]}
                                            </Text>
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                </Accordion>
                            )}
                        </Paper>

                        <Textarea
                            label="Write Your Report"
                            description="Add custom findings, output logs, or conclusions."
                            value={userReport}
                            onChange={(event) => setUserReport(event.currentTarget.value)}
                            autosize
                            minRows={5}
                            placeholder="e.g. Tool output, access gained, patching strategy..."
                        />

                        <Group position="right">
                            <Button
                                leftIcon={<IconDeviceFloppy size={18} />}
                                variant="outline"
                                onClick={handleSaveReport}
                            >
                                Save Report (.txt)
                            </Button>
                        </Group>

                        {saveStatus && (
                            <Notification
                                title="Save Report"
                                color={saveStatus.includes("successfully") ? "green" : "red"}
                            >
                                {saveStatus}
                            </Notification>
                        )}
                    </>
                )}

                <Space h="xl" />
            </Stack>
        </RenderComponent>
    );
};

export { ScenarioTraining };
