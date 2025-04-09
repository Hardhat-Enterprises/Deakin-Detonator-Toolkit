// ScenarioTraining.tsx

import { useState } from "react";
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
  Divider,
  Group,
  Notification,
  Space,
} from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons";
import { getAttackVectors, getTools } from "../components/RouteWrapper";
import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";

const ScenarioTraining = () => {
  const [difficulty, setDifficulty] = useState("Easy");
  const [vector, setVector] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [scenarioSections, setScenarioSections] = useState<Record<string, string>>({});
  const [userReport, setUserReport] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const availableTools = getTools().map((t) => t.name.toLowerCase());

  const attackVectorOptions = getAttackVectors().map((v) => ({
    value: v.name,
    label: v.name,
  }));

  const toolOptions = getTools().map((t) => ({
    value: t.name,
    label: t.name,
  }));

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

  const handleGenerate = async () => {
    setLoading(true);

    const selectedTools = tools.length > 0 ? tools : getTools().map((t) => t.name);
    const toolsMention = selectedTools
      .map((tool) => {
        const isAvailable = availableTools.includes(tool.toLowerCase());
        return isAvailable
          ? `${tool} is available in PT-GUI. Use it directly for analysis or exploitation.`
          : `${tool} is NOT available in PT-GUI. Use it externally via CLI.`;
      })
      .join("\n");

    const prompt = `
You are a senior penetration testing instructor. Generate a highly detailed, advanced training scenario that includes:

1. Scenario Context: Deeply immersive, describe a fictional company's infrastructure, departments, technology stack, and the reason for the assessment.
2. Objective: What exactly is being tested/exploited and why.
3. Attack Vector: Clearly name the CVE or technique and how it works.
4. Recommended PT-GUI Tools: Only suggest tools available in PT-GUI unless specified. If unavailable, say: "Not available in GUI. Use CLI tool: [tool name]".
5. Step-by-step Hints: Subtle, clever hints to guide students through the process.
6. Expected Outcome: What the user should realistically access or uncover.
7. Remediation Suggestions: Provide specific, non-generic, technical fixes based on the CVE/technique.

${toolsMention}

Difficulty: ${difficulty}
Attack Vector: ${vector}
    `.trim();

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
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
    } catch (err) {
      setScenarioSections({
        "Scenario Context": "❌ Error generating scenario. Check your API key or internet connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    try {
      const fileName = `PTGUI_Scenario_Report_${Date.now()}.txt`;
      const fullText =
        Object.entries(scenarioSections)
          .map(([title, content]) => `=== ${title} ===\n${content}`)
          .join("\n\n") +
        "\n\n=== User Notes ===\n" +
        userReport;

      await writeTextFile(
        {
          path: fileName,
          contents: fullText,
        },
        { dir: BaseDirectory.Download }
      );
      setSaveStatus(`✅ Saved to Downloads as "${fileName}"`);
    } catch (err) {
      setSaveStatus("❌ Failed to save the report.");
    }
  };

  return (
    <Stack p="md" spacing="lg">
      <Title align="center">Scenario Training</Title>
      <Text align="center" size="sm" color="dimmed">
        Generate a deep, realistic scenario using PT-GUI tools, CVEs, and real-world remediation.
      </Text>

      <Divider label="Customize Scenario" labelPosition="center" />

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

      <Button onClick={handleGenerate} loading={loading}>
        Generate Scenario
      </Button>

      <Paper shadow="sm" p="md" withBorder mt="md">
        <LoadingOverlay visible={loading} overlayBlur={1.5} />
        <Title order={4}>Scenario Details</Title>

        <Stack spacing="sm" mt="md">
          {Object.entries(scenarioSections).map(([heading, content]) => {
            if (heading === "Step-by-step Hints") return null;
            return (
              <div key={heading}>
                <Text weight={700} size="sm">{heading}</Text>
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
        <Button leftIcon={<IconDeviceFloppy size={18} />} variant="outline" onClick={handleSaveReport}>
          Save Report (.txt)
        </Button>
      </Group>

      {saveStatus && (
        <Notification title="Save Report" color={saveStatus.includes("successfully") ? "green" : "red"}>
          {saveStatus}
        </Notification>
      )}

      <Space h="xl" />
    </Stack>
  );
};

export { ScenarioTraining };
