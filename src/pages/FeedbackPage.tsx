import { useState, useEffect } from "react";
import { Stack, Title, Textarea, Button, Card, Text, Grid } from "@mantine/core";

const FEEDBACK_STORAGE_KEY = "ddt_user_feedbacks";

const dummyFeedbacks = [
    "This toolkit is very user-friendly. Great for beginners!",
    "Loved the Tools page. Very organized and informative.",
    "Attack Vectors section helped me understand real-world exploits.",
    "Walkthrough videos are really helpful for practice.",
];

export default function FeedbackPage() {
    const [feedback, setFeedback] = useState("");
    const [allFeedbacks, setAllFeedbacks] = useState<string[]>([]);

    // Load feedbacks from localStorage + Dummy feedbacks on first load
    useEffect(() => {
        const storedFeedbacks = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || "[]");
        setAllFeedbacks([...storedFeedbacks, ...dummyFeedbacks]);
    }, []);

    // Handle feedback submission
    const handleSubmit = () => {
        if (feedback.trim() === "") return;

        const updatedFeedbacks = [feedback, ...allFeedbacks];
        setAllFeedbacks(updatedFeedbacks);
        localStorage.setItem(
            FEEDBACK_STORAGE_KEY,
            JSON.stringify([feedback, ...JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || "[]")])
        );
        setFeedback("");
    };

    return (
        <Stack align="center" spacing="md">
            <Title>Feedback</Title>
            <Textarea
                placeholder="Share your experience with the Deakin Detonator Toolkit..."
                value={feedback}
                onChange={(event) => setFeedback(event.currentTarget.value)}
                autosize
                minRows={3}
                maxRows={6}
                style={{ width: "60%" }}
            />
            <Button onClick={handleSubmit} color="blue">
                Submit Feedback
            </Button>

            <Title order={3} mt="xl">
                Community Feedback
            </Title>
            <Grid gutter="md" style={{ width: "60%" }}>
                {allFeedbacks.length === 0 ? (
                    <Text align="center" style={{ width: "100%" }}>
                        No feedback yet. Be the first!
                    </Text>
                ) : (
                    allFeedbacks.map((fb, index) => (
                        <Grid.Col span={12} key={index}>
                            <Card shadow="sm" p="md" radius="md" withBorder>
                                <Text>{fb}</Text>
                            </Card>
                        </Grid.Col>
                    ))
                )}
            </Grid>
        </Stack>
    );
}
