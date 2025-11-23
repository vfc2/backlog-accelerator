import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';
import {
  ActionIcon,
  AppShell,
  Badge,
  Box,
  Card,
  Group,
  Slider,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconBell,
  IconLayoutDashboard,
  IconMaximize,
  IconRefresh,
  IconSearch,
  IconSettings,
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

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const isEditableElement = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable;
};

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
  const zoomMin = 0.6;
  const zoomMax = 1.6;
  const panLimit = 360;

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panOriginRef = useRef({ x: 0, y: 0 });
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const epic = backlogItems.find((item) => item.type === 'epic');
  const features = backlogItems.filter((item) => item.type === 'feature');
  const storiesByFeature = features.map((feature) => ({
    feature,
    stories: backlogItems.filter(
      (story) => story.type === 'story' && story.parentId === feature.id
    ),
  }));

  const updateZoom = (value: number) => {
    setZoom(clamp(Number(value.toFixed(2)), zoomMin, zoomMax));
  };

  const adjustZoom = useCallback(
    (delta: number) => {
      setZoom((current) =>
        clamp(Number((current + delta).toFixed(2)), zoomMin, zoomMax)
      );
    },
    [zoomMin, zoomMax]
  );

  const handleZoomOut = () => adjustZoom(-0.1);
  const handleZoomIn = () => adjustZoom(0.1);
  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleFitView = () => {
    setZoom(0.9);
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.button !== 1) {
      return;
    }
    setIsPanning(true);
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    panOriginRef.current = pan;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    const dx = event.clientX - pointerStartRef.current.x;
    const dy = event.clientY - pointerStartRef.current.y;
    setPan({
      x: clamp(panOriginRef.current.x + dx, -panLimit, panLimit),
      y: clamp(panOriginRef.current.y + dy, -panLimit, panLimit),
    });
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    setIsPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }
      if (isEditableElement(event.target)) {
        return;
      }

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        adjustZoom(0.1);
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        adjustZoom(-0.1);
      } else if (event.key === '0') {
        event.preventDefault();
        handleResetView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [adjustZoom, handleResetView]);

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const multiplier = event.ctrlKey ? 0.0025 : 0.0015;
      adjustZoom(-event.deltaY * multiplier);
    };

    node.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      node.removeEventListener('wheel', handleWheel);
    };
  }, [adjustZoom]);

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
              <ActionIcon.Group>
                <ActionIcon variant="subtle" color="gray">
                  <IconBell size={16} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="gray">
                  <IconSettings size={16} />
                </ActionIcon>
              </ActionIcon.Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Stack gap="lg" h="100%">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <IconLayoutDashboard size={18} style={{ opacity: 0.5 }} />
              <Text size="sm" fw={500} c="dimmed">
                Backlog Diagram
              </Text>
            </Group>

            <Box
              px="sm"
              py={6}
              style={{
                borderRadius: 999,
                border: '1px solid var(--mantine-color-gray-3)',
                backgroundColor: 'var(--mantine-color-white)',
              }}
            >
              <Group gap="xs">
                <Tooltip label="Zoom out (Ctrl + - / mouse wheel)" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={handleZoomOut}
                    aria-label="Zoom out"
                  >
                    <IconZoomOut size={16} />
                  </ActionIcon>
                </Tooltip>
                <Slider
                  value={zoom}
                  onChange={updateZoom}
                  min={zoomMin}
                  max={zoomMax}
                  step={0.05}
                  size="sm"
                  color="blue"
                  w={150}
                  styles={{ thumb: { width: 14, height: 14 } }}
                  aria-label="Zoom level"
                />
                <Tooltip label="Zoom in (Ctrl + + / mouse wheel)" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={handleZoomIn}
                    aria-label="Zoom in"
                  >
                    <IconZoomIn size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Fit to screen" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={handleFitView}
                    aria-label="Fit to view"
                  >
                    <IconMaximize size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Reset view (Ctrl + 0)" withArrow>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={handleResetView}
                    aria-label="Reset view"
                  >
                    <IconRefresh size={16} />
                  </ActionIcon>
                </Tooltip>
                <Text size="sm" fw={500} c="dimmed" style={{ width: 48, textAlign: 'right' }}>
                  {Math.round(zoom * 100)}%
                </Text>
              </Group>
            </Box>
          </Group>

          <Box
            ref={canvasRef}
            style={{
              flex: 1,
              borderRadius: 16,
              border: 'none',
              backgroundColor: 'transparent',
              overflow: 'hidden',
              cursor: isPanning ? 'grabbing' : 'grab',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <Box
              style={{
                minHeight: '100%',
                padding: 32,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'top left',
                transition: isPanning ? 'none' : 'transform 120ms ease-out',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 48,
              }}
            >
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
            </Box>
          </Box>
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
