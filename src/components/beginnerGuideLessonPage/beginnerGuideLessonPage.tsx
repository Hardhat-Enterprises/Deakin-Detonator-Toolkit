import React, { useEffect, useState } from "react";
import { Container, Title, Text, Card, Stack, Badge, Collapse, Button, Group, Grid, Divider } from "@mantine/core";
import { BeginnerInformationContent } from "../BeginnerGuideLessonContent/BeginnerGuideLessonContent";
import { IconCheck, IconRocket, IconArrowRight, IconArrowLeft } from "@tabler/icons";

interface BGuideProps {
    lessonIndex: number;
}

const BGuideLesson: React.FC<BGuideProps> = ({ lessonIndex }) => {
    const guideData = BeginnerInformationContent[lessonIndex];
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [openSection, setOpenSection] = useState<number | null>(null);
    const [viewedSections, setViewedSections] = useState(
        guideData.lessonContent.map((page) => page.pageContent.map(() => false))
    );
    const [currentPageComplete, setCurrentPageComplete] = useState(false);

    // Current page data
    const currentPageData = guideData.lessonContent[currentPageIndex];
    const isLastPage = currentPageIndex === guideData.lessonContent.length - 1;
    const isFirstPage = currentPageIndex === 0;

    // Check if all sections on current page are viewed
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

    // Navigation
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
                                                <div className="tool-component-container">
                                                    {section.contentAttackToolClass}
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
