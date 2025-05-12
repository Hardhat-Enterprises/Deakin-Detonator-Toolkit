import React, { useEffect, useState } from "react";
import { Container, Title, Text, Card, Stack, Badge, Collapse, Button, Group, Grid, Divider } from "@mantine/core";
import { BeginnerInformationContent } from "../BeginnerGuideLessonContent/BeginnerGuideLessonContent";
import { IconCheck, IconRocket, IconArrowRight, IconArrowLeft } from "@tabler/icons";
import { useNavigate } from "react-router-dom";
import HintedToolGrid from "../HintGrid/HintGrid";

interface BGuideProps {
    lessonIndex: number;
}
// This component renders a single lesson page using the lessons index in BeginnerInformationContent
const BGuideLesson: React.FC<BGuideProps> = ({ lessonIndex }) => {
    const navigate = useNavigate();
    const guideData = BeginnerInformationContent[lessonIndex];

    // Currently there arent any exercises, so when user opens a section or all the sections its classified as a complete section or page
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [currentPageComplete, setCurrentPageComplete] = useState(false);
    const [openSection, setOpenSection] = useState<number | null>(null);
    const [viewedSections, setViewedSections] = useState(
        guideData.lessonContent.map((page) => page.pageContent.map(() => false))
    );
    const currentPageData = guideData.lessonContent[currentPageIndex];
    const isLastPage = currentPageIndex === guideData.lessonContent.length - 1;
    const isFirstPage = currentPageIndex === 0;

    // Verifies all sections on current page are viewed
    useEffect(() => {
        const allViewed = viewedSections[currentPageIndex]?.every((section) => section);
        setCurrentPageComplete(allViewed);
    }, [viewedSections, currentPageIndex]);

    // Toggle section and mark as viewed
    const toggleSection = (sectionIndex: number) => {
        if (openSection !== sectionIndex) {
            const updatedViewedSections = [...viewedSections];
            updatedViewedSections[currentPageIndex][sectionIndex] = true;
            setViewedSections(updatedViewedSections);
        }
        setOpenSection(openSection === sectionIndex ? null : sectionIndex);
    };

    const goToNextPage = () => {
        if (!isLastPage) {
            setCurrentPageIndex(currentPageIndex + 1);
            setOpenSection(null);
        }
    };

    const goToPreviousPage = () => {
        if (!isFirstPage) {
            setCurrentPageIndex(currentPageIndex - 1);
            setOpenSection(null);
        }
    };

    const handleLessonComplete = () => {
        BeginnerInformationContent[lessonIndex].lessonCompletionStatus = true;
        navigate("/beginner-guides");
    };

    return (
        <Container fluid>
            <Stack spacing="md" p="md">
                <Grid>
                    <Grid.Col span={10}>
                        <Group>
                            <Title order={2}>{guideData.lessonName}</Title>
                            <Badge color="blue" size="sm" variant="filled">
                                {guideData.lessonDifficulty}
                            </Badge>
                            <Badge
                                color={currentPageData.isContentPractical ? "green" : "gray"}
                                size="sm"
                                variant="filled"
                            >
                                {currentPageData.isContentPractical ? "Practical" : "Theory"}
                            </Badge>
                            <Text size="sm" color="dimmed">
                                Page {currentPageIndex + 1} of {guideData.lessonContent.length}
                            </Text>
                        </Group>
                    </Grid.Col>

                    <Grid.Col span={2}>
                        <Group position="right">
                            {!isFirstPage && (
                                <Button leftIcon={<IconArrowLeft />} variant="outline" onClick={goToPreviousPage}>
                                    Previous
                                </Button>
                            )}

                            {!isLastPage && (
                                <Button
                                    rightIcon={<IconArrowRight />}
                                    disabled={!currentPageComplete}
                                    onClick={goToNextPage}
                                    title={
                                        currentPageComplete ? "Continue to next page" : "View all sections to continue"
                                    }
                                >
                                    Next
                                </Button>
                            )}

                            {isLastPage && (
                                <Button
                                    rightIcon={<IconRocket />}
                                    color="green"
                                    disabled={!currentPageComplete}
                                    title={currentPageComplete ? "Complete lesson" : "View all sections to complete"}
                                    onClick={handleLessonComplete}
                                >
                                    Complete
                                </Button>
                            )}
                        </Group>
                    </Grid.Col>
                </Grid>

                <Text color="dimmed">{guideData.lessonDescription}</Text>

                <Stack spacing="sm">
                    {currentPageData.pageContent.map((section, index) => (
                        <Card key={index} withBorder shadow="sm" radius="md" p="md">
                            <Stack spacing="xs">
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Group spacing="xs">
                                        <Text weight={600}>{section.name}</Text>
                                        {viewedSections[currentPageIndex][index] && (
                                            <IconCheck size={16} color="green" />
                                        )}
                                    </Group>
                                    <Button variant="subtle" compact onClick={() => toggleSection(index)}>
                                        {openSection === index ? "Hide" : "Show"}
                                    </Button>
                                </div>
                                <Collapse in={openSection === index}>
                                    <div>
                                        <Text style={{ whiteSpace: "pre-line", marginTop: "10px" }}>
                                            {section.content}
                                        </Text>

                                        {section.contentAttackToolClass && (
                                            <>
                                                <Divider my="md" />
                                                <div>
                                                    <HintedToolGrid
                                                        tool={section.contentAttackToolClass}
                                                        hints={section.hints}
                                                        developmentMode={guideData.developmentMode || false}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Collapse>
                            </Stack>
                        </Card>
                    ))}
                </Stack>

                {!currentPageComplete && (
                    <Text color="dimmed" size="xs" align="center" mt="md">
                        Please view all sections to continue
                    </Text>
                )}
            </Stack>
        </Container>
    );
};

export default BGuideLesson;
