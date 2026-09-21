import { Button, Group, Modal, Select, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { useState } from "react";

interface ContactMaintenanceModalProps {
    opened: boolean;
    onClose: () => void;
}

type IssueType = "bug" | "improvement" | "feature" | "blank";

export default function ContactMaintenanceModal({ opened, onClose }: ContactMaintenanceModalProps) {
    const [issueType, setIssueType] = useState<IssueType | null>(null);

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
            return title.trim() !== "" && description.trim() !== "" && priority !== null && categories.trim() !== "";
        }

        return title.trim() !== "" && description.trim() !== "";
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

                {issueType === "bug" && (
                    <>
                        <TextInput />
                    </>
                )}

                {issueType === "improvement" && (
                    <>
                        <TextInput />
                    </>
                )}

                {issueType === "feature" && (
                    <>
                        <TextInput />
                    </>
                )}

                {issueType === "blank" && (
                    <>
                        <TextInput />
                    </>
                )}

                <Group position="right">
                    <Button variant="default" onClick={handleClose}>
                        Cancel
                    </Button>

                    <Button disabled={!isFormComplete()}>Submit</Button>
                </Group>
            </Stack>
        </Modal>
    );
}
