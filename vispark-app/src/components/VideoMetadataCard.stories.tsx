import type { Meta, StoryObj } from '@storybook/react';
import VideoMetadataCard from './VideoMetadataCard';

const meta = {
  title: 'Components/VideoMetadataCard',
  component: VideoMetadataCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A card component displaying video metadata with thumbnail, title, channel info, and various status indicators.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    metadata: {
      description: 'Video metadata object containing videoId, title, channelId, channelTitle, and thumbnails',
    },
    onClick: {
      action: 'clicked',
      description: 'Optional click handler for interactive cards',
    },
    isActive: {
      control: 'boolean',
      description: 'Whether the card is in active state',
    },
    createdTime: {
      control: 'text',
      description: 'ISO timestamp for relative time display',
    },
    isNewFromCallback: {
      control: 'boolean',
      description: 'Shows NEW badge for recently added videos',
    },
    isSummarizing: {
      control: 'boolean',
      description: 'Shows SUMMARIZING badge with animation',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VideoMetadataCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMetadata = {
  videoId: 'dQw4w9WgXcQ',
  title: 'Building Modern Web Applications with React and TypeScript',
  channelId: 'UCxxxxxx',
  channelTitle: 'Tech Tutorial Channel',
  thumbnails: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
};

export const Default: Story = {
  args: {
    metadata: sampleMetadata,
  },
};

export const WithClickHandler: Story = {
  args: {
    metadata: sampleMetadata,
    onClick: () => {},
  },
};

export const Active: Story = {
  args: {
    metadata: sampleMetadata,
    onClick: () => {},
    isActive: true,
  },
};

export const NewVideo: Story = {
  args: {
    metadata: sampleMetadata,
    onClick: () => {},
    isNewFromCallback: true,
    createdTime: new Date().toISOString(),
  },
};

export const Summarizing: Story = {
  args: {
    metadata: sampleMetadata,
    onClick: () => {},
    isSummarizing: true,
  },
};

export const NewAndSummarizing: Story = {
  args: {
    metadata: sampleMetadata,
    onClick: () => {},
    isNewFromCallback: true,
    isSummarizing: true,
    createdTime: new Date().toISOString(),
  },
};

export const WithRelativeTime: Story = {
  args: {
    metadata: sampleMetadata,
    onClick: () => {},
    createdTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
};

export const OlderVideo: Story = {
  args: {
    metadata: sampleMetadata,
    onClick: () => {},
    createdTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
};

export const LongTitle: Story = {
  args: {
    metadata: {
      ...sampleMetadata,
      title: 'This is a very long video title that demonstrates how the component handles lengthy text content and should truncate appropriately',
    },
    onClick: () => {},
  },
};

export const LongChannelName: Story = {
  args: {
    metadata: {
      ...sampleMetadata,
      channelTitle: 'This is a Very Long Channel Name That Tests Truncation',
    },
    onClick: () => {},
  },
};

export const WithHtmlEntities: Story = {
  args: {
    metadata: {
      ...sampleMetadata,
      title: 'React &amp; TypeScript: Building Apps with &quot;Modern&quot; Tools',
      channelTitle: 'Tech &amp; Code',
    },
    onClick: () => {},
  },
};

export const AsLink: Story = {
  args: {
    metadata: sampleMetadata,
    // No onClick - renders as anchor tag
  },
};

export const MultipleCards = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <VideoMetadataCard
        metadata={sampleMetadata}
        onClick={() => {}}
        isNewFromCallback={true}
        createdTime={new Date().toISOString()}
      />
      <VideoMetadataCard
        metadata={{
          ...sampleMetadata,
          videoId: 'abc123',
          title: 'Advanced React Patterns',
        }}
        onClick={() => {}}
        isSummarizing={true}
      />
      <VideoMetadataCard
        metadata={{
          ...sampleMetadata,
          videoId: 'xyz789',
          title: 'TypeScript Best Practices',
        }}
        onClick={() => {}}
        isActive={true}
      />
      <VideoMetadataCard
        metadata={{
          ...sampleMetadata,
          videoId: 'def456',
          title: 'Testing React Applications',
        }}
        onClick={() => {}}
      />
    </div>
  ),
};
