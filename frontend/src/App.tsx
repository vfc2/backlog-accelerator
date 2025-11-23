import {
  AppShell,
  Badge,
  Button,
  Card,
  Group,
  Text,
  Title,
  TextInput,
  ActionIcon,
  Stack,
  Box,
  ScrollArea,
  NavLink,
  Divider,
  MantineProvider,
  createTheme,
} from '@mantine/core';
import {
  IconSearch,
  IconPlus,
  IconZoomIn,
  IconZoomOut,
  IconMaximize,
  IconMessage,
  IconLayoutDashboard,
  IconSettings,
  IconBulb,
  IconFolder,
  IconDownload,
  IconDotsVertical,
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

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, sans-serif',
});

const BacklogCard = ({ item }: { item: BacklogItem }) => {
  const badgeColor =
    item.type === 'epic'
      ? 'orange'
      : item.type === 'feature'
      ? 'violet'
      : 'cyan';

  const priorityColor =
    item.priority === 'HIGH'
      ? 'red'
      : item.priority === 'MEDIUM'
      ? 'orange'
      : 'green';

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder w={300}>
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <Badge color={badgeColor} variant="light">
            {item.type}
          </Badge>
          <Badge color={priorityColor} variant="outline" size="xs">
            {item.priority}
          </Badge>
        </Group>
        {item.effort && (
          <Text size="xs" c="dimmed" fw={500}>
            {item.effort}
          </Text>
        )}
      </Group>

      <Text fw={600} size="sm" mt="xs">
        {item.title}
      </Text>

      <Text size="xs" c="dimmed" mt={5}>
        {item.description}
      </Text>

      {item.type === 'story' && (
        <Button variant="subtle" size="xs" mt="md" p={0} h="auto">
          3 acceptance criteria
        </Button>
      )}
    </Card>
  );
};

function App() {
  const epic = backlogItems.find((item) => item.type === 'epic');
  const features = backlogItems.filter((item) => item.type === 'feature');
  const storiesByFeature = features.map((feature) => ({
    feature,
    stories: backlogItems.filter(
      (story) => story.type === 'story' && story.parentId === feature.id,
    ),
  }));

  return (
    <MantineProvider theme={theme}>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 250, breakpoint: 'sm' }}
        padding="md"
        bg="gray.0"
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Group>
              <Group gap="xs">
                <Box c="blue" fw={700} fz="lg">
                  forgebase
                </Box>
                <Badge variant="light" color="blue" size="xs">ALPHA</Badge>
              </Group>
              <Divider orientation="vertical" mx="sm" />
              <Group gap={5}>
                <Button variant="subtle" color="gray" leftSection={<IconMessage size={16} />}>
                  Chat
                </Button>
                <Button variant="light" leftSection={<IconLayoutDashboard size={16} />}>
                  Backlog
                </Button>
              </Group>
            </Group>

            <Group>
              <TextInput
                placeholder="Search backlog"
                leftSection={<IconSearch size={16} />}
                radius="xl"
                size="xs"
                w={250}
              />
              <Button variant="default" size="xs" leftSection={<IconDownload size={16} />}>
                Export
              </Button>
              <ActionIcon variant="subtle" color="gray">
                <IconDotsVertical size={16} />
              </ActionIcon>
              <Button size="xs" leftSection={<IconPlus size={16} />}>
                New Item
              </Button>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <Button fullWidth leftSection={<IconPlus size={16} />} mb="lg">
            New Project
          </Button>

          <Text size="xs" fw={500} c="dimmed" mb="sm">
            Recent Projects
          </Text>
          <NavLink
            label="Hackaton demo"
            description="22/09/2025"
            leftSection={<IconFolder size={16} />}
            active
            variant="light"
            mb="xs"
            style={{ borderRadius: 8 }}
          />

          <Box style={{ flex: 1 }} />

          <NavLink
            label="Tips & Examples"
            leftSection={<IconBulb size={16} />}
            style={{ borderRadius: 8 }}
          />
          <NavLink
            label="Preferences"
            leftSection={<IconSettings size={16} />}
            style={{ borderRadius: 8 }}
          />
        </AppShell.Navbar>

        <AppShell.Main>
          <Stack gap="lg" h="100%">
            <Group justify="space-between">
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
                <Button variant="default" leftSection={<IconDownload size={16} />}>
                  Export
                </Button>
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
    </MantineProvider>
  );
}

export default App;
