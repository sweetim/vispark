import type { Meta, StoryObj } from '@storybook/react'
import ChannelGroup, { type ChannelGroupEntry } from './ChannelGroup'

const meta = {
  title: 'Components/ChannelGroup',
  component: ChannelGroup,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="w-full max-w-2xl">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof ChannelGroup>

export default meta
type Story = StoryObj<typeof meta>

const mockEntries: ChannelGroupEntry[] = [
  {
    id: '1',
    videoId: 'abc123',
    videoTitle: 'Sample Video 1',
    channelTitle: 'Test Channel',
    channelId: 'channel123',
    createdTime: '2023-01-01T00:00:00Z',
    thumbnailUrl: 'https://picsum.photos/seed/video1/320/180.jpg',
  },
  {
    id: '2',
    videoId: 'def456',
    videoTitle: 'Sample Video 2',
    channelTitle: 'Test Channel',
    channelId: 'channel123',
    createdTime: '2023-01-02T00:00:00Z',
    thumbnailUrl: 'https://picsum.photos/seed/video2/320/180.jpg',
  },
  {
    id: '3',
    videoId: 'ghi789',
    videoTitle: 'Sample Video 3',
    channelTitle: 'Test Channel',
    channelId: 'channel123',
    createdTime: '2023-01-03T00:00:00Z',
    thumbnailUrl: 'https://picsum.photos/seed/video3/320/180.jpg',
  },
]

export const Collapsed: Story = {
  args: {
    channelTitle: "Test Channel",
    channelId: "channel123",
    entries: mockEntries,
    accent: "from-indigo-500/40 via-purple-500/25 to-pink-500/30",
    expandedChannels: new Set<string>(),
    onToggleExpansion: (channelId) => console.log('Toggle expansion for:', channelId),
    processingVideoId: null,
    processingStatus: "idle",
  },
}

export const Expanded: Story = {
  args: {
    channelTitle: "Test Channel",
    channelId: "channel123",
    entries: mockEntries,
    accent: "from-indigo-500/40 via-purple-500/25 to-pink-500/30",
    expandedChannels: new Set(['channel123']),
    onToggleExpansion: (channelId) => console.log('Toggle expansion for:', channelId),
    processingVideoId: null,
    processingStatus: "idle",
  },
}

export const Processing: Story = {
  args: {
    channelTitle: "Test Channel",
    channelId: "channel123",
    entries: mockEntries,
    accent: "from-indigo-500/40 via-purple-500/25 to-pink-500/30",
    expandedChannels: new Set(['channel123']),
    onToggleExpansion: (channelId) => console.log('Toggle expansion for:', channelId),
    processingVideoId: "abc123",
    processingStatus: "gathering",
  },
}
