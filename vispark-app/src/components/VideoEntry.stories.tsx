import type { Meta, StoryObj } from '@storybook/react'
import VideoEntry, { type ChannelGroupEntry } from './VideoEntry'

const meta = {
  title: 'Components/VideoEntry',
  component: VideoEntry,
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
        <div className="w-full max-w-md">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof VideoEntry>

export default meta
type Story = StoryObj<typeof meta>

const mockEntry: ChannelGroupEntry = {
  id: '1',
  videoId: 'abc123',
  videoTitle: 'Sample Video Title That Is Quite Long',
  channelTitle: 'Test Channel',
  channelId: 'channel123',
  createdTime: '2023-01-01T00:00:00Z',
  thumbnailUrl: 'https://picsum.photos/seed/video1/320/180.jpg',
}

export const Default: Story = {
  args: {
    entry: mockEntry,
    processingVideoId: null,
    processingStatus: 'idle',
    onSelect: () => console.log('Video selected'),
  },
}

export const Processing: Story = {
  args: {
    entry: mockEntry,
    processingVideoId: 'abc123',
    processingStatus: 'gathering',
    onSelect: () => console.log('Video selected'),
  },
}

export const Summarizing: Story = {
  args: {
    entry: mockEntry,
    processingVideoId: 'abc123',
    processingStatus: 'summarizing',
    onSelect: () => console.log('Video selected'),
  },
}

export const OtherVideoProcessing: Story = {
  args: {
    entry: mockEntry,
    processingVideoId: 'other456',
    processingStatus: 'gathering',
    onSelect: () => console.log('Video selected'),
  },
}
