import {
  ActionIcon,
  AppShell,
  Badge,
  Box,
  Card,
  Group,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconDotsVertical,
  IconLayoutDashboard,
  IconMaximize,
  IconSearch,
  IconZoomIn,
  IconZoomOut,
} from '@tabler/icons-react';

type BacklogItemType = 'epic' | 'feature' | 'story';

type BacklogItem = {
  id: string;
  type: BacklogItemType;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  effort?: string;
  parentId?: string;
};

const backlogItems: BacklogItem[] = [
  {
    id: 'epic-1',
    type: 'epic',
    title: 'Account & Contact Management',
    description:
      'Authoritative customer and organization data model with governance and consent.',
    priority: 'HIGH',
  },
  {
    id: 'feature-1',
    parentId: 'epic-1',
    type: 'feature',
    title: 'Account Data Model & CRUD',
    description: 'Normalized extensible schema with auditing and optimistic concurrency.',
    priority: 'HIGH',
    effort: 'M',
  },
  {
    id: 'feature-2',
    parentId: 'epic-1',
    type: 'feature',
    title: 'Contact Lifecycle & Consent',
    description: 'Manage consent capture, revocation, and channel preferences.',
    priority: 'HIGH',
    effort: 'M',
  },
  {
    id: 'story-1',
    parentId: 'feature-1',
    type: 'story',
    title: 'Create Account Record',
    description: 'Persist mandatory legal identifiers and classification attributes.',
    priority: 'HIGH',
    effort: 'S',
  },
  {
    id: 'story-2',
    parentId: 'feature-1',
    type: 'story',
    title: 'Update Account With Audit Trail',
    description: 'Patch mutable fields while preserving immutable audit snapshots.',
    priority: 'MEDIUM',
    effort: 'S',
  },
  {
    id: 'story-3',
    parentId: 'feature-2',
    type: 'story',
    title: 'Create Contact With Consent Flags',
    description: 'Capture consent timestamps for marketing and service channels.',
    priority: 'HIGH',
    effort: 'S',
  },
  {
    id: 'story-4',
    parentId: 'feature-2',
    type: 'story',
    title: 'Update Contact Consent Preferences',
    description: 'Modify consent state with revocation audit history.',
    priority: 'MEDIUM',
    effort: 'XS',
  },
];

const BacklogCard = ({ item }: { item: BacklogItem }) => {
  const badgeColor =
    item.type === 'epic' ? 'orange' : item.type === 'feature' ? 'violet' : 'cyan';

  const priorityColor =
    item.priority === 'HIGH'
      ? 'red'
      : item.priority === 'MEDIUM'
      ? 'yellow'
      : 'gray';

  const priorityLabel = `Priority • ${item.priority}`;

  return (
    <Card withBorder radius="lg" w={320} shadow="sm">
      <Stack gap="xs">
        <Group justify="space-between">
          <Badge color={badgeColor} variant="light" size="sm">
            {item.type.toUpperCase()}
          </Badge>
          {item.effort && (
            <Badge variant="outline" size="sm" color="gray">
              {item.effort}
            </Badge>
          )}
        </Group>
        <Title order={4}>{item.title}</Title>
        <Text c="dimmed" size="sm">
          {item.description}
        </Text>
        <Badge variant="dot" color={priorityColor} size="sm">
          {priorityLabel}
        </Badge>
      </Stack>
    </Card>
  );
};

const App = () => {
  const epic = backlogItems.find((item) => item.type === 'epic');
  const features = backlogItems.filter((item) => item.type === 'feature');
  const storiesByFeature = features.map((feature) => ({
    feature,
    stories: backlogItems.filter(
      (story) => story.type === 'story' && story.parentId === feature.id
    ),
  }));

  return (
    <AppShell header={{ height: 64 }} padding="md" bg="gray.0">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <Box c="blue" fw={700} fz="lg">
              Backlog Accelerator
            </Box>
            <Badge variant="light" color="blue" size="xs">
              ALPHA
            </Badge>
          </Group>

          <Group gap="xs">
            <TextInput
              placeholder="Search backlog"
              leftSection={<IconSearch size={16} />}
              radius="xl"
              size="xs"
              w={240}
            />
            <ActionIcon variant="subtle" color="gray">
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Stack gap="lg" h="100%">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Group gap="xs" mb={5}>
                <IconLayoutDashboard size={18} style={{ opacity: 0.5 }} />
                <Text size="sm" fw={500} c="dimmed">
                  Backlog Diagram
                </Text>
              </Group>
              <Title order={3}>Account & Contact Management</Title>
            </Box>

            <Group gap="xs">
              <ActionIcon variant="default" size="lg" radius="md">
                <IconZoomOut size={18} />
              </ActionIcon>
              <ActionIcon variant="default" size="lg" radius="md">
                <IconZoomIn size={18} />
              </ActionIcon>
              <ActionIcon variant="default" size="lg" radius="md">
                <IconMaximize size={18} />
              </ActionIcon>
            </Group>
          </Group>

          <ScrollArea style={{ flex: 1 }} type="auto">
            <Stack align="center" gap="xl" pb="xl">
              {epic && <BacklogCard item={epic} />}

              <Group align="flex-start" gap="xl">
                {storiesByFeature.map(({ feature, stories }) => (
                  <Stack key={feature.id} align="center" gap="md">
                    <BacklogCard item={feature} />
                    <Stack gap="md">
                      {stories.map((story) => (
                        <BacklogCard key={story.id} item={story} />
                      ))}
                    </Stack>
                  </Stack>
                ))}
              </Group>
            </Stack>
          </ScrollArea>
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
