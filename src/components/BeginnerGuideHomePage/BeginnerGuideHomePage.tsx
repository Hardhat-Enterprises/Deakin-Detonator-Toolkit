import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Title, Text, Card, Stack, Badge, Button, Group } from "@mantine/core";
import {
    BeginnerGuideLessonContentFormat,
    BeginnerInformationContent,
} from "../BeginnerGuideLessonContent/BeginnerGuideLessonContent";
import { IconBook, IconArrowRight, IconCheck } from "@tabler/icons";
import BGuideLesson from "../BeginnerGuideLessonPage/beginnerGuideLessonPage";

const BPathPage: React.FC = () => {
    const navigate = useNavigate();
    const params = useParams<{ lessonId?: string }>();

    // Handle navigation to specific lesson
    const navigateToLesson = (lessonIndex: number): void => {
        navigate(`/beginner-guides/lesson${lessonIndex + 1}`);
    };

    // Check if we're on a specific lesson page using URL params
    if (params.lessonId) {
        const lessonIndex = parseInt(params.lessonId, 10) - 1;
        if (lessonIndex >= 0 && lessonIndex < BeginnerInformationContent.length) {
            return <BGuideLesson lessonIndex={lessonIndex} />;
        }
    }

    // Show lesson selection page if no specific lesson is requested
    return (
        <Container fluid>
            <Stack spacing="md" p="md">
                <Title order={2}>Beginner Guide Home Page</Title>
                <Text>Select a lesson to begin your penetration testing journey.</Text>

                <Stack spacing="sm">
                    {BeginnerInformationContent.map((lesson: BeginnerGuideLessonContentFormat, index: number) => (
                        <Card key={index} withBorder shadow="sm" radius="md" p="md">
                            <Stack spacing="xs">
                                <Group position="apart">
                                    <Group spacing="xs">
                                        <IconBook size={20} />
                                        <Title order={4}>{lesson.lessonName}</Title>
                                        <Badge color="blue" size="sm" variant="filled">
                                            {lesson.lessonDifficulty}
                                        </Badge>
                                        {lesson.lessonCompletionStatus && (
                                            <Badge color="green" size="sm" variant="filled">
                                                <Group spacing="xs">
                                                    <IconCheck size={14} />
                                                    <Text size="xs">Completed</Text>
                                                </Group>
                                            </Badge>
                                        )}
                                    </Group>
                                    <Button
                                        rightIcon={<IconArrowRight size={16} />}
                                        onClick={() => navigateToLesson(index)}
                                        color={lesson.lessonCompletionStatus ? "green" : "blue"}
                                    >
                                        {lesson.lessonCompletionStatus ? "Review" : "Start"} Lesson
                                    </Button>
                                </Group>
                                <Text color="dimmed">{lesson.lessonDescription}</Text>
                                <Text size="sm">
                                    {lesson.lessonContent.reduce(
                                        (total, section) => total + section.pageContent.length,
                                        0
                                    )}{" "}
                                    sections
                                </Text>
                            </Stack>
                        </Card>
                    ))}
                </Stack>
            </Stack>
        </Container>
    );
};

export default BPathPage;
