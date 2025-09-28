import React, { useState } from "react";
import { Container, Title, Text, Card, SimpleGrid, Button, Center, Modal, Group } from "@mantine/core";

interface Lesson {
<<<<<<< HEAD
  title: string;
  folder: string;      // folder name for slideshow images
  slideCount: number;  // number of slides in slideshow
  image: string;       // tile image location
}

const lessons: Lesson[] = [
  { title: "Introduction to Pentesting", folder: "intro", slideCount: 9, image: "resources/images/introimg.png" },
  { title: "Lesson 1: Scanning", folder: "scanning", slideCount: 6, image: "resources/images/lesson1img.png" },
  { title: "Lesson 2: Enumeration", folder: "enumeration", slideCount: 6, image: "resources/images/lesson2img.png" },
  { title: "Lesson 3: Exploitation", folder: "exploitation", slideCount: 6, image: "resources/images/lesson3img.png" },
];

const BeginnerSection: React.FC = () => {
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);``

  const openSlideshow = (lessonIndex: number) => {
    console.log("Opening slideshow for lesson:", lessons[lessonIndex].title);
    setActiveLessonIndex(lessonIndex);
    setActiveSlideIndex(0);
    setSlideshowOpen(true);
  };

  const nextSlide = () => {
    setActiveSlideIndex(idx => Math.min(idx + 1, lessons[activeLessonIndex].slideCount - 1));
  };

  const prevSlide = () => {
    setActiveSlideIndex(idx => Math.max(idx - 1, 0));
  };

  const currentSlideUrl = `/lessons/${lessons[activeLessonIndex].folder}/Slide${activeSlideIndex + 1}.PNG`;

  console.log("Current slide URL:", currentSlideUrl);

  return (
    <Container fluid>
      <Center mb="md">
        <Title order={2}>Beginner Section</Title>
      </Center>
      <Text align="center" mb="lg">
        Click a lesson's button to open its slideshow.
      </Text>
      <SimpleGrid cols={4} spacing="lg">
        {lessons.map((lesson, idx) => (
          <Card key={lesson.title} shadow="md" p="lg" radius="md" withBorder>
            <Center>
              <img
                src={lesson.image}
                alt={`${lesson.title} preview`}
                style={{
                  width: 500,
                  height: 320,
                  objectFit: "cover",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              />
            </Center>
            <Center>
              <Text weight={600} mb="sm" align="center">{lesson.title}</Text>
            </Center>
            <Center>
              <Button variant="outline" color="blue" onClick={() => openSlideshow(idx)}>
                Open {lesson.title} Slideshow
              </Button>
            </Center>
          </Card>
        ))}
      </SimpleGrid>

      <Modal
        opened={slideshowOpen}
        onClose={() => setSlideshowOpen(false)}
        centered
        size="auto"
        title={`${lessons[activeLessonIndex].title} — Slide ${activeSlideIndex + 1}`}
      >
        <Center>
        <img
            src={currentSlideUrl}
            alt={`Slide ${activeSlideIndex + 1}`}
            style={{
              maxWidth: "90vw",   // take up 90% of the viewport width
              maxHeight: "80vh",  // take up 80% of the viewport height
              objectFit: "contain",
            }}
            onError={(e) => {
              console.error(`Failed to load slide image: ${currentSlideUrl}`);
              (e.target as HTMLImageElement).src = "/images/image-missing.png";
            }}
          />

        </Center>
        <Group position="center" mt="lg" spacing="md">
          <Button onClick={prevSlide} disabled={activeSlideIndex === 0} variant="subtle">
            Previous
          </Button>
          <Button onClick={nextSlide} disabled={activeSlideIndex === lessons[activeLessonIndex].slideCount - 1} variant="subtle">
            Next
          </Button>
        </Group>
        <Center mt="lg">
          <Button variant="light" onClick={() => setSlideshowOpen(false)}>
            Close
          </Button>
        </Center>
      </Modal>
    </Container>
  );
=======
    title: string;
    folder: string; // folder name for slideshow images
    slideCount: number; // number of slides in slideshow
    image: string; // tile image location
}

const lessons: Lesson[] = [
    {
        title: "Introduction to Pentesting",
        folder: "intro",
        slideCount: 9,
        image: "resources/images/introimg.png",
    },
    {
        title: "Lesson 1: Scanning",
        folder: "scanning",
        slideCount: 6,
        image: "resources/images/lesson1img.png",
    },
    {
        title: "Lesson 2: Enumeration",
        folder: "enumeration",
        slideCount: 6,
        image: "resources/images/lesson2img.png",
    },
    {
        title: "Lesson 3: Exploitation",
        folder: "exploitation",
        slideCount: 6,
        image: "resources/images/lesson3img.png",
    },
];

const BeginnerSection: React.FC = () => {
    const [slideshowOpen, setSlideshowOpen] = useState(false);
    const [activeLessonIndex, setActiveLessonIndex] = useState(0);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    ``;

    const openSlideshow = (lessonIndex: number) => {
        console.log("Opening slideshow for lesson:", lessons[lessonIndex].title);
        setActiveLessonIndex(lessonIndex);
        setActiveSlideIndex(0);
        setSlideshowOpen(true);
    };

    const nextSlide = () => {
        setActiveSlideIndex((idx) => Math.min(idx + 1, lessons[activeLessonIndex].slideCount - 1));
    };

    const prevSlide = () => {
        setActiveSlideIndex((idx) => Math.max(idx - 1, 0));
    };

    const currentSlideUrl = `/lessons/${lessons[activeLessonIndex].folder}/Slide${activeSlideIndex + 1}.PNG`;

    console.log("Current slide URL:", currentSlideUrl);

    return (
        <Container fluid>
            <Center mb="md">
                <Title order={2}>Beginner Section</Title>
            </Center>
            <Text align="center" mb="lg">
                Click a lesson's button to open its slideshow.
            </Text>
            <SimpleGrid cols={4} spacing="lg">
                {lessons.map((lesson, idx) => (
                    <Card key={lesson.title} shadow="md" p="lg" radius="md" withBorder>
                        <Center>
                            <img
                                src={lesson.image}
                                alt={`${lesson.title} preview`}
                                style={{
                                    width: 500,
                                    height: 320,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    marginBottom: 16,
                                }}
                            />
                        </Center>
                        <Center>
                            <Text weight={600} mb="sm" align="center">
                                {lesson.title}
                            </Text>
                        </Center>
                        <Center>
                            <Button variant="outline" color="blue" onClick={() => openSlideshow(idx)}>
                                Open {lesson.title} Slideshow
                            </Button>
                        </Center>
                    </Card>
                ))}
            </SimpleGrid>

            <Modal
                opened={slideshowOpen}
                onClose={() => setSlideshowOpen(false)}
                centered
                size="auto"
                title={`${lessons[activeLessonIndex].title} — Slide ${activeSlideIndex + 1}`}
            >
                <Center>
                    <img
                        src={currentSlideUrl}
                        alt={`Slide ${activeSlideIndex + 1}`}
                        style={{
                            maxWidth: "90vw", // take up 90% of the viewport width
                            maxHeight: "80vh", // take up 80% of the viewport height
                            objectFit: "contain",
                        }}
                        onError={(e) => {
                            console.error(`Failed to load slide image: ${currentSlideUrl}`);
                            (e.target as HTMLImageElement).src = "/images/image-missing.png";
                        }}
                    />
                </Center>
                <Group position="center" mt="lg" spacing="md">
                    <Button onClick={prevSlide} disabled={activeSlideIndex === 0} variant="subtle">
                        Previous
                    </Button>
                    <Button
                        onClick={nextSlide}
                        disabled={activeSlideIndex === lessons[activeLessonIndex].slideCount - 1}
                        variant="subtle"
                    >
                        Next
                    </Button>
                </Group>
                <Center mt="lg">
                    <Button variant="light" onClick={() => setSlideshowOpen(false)}>
                        Close
                    </Button>
                </Center>
            </Modal>
        </Container>
    );
>>>>>>> 3378cb1 (Yarn prettier run)
};

export default BeginnerSection;
