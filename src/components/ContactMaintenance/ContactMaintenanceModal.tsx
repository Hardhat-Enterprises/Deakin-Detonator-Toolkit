import { Button, Group, Modal, Select, Stack, Text, Textarea, TextInput, Divider, Paper } from "@mantine/core";
import { useState } from "react";

interface ContactMaintenanceModalProps {
    opened: boolean;
    onClose: () => void;
}

type IssueType = "bug" | "improvement" | "feature" | "blank";

export default function ContactMaintenanceModal({ opened, onClose }: ContactMaintenanceModalProps) {
    const [issueType, setIssueType] = useState<IssueType | null>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [steps, setSteps] = useState("");
    const [priority, setPriority] = useState<string | null>(null);
    const [categories, setCategories] = useState("");

    // GitHub authentication will be implemented in a later stage.
    const githubUsername: string | null = null;

    const resetForm = () => {
        setIssueType(null);
        setTitle("");
        setDescription("");
        setSteps("");
        setPriority(null);
        setCategories("");
        setPreviewMode(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const isFormComplete = () => {
        if (!githubUsername || !issueType) {
            return false;
        }

        if (issueType === "bug") {
            return title.trim() !== "" && description.trim() !== "" && steps.trim() !== "";
        }

        if (issueType === "improvement" || issueType === "feature") {
            return title.trim() !== "" && description.trim() !== "" && categories.trim() !== "";
        }

        return title.trim() !== "" && description.trim() !== "";
    };

    const getIssueTitle = () => {
        const issueTitle = title.trim();

        switch (issueType) {
            case "bug":
                return `[Bug]: ${issueTitle}`;

            case "feature":
                return `[Feature Request]: ${issueTitle}`;

            case "improvement":
                return `[Improvement Request]: ${issueTitle}`;

            case "blank":
                return issueTitle;

            default:
                return "";
        }
    };

    return (
        <Modal opened={opened} onClose={handleClose} title="Contact Maintenance" size="lg">
            <Stack>
                <div>
                    <Text weight={500}>GitHub Account</Text>

                    <Text size="sm">Username: {githubUsername ?? "Not signed in"}</Text>

                    <Button mt="xs" disabled>
                        {githubUsername ? "Change GitHub Account" : "Sign in with GitHub"}
                    </Button>
                </div>

                <Select
                    label="Issue Type"
                    placeholder="Select issue type"
                    value={issueType}
                    disabled={previewMode}
                    onChange={(value) => {
                        resetForm();
                        setIssueType(value as IssueType | null);
                    }}
                    data={[
                        { value: "bug", label: "Bug Report" },
                        { value: "improvement", label: "Improvement Request" },
                        { value: "feature", label: "Feature Request" },
                        { value: "blank", label: "Blank Issue" },
                    ]}
                />

                {!previewMode ? (
                    <>
                        {issueType === "bug" && (
                            <Text size="sm">Thanks for taking the time to fill out this bug report!</Text>
                        )}

                        {issueType === "feature" && (
                            <Text size="sm">Thanks for taking the time to fill out this Feature Request!</Text>
                        )}

                        {issueType === "improvement" && (
                            <Text size="sm">Thanks for taking the time to fill out this Improvement Request!</Text>
                        )}

                        {issueType === "bug" && (
                            <>
                                <TextInput
                                    label="Name of Bug"
                                    description="Bug name?"
                                    placeholder="Application Crash 1"
                                    required
                                    value={title}
                                    onChange={(event) => setTitle(event.currentTarget.value)}
                                />

                                <Textarea
                                    label="What Happened?"
                                    description="Also tell us, what did you expect to happen?"
                                    placeholder="A bug happened!"
                                    required
                                    minRows={4}
                                    value={description}
                                    onChange={(event) => setDescription(event.currentTarget.value)}
                                />

                                <Textarea
                                    label="Steps to Reproduce"
                                    description="What did you do to make this happen?"
                                    placeholder="Can you make it occur again?"
                                    required
                                    minRows={4}
                                    value={steps}
                                    onChange={(event) => setSteps(event.currentTarget.value)}
                                />
                            </>
                        )}

                        {issueType === "improvement" && (
                            <>
                                <TextInput
                                    label="Short name for suggested Improvement"
                                    description="Improvement description"
                                    placeholder="ex. Update nmap tool description to include a specific example in Step 1"
                                    required
                                    value={title}
                                    onChange={(event) => setTitle(event.currentTarget.value)}
                                />

                                <Select
                                    label="Priority"
                                    description="Please select the priority level for this improvement request"
                                    placeholder="Select priority"
                                    value={priority}
                                    onChange={setPriority}
                                    data={[
                                        { value: "Urgent", label: "Urgent" },
                                        { value: "High", label: "High" },
                                        { value: "Medium", label: "Medium" },
                                        { value: "Low", label: "Low" },
                                    ]}
                                />

                                <TextInput
                                    label="Categories"
                                    description="Applicable categories for development/implementation?"
                                    placeholder="(UI, UX, Enhancement, Accessibility, etc.)"
                                    required
                                    value={categories}
                                    onChange={(event) => setCategories(event.currentTarget.value)}
                                />

                                <Textarea
                                    label="Description of Improvement"
                                    description="A clear and concise description of what the tool and improvement is, and how it is different to the current version of the tool. Attach any relevant supporting screenshots or documents here."
                                    placeholder="A clear and concise description of what you want to happen."
                                    required
                                    minRows={4}
                                    value={description}
                                    onChange={(event) => setDescription(event.currentTarget.value)}
                                />
                            </>
                        )}

                        {issueType === "feature" && (
                            <>
                                <TextInput
                                    label="Name of Feature"
                                    description="Feature name?"
                                    placeholder="ex. New Tool"
                                    required
                                    value={title}
                                    onChange={(event) => setTitle(event.currentTarget.value)}
                                />

                                <Select
                                    label="Priority"
                                    description="What is the priority of this feature?"
                                    placeholder="Select priority"
                                    value={priority}
                                    onChange={setPriority}
                                    data={[
                                        { value: "High", label: "High" },
                                        { value: "Medium", label: "Medium" },
                                        { value: "Low", label: "Low" },
                                    ]}
                                />

                                <TextInput
                                    label="Categories"
                                    description="Applicable categories for development/implementation?"
                                    placeholder="(UI, UX, QA, Integration, etc.)"
                                    required
                                    value={categories}
                                    onChange={(event) => setCategories(event.currentTarget.value)}
                                />

                                <Textarea
                                    label="Description of Feature"
                                    description="A clear and concise description of what you want to happen. Attach any relevant supporting screenshots or documents here."
                                    placeholder="A clear and concise description of what you want to happen."
                                    required
                                    minRows={4}
                                    value={description}
                                    onChange={(event) => setDescription(event.currentTarget.value)}
                                />
                            </>
                        )}

                        {issueType === "blank" && (
                            <>
                                <TextInput
                                    label="Add a Title"
                                    placeholder="Title"
                                    required
                                    value={title}
                                    onChange={(event) => setTitle(event.currentTarget.value)}
                                />

                                <Textarea
                                    label="Add a Description"
                                    placeholder="Type your description here..."
                                    required
                                    minRows={10}
                                    value={description}
                                    onChange={(event) => setDescription(event.currentTarget.value)}
                                />
                            </>
                        )}
                    </>
                ) : (
                    <></>
                )}

                <Group position="apart">
                    <Button variant="default" onClick={() => setPreviewMode(!previewMode)} disabled={!issueType}>
                        {previewMode ? "Edit" : "Preview"}
                    </Button>

                    <Group>
                        <Button variant="default" onClick={handleClose}>
                            Cancel
                        </Button>

                        <Button disabled={!isFormComplete()}>Submit</Button>
                    </Group>
                </Group>
            </Stack>
        </Modal>
    );
}
