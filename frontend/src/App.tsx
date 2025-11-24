import {
  useCallback,
  useEffect,
  useMemo,
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

type BacklogItemType = 'epic' | 'feature' | 'story' | 'task';

type EffortSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

interface BaseBacklogItem {
  id: number;
  type: BacklogItemType;
  title: string;
  description: string;
  effort: EffortSize;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface EpicBacklogItem extends BaseBacklogItem {
  type: 'epic';
}

interface FeatureBacklogItem extends BaseBacklogItem {
  type: 'feature';
  parentId: number;
}

interface StoryBacklogItem extends BaseBacklogItem {
  type: 'story';
  parentId: number;
  acceptanceCriteria: string[];
  implementationDetails: string;
  assumptions: string;
}

interface TaskBacklogItem extends BaseBacklogItem {
  type: 'task';
  parentId: number;
}

type BacklogItem =
  | EpicBacklogItem
  | FeatureBacklogItem
  | StoryBacklogItem
  | TaskBacklogItem;

type BacklogTreeNode = BacklogItem & { children: BacklogTreeNode[] };

const connectorColor = 'var(--mantine-color-gray-4)';
const CARD_WIDTH = 320;
const CARD_HEIGHT = 190;
const HORIZONTAL_UNIT = CARD_WIDTH + 120;
const LEVEL_HEIGHT = CARD_HEIGHT + 140;
const ROOT_GAP_UNITS = 1;

const backlogItems: BacklogItem[] = [
  {
    id: 1,
    type: 'epic',
    title: 'Account & Contact Management',
    description:
      'Authoritative customer and organization data model with governance and consent.',
    priority: 'HIGH',
    effort: 'XL',
  },
  {
    id: 2,
    parentId: 1,
    type: 'feature',
    title: 'Account Data Model & CRUD',
    description: 'Normalized extensible schema with auditing and optimistic concurrency.',
    priority: 'HIGH',
    effort: 'L',
  },
  {
    id: 3,
    parentId: 1,
    type: 'feature',
    title: 'Contact Lifecycle & Consent',
    description: 'Manage consent capture, revocation, and channel preferences.',
    priority: 'HIGH',
    effort: 'L',
  },
  {
    id: 4,
    parentId: 2,
    type: 'story',
    title: 'Create Account Record',
    description: 'Persist mandatory legal identifiers and classification attributes.',
    priority: 'HIGH',
    effort: 'M',
    acceptanceCriteria: [
      'User can submit required identity fields successfully',
      'Record is versioned with immutable audit snapshot',
      'Validation errors highlight missing or invalid data',
    ],
    implementationDetails:
      'Implement GraphQL mutation backed by optimistic concurrency and audit triggers.',
    assumptions: 'Legal identifiers are pre-validated by upstream KYC provider.',
  },
  {
    id: 5,
    parentId: 2,
    type: 'story',
    title: 'Update Account With Audit Trail',
    description: 'Patch mutable fields while preserving immutable audit snapshots.',
    priority: 'MEDIUM',
    effort: 'S',
    acceptanceCriteria: [
      'PATCH request returns version and timestamp',
      'Audit table captures before/after diff',
      'Concurrent update attempt returns proper error',
    ],
    implementationDetails: 'Use PostgreSQL row-level security and jsonb diff for audits.',
    assumptions: 'Consumers can tolerate eventual consistency (<1s).',
  },
  {
    id: 6,
    parentId: 3,
    type: 'story',
    title: 'Create Contact With Consent Flags',
    description: 'Capture consent timestamps for marketing and service channels.',
    priority: 'HIGH',
    effort: 'S',
    acceptanceCriteria: [
      'Contact form persists per-channel consent timestamps',
      'API enforces default opt-out for unspecified channels',
      'Audit log records consent capture source',
    ],
    implementationDetails: 'Extend contact table with consent jsonb, include CDC feed.',
    assumptions: 'Channels limited to email, sms, push for MVP.',
  },
  {
    id: 7,
    parentId: 3,
    type: 'story',
    title: 'Update Contact Consent Preferences',
    description: 'Modify consent state with revocation audit history.',
    priority: 'MEDIUM',
    effort: 'XS',
    acceptanceCriteria: [
      'Revocation triggers timestamped audit entry',
      'Preference center displays latest consent per channel',
      'API rejects updates missing regulatory justification',
    ],
    implementationDetails: 'Expose REST endpoint gated by consent-admin scope.',
    assumptions: 'Downstream systems poll CDC feed every 5 minutes.',
  },
  {
    id: 8,
    parentId: 4,
    type: 'task',
    title: 'Design Account GraphQL Schema',
    description: 'Model account types, enums, and optimistic concurrency fields.',
    priority: 'MEDIUM',
    effort: 'S',
  },
  {
    id: 9,
    parentId: 4,
    type: 'task',
    title: 'Implement Audit Trigger',
    description: 'Create database trigger to snapshot account row before updates.',
    priority: 'HIGH',
    effort: 'XS',
  },
  {
    id: 10,
    parentId: 6,
    type: 'task',
    title: 'Consent Form UI',
    description: 'Build Mantine form with per-channel toggle and timestamps.',
    priority: 'MEDIUM',
    effort: 'S',
  },
  {
    id: 11,
    parentId: 7,
    type: 'task',
    title: 'CDC Consent Feed',
    description: 'Publish consent changes to Kafka topic consumed by marketing stack.',
    priority: 'MEDIUM',
    effort: 'M',
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
    <Card
      withBorder
      radius="lg"
      w={CARD_WIDTH}
      h={CARD_HEIGHT}
      shadow="sm"
      style={{ userSelect: 'none' }}
    >
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

const buildBacklogTree = (items: BacklogItem[]): BacklogTreeNode[] => {
  const nodes = new Map<number, BacklogTreeNode>();

  items.forEach((item) => {
    nodes.set(item.id, { ...item, children: [] });
  });

  const roots: BacklogTreeNode[] = [];

  nodes.forEach((node) => {
    if ('parentId' in node && typeof node.parentId === 'number') {
      const parent = nodes.get(node.parentId);
      if (parent) {
        parent.children.push(node);
        return;
      }
    }
    roots.push(node);
  });

  return roots;
};

type LayoutNode = {
  node: BacklogTreeNode;
  depth: number;
  span: number;
  center: number; // in unit space
  children: LayoutNode[];
};

type PositionedNode = {
  node: BacklogTreeNode;
  x: number;
  y: number;
};

type LayoutResult = {
  nodes: PositionedNode[];
  edges: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }>;
  width: number;
  height: number;
};

const computeLayoutNode = (
  node: BacklogTreeNode,
  depth: number,
  offset: number
): LayoutNode => {
  let span = 0;
  const childrenLayouts = node.children.map((child) => {
    const layout = computeLayoutNode(child, depth + 1, offset + span);
    span += layout.span;
    return layout;
  });

  if (span === 0) {
    span = 1;
  }

  const center = offset + span / 2;

  return {
    node,
    depth,
    span,
    center,
    children: childrenLayouts,
  };
};

const createLayout = (roots: BacklogTreeNode[]): LayoutResult | null => {
  if (roots.length === 0) {
    return null;
  }

  const layoutRoots: LayoutNode[] = [];
  let offset = 0;

  roots.forEach((root, index) => {
    const layoutRoot = computeLayoutNode(root, 0, offset);
    layoutRoots.push(layoutRoot);
    offset += layoutRoot.span;
    if (index < roots.length - 1) {
      offset += ROOT_GAP_UNITS;
    }
  });

  const allLayouts: LayoutNode[] = [];
  const collectLayouts = (layoutNode: LayoutNode) => {
    allLayouts.push(layoutNode);
    layoutNode.children.forEach(collectLayouts);
  };
  layoutRoots.forEach(collectLayouts);

  const positionedNodes: PositionedNode[] = allLayouts.map((layoutNode) => ({
    node: layoutNode.node,
    x: layoutNode.center * HORIZONTAL_UNIT,
    y: layoutNode.depth * LEVEL_HEIGHT,
  }));

  const positionLookup = new Map<number, { x: number; y: number }>();
  positionedNodes.forEach((p) => {
    positionLookup.set(p.node.id, { x: p.x, y: p.y });
  });

  const edges: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }> = [];

  layoutRoots.forEach(function traverse(layoutNode) {
    layoutNode.children.forEach((child) => {
      const from = positionLookup.get(layoutNode.node.id);
      const to = positionLookup.get(child.node.id);
      if (from && to) {
        edges.push({ from, to });
      }
      traverse(child);
    });
  });

  const maxDepth = Math.max(...allLayouts.map((layoutNode) => layoutNode.depth));
  const width = Math.max(offset * HORIZONTAL_UNIT, CARD_WIDTH * 2);
  const height = (maxDepth + 1) * LEVEL_HEIGHT + CARD_HEIGHT;

  return {
    nodes: positionedNodes,
    edges,
    width,
    height,
  };
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

  const tree = buildBacklogTree(backlogItems);
  const layout = useMemo(() => createLayout(tree), [tree]);

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
    if (event.button !== 1) {
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
              }}
            >
              {layout ? (
                <Box
                  style={{
                    position: 'relative',
                    width: layout.width,
                    height: layout.height,
                  }}
                >
                  <svg
                    width={layout.width}
                    height={layout.height}
                    style={{ position: 'absolute', inset: 0 }}
                  >
                    <defs>
                      <marker
                        id="backlog-arrow"
                        markerWidth="7"
                        markerHeight="7"
                        refX="7"
                        refY="3.5"
                        orient="auto"
                      >
                        <path d="M 0 0 L 7 3.5 L 0 7 z" fill={connectorColor} />
                      </marker>
                    </defs>
                    {layout.edges.map((edge, index) => {
                      const startX = edge.from.x;
                      const startY = edge.from.y + CARD_HEIGHT;
                      const endX = edge.to.x;
                      const endY = edge.to.y;

                      const midY = (startY + endY) / 2;
                      const radius = 12;

                      let path = '';
                      if (Math.abs(startX - endX) < 1) {
                        path = `M ${startX} ${startY} L ${endX} ${endY}`;
                      } else {
                        const dirX = endX > startX ? 1 : -1;
                        const verticalSpace = midY - startY;
                        const horizontalSpace = Math.abs(endX - startX);
                        const r = Math.min(radius, verticalSpace / 2, horizontalSpace / 2);

                        path = `M ${startX} ${startY} L ${startX} ${midY - r} Q ${startX} ${midY} ${startX + dirX * r} ${midY} L ${endX - dirX * r} ${midY} Q ${endX} ${midY} ${endX} ${midY + r} L ${endX} ${endY}`;
                      }

                      return (
                        <path
                          key={`edge-${index}`}
                          d={path}
                          stroke={connectorColor}
                          strokeWidth={2}
                          fill="none"
                          markerEnd="url(#backlog-arrow)"
                        />
                      );
                    })}
                  </svg>

                  {layout.nodes.map((positioned) => (
                    <Box
                      key={positioned.node.id}
                      style={{
                        position: 'absolute',
                        left: positioned.x - CARD_WIDTH / 2,
                        top: positioned.y,
                      }}
                    >
                      <BacklogCard item={positioned.node} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Text c="dimmed">No backlog items to display</Text>
              )}
            </Box>
          </Box>
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
};

export default App;
