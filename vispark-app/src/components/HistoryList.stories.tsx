import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import HistoryList from './HistoryList';
import type { VideosSavedItem } from '@/hooks/useVisparks';

const meta = {
  title: 'Components/HistoryList',
  component: HistoryList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A history list component displaying saved videos with metadata cards and processing states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of saved video items to display',
    },
    onSelect: {
      action: 'video-selected',
      description: 'Callback function when a video is selected',
    },
    emptyMessage: {
      control: 'text',
      description: 'Message to display when no items are available',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HistoryList>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for stories
const mockItems: VideosSavedItem[] = [
  {
    id: '1',
    createdTime: '2023-01-01T00:00:00Z',
    publishedAt: '2023-01-01T00:00:00Z',
    metadata: {
      videoId: 'abc123',
      title: 'React Tutorial for Beginners',
      channelId: 'channel123',
      channelTitle: 'Tech Education',
      thumbnails: 'https://i.ytimg.com/vi/abc123/maxresdefault.jpg',
    },
    summaries: 'This is a comprehensive React tutorial covering the basics...',
    isNewFromCallback: false,
  },
  {
    id: '2',
    createdTime: '2023-01-02T00:00:00Z',
    publishedAt: '2023-01-02T00:00:00Z',
    metadata: {
      videoId: 'def456',
      title: 'Advanced TypeScript Patterns',
      channelId: 'channel456',
      channelTitle: 'Programming Masters',
      thumbnails: 'https://i.ytimg.com/vi/def456/maxresdefault.jpg',
    },
    summaries: 'Deep dive into TypeScript advanced patterns...',
    isNewFromCallback: true,
  },
  {
    id: '3',
    createdTime: '2023-01-03T00:00:00Z',
    publishedAt: '2023-01-03T00:00:00Z',
    metadata: {
      videoId: 'ghi789',
      title: 'Building Modern Web Apps',
      channelId: 'channel789',
      channelTitle: 'Web Development Hub',
      thumbnails: 'https://i.ytimg.com/vi/ghi789/maxresdefault.jpg',
    },
    summaries: 'Learn how to build modern web applications...',
    isNewFromCallback: false,
  },
];

export const Default: Story = {
  args: {
    items: mockItems,
    onSelect: (videoId: string) => console.log('Video selected:', videoId),
  },
};

export const Empty: Story = {
  args: {
    items: [],
    onSelect: (videoId: string) => console.log('Video selected:', videoId),
    emptyMessage: 'No videos found. Start searching to build your history!',
  },
};

export const CustomEmptyMessage: Story = {
  args: {
    items: [],
    onSelect: (videoId: string) => console.log('Video selected:', videoId),
    emptyMessage: 'Your video library is empty. Search for videos to get started!',
  },
};

export const SingleItem: Story = {
  args: {
    items: [mockItems[0]],
    onSelect: (videoId: string) => console.log('Video selected:', videoId),
  },
};

export const WithNewItems: Story = {
  args: {
    items: mockItems.map(item => ({ ...item, isNewFromCallback: true })),
    onSelect: (videoId: string) => console.log('Video selected:', videoId),
  },
};

export const LongTitles: Story = {
  args: {
    items: [
      {
        id: '1',
        createdTime: '2023-01-01T00:00:00Z',
        publishedAt: '2023-01-01T00:00:00Z',
        metadata: {
          videoId: 'long1',
          title: 'This is a Very Long Video Title That Demonstrates How the Component Handles Extended Text Content Without Breaking the Layout',
          channelId: 'channel1',
          channelTitle: 'Channel with Extremely Long Name For Testing Purposes',
          thumbnails: 'https://i.ytimg.com/vi/long1/maxresdefault.jpg',
        },
        summaries: 'Summary content here...',
        isNewFromCallback: false,
      },
      {
        id: '2',
        createdTime: '2023-01-02T00:00:00Z',
        publishedAt: '2023-01-02T00:00:00Z',
        metadata: {
          videoId: 'long2',
          title: 'Another Extremely Long Video Title That Tests the Component Ability to Handle Lengthy Content While Maintaining Good Visual Hierarchy',
          channelId: 'channel2',
          channelTitle: 'Another Channel with a Very Long Name for Testing Truncation Behavior',
          thumbnails: 'https://i.ytimg.com/vi/long2/maxresdefault.jpg',
        },
        summaries: 'Another summary here...',
        isNewFromCallback: true,
      },
    ],
    onSelect: (videoId: string) => console.log('Video selected:', videoId),
  },
};

export const InteractiveExample = {
  render: () => {
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

    const handleVideoSelect = (videoId: string) => {
      setSelectedVideoId(videoId);
      console.log('Video selected:', videoId);
    };

    return (
      <div className="space-y-4">
        <HistoryList
          items={mockItems}
          onSelect={handleVideoSelect}
        />

        {selectedVideoId && (
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-white text-sm">
              Selected video ID: <span className="font-mono bg-indigo-600 px-2 py-1 rounded">{selectedVideoId}</span>
            </p>
            <button
              onClick={() => setSelectedVideoId(null)}
              className="mt-2 px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>
    );
  },
};

export const WithProcessingState = {
  render: () => {
    // Mock the video store to simulate processing state
    const MockProcessingWrapper = () => {
      return (
        <div className="space-y-4">
          <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-300 text-sm">
              <strong>Mock Processing State:</strong> Video 'def456' is currently gathering transcripts.
            </p>
          </div>

          <HistoryList
            items={mockItems}
            onSelect={(videoId: string) => console.log('Video selected:', videoId)}
          />
        </div>
      );
    };

    return <MockProcessingWrapper />;
  },
};
