import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ChannelList from './ChannelList';

// Mock data for stories
const mockChannels = [
  {
    channelId: 'channel1',
    channelTitle: 'Tech Tutorial Channel',
    channelThumbnailUrl: 'https://picsum.photos/seed/channel1/200/200.jpg',
  },
  {
    channelId: 'channel2',
    channelTitle: 'Design Masters',
    channelThumbnailUrl: 'https://picsum.photos/seed/channel2/200/200.jpg',
  },
  {
    channelId: 'channel3',
    channelTitle: 'Coding Academy',
    channelThumbnailUrl: 'https://picsum.photos/seed/channel3/200/200.jpg',
  },
];

const mockChannelsWithoutThumbnail = [
  {
    channelId: 'channel4',
    channelTitle: 'No Thumbnail Channel',
    channelThumbnailUrl: '',
  },
  {
    channelId: 'channel5',
    channelTitle: 'Another Channel',
    channelThumbnailUrl: '',
  },
];

const meta = {
  title: 'Components/ChannelList',
  component: ChannelList,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0f172a' },
      ],
    },
    docs: {
      description: {
        component: 'A channel list component displaying channel information with subscription toggle functionality.',
      },
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
} satisfies Meta<typeof ChannelList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: mockChannels,
    emptyMessage: 'No channels found.',
  },
};

export const Empty: Story = {
  args: {
    items: [],
    emptyMessage: 'No channels found.',
  },
};

export const CustomEmptyMessage: Story = {
  args: {
    items: [],
    emptyMessage: 'Try searching for channels to see results here.',
  },
};

export const WithoutThumbnails: Story = {
  args: {
    items: mockChannelsWithoutThumbnail,
    emptyMessage: 'No channels found.',
  },
};

export const MixedChannels: Story = {
  args: {
    items: [...mockChannels, ...mockChannelsWithoutThumbnail],
    emptyMessage: 'No channels found.',
  },
};

export const LongChannelNames: Story = {
  args: {
    items: [
      {
        channelId: 'long1',
        channelTitle: 'This is a Very Long Channel Name That Tests Truncation',
        channelThumbnailUrl: 'https://picsum.photos/seed/long1/200/200.jpg',
      },
      {
        channelId: 'long2',
        channelTitle: 'Another Extremely Long Channel Name For Testing Display',
        channelThumbnailUrl: 'https://picsum.photos/seed/long2/200/200.jpg',
      },
    ],
    emptyMessage: 'No channels found.',
  },
};

export const SingleChannel: Story = {
  args: {
    items: [mockChannels[0]],
    emptyMessage: 'No channels found.',
  },
};

export const ManyChannels: Story = {
  args: {
    items: [
      ...mockChannels,
      ...mockChannelsWithoutThumbnail,
      {
        channelId: 'channel6',
        channelTitle: 'Extra Channel 1',
        channelThumbnailUrl: 'https://picsum.photos/seed/channel6/200/200.jpg',
      },
      {
        channelId: 'channel7',
        channelTitle: 'Extra Channel 2',
        channelThumbnailUrl: 'https://picsum.photos/seed/channel7/200/200.jpg',
      },
    ],
    emptyMessage: 'No channels found.',
  },
};

export const InteractiveExample = {
  render: () => {
    const [items, setItems] = useState(mockChannels);
    const [showEmpty, setShowEmpty] = useState(false);

    const toggleEmpty = () => {
      setShowEmpty(!showEmpty);
    };

    const addChannel = () => {
      const newChannel = {
        channelId: `channel${Date.now()}`,
        channelTitle: `New Channel ${Date.now()}`,
        channelThumbnailUrl: `https://picsum.photos/seed/new${Date.now()}/200/200.jpg`,
      };
      setItems(prev => [...prev, newChannel]);
    };

    const removeChannel = () => {
      setItems(prev => prev.slice(0, -1));
    };

    return (
      <div className="space-y-6">
        <div className="flex gap-4 justify-center">
          <button
            onClick={toggleEmpty}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {showEmpty ? 'Show Channels' : 'Show Empty'}
          </button>
          <button
            onClick={addChannel}
            disabled={showEmpty}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Channel
          </button>
          <button
            onClick={removeChannel}
            disabled={showEmpty || items.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Remove Channel
          </button>
        </div>

        <ChannelList
          items={showEmpty ? [] : items}
          emptyMessage="No channels found. Try adjusting your search criteria."
        />

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-white font-semibold mb-2">Interactive Controls</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• Click "Show Empty" to see empty state</p>
            <p>• Click "Add Channel" to add a new channel</p>
            <p>• Click "Remove Channel" to remove the last channel</p>
            <p>• Current channels: {items.length}</p>
          </div>
        </div>
      </div>
    );
  },
};

export const WithBrokenImages: Story = {
  args: {
    items: [
      {
        channelId: 'broken1',
        channelTitle: 'Broken Image 1',
        channelThumbnailUrl: 'https://invalid-url.com/broken1.jpg',
      },
      {
        channelId: 'broken2',
        channelTitle: 'Broken Image 2',
        channelThumbnailUrl: 'https://invalid-url.com/broken2.jpg',
      },
      {
        channelId: 'working',
        channelTitle: 'Working Image',
        channelThumbnailUrl: 'https://picsum.photos/seed/working/200/200.jpg',
      },
    ],
    emptyMessage: 'No channels found.',
  },
};
