import React from 'react';
import { Card, Text, Title, Button } from '@mantine/core';

const TutorialTab = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <Title order={2}>📘 Welcome to the Tutorial Tab</Title>
      <Text mt="md">
        Learn how to use the Deakin Detonator Toolkit effectively with this guided tutorial.
      </Text>

      <Card shadow="sm" padding="lg" mt="xl" withBorder>
        <Title order={3}>🔰 Getting Started</Title>
        <Text size="sm" mt="sm">
          Learn the layout, basic tools, and how to start your first test.
        </Text>
      </Card>

      <Card shadow="sm" padding="lg" mt="lg" withBorder>
        <Title order={3}>🛠 Tools Overview</Title>
        <Text size="sm" mt="sm">
          Understand the purpose of each tool in the toolkit.
        </Text>
      </Card>

      <Card shadow="sm" padding="lg" mt="lg" withBorder>
        <Title order={3}>💡 Pro Tips</Title>
        <Text size="sm" mt="sm">
          Expert tricks to enhance your workflow.
        </Text>
      </Card>

      <Button variant="light" color="blue" fullWidth mt="xl">
        Start Full Walkthrough
      </Button>
    </div>
  );
};

export default TutorialTab;
