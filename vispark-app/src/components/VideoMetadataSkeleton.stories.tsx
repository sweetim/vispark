import type { Meta, StoryObj } from '@storybook/react';
import VideoMetadataSkeleton from './VideoMetadataSkeleton';

const meta = {
  title: 'Components/VideoMetadataSkeleton',
  component: VideoMetadataSkeleton,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A skeleton loading placeholder for video metadata cards, shown while video data is being fetched.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VideoMetadataSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Multiple = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <VideoMetadataSkeleton />
      <VideoMetadataSkeleton />
      <VideoMetadataSkeleton />
      <VideoMetadataSkeleton />
    </div>
  ),
};

export const InList = {
  render: () => (
    <div className="space-y-4">
      <VideoMetadataSkeleton />
      <VideoMetadataSkeleton />
      <VideoMetadataSkeleton />
    </div>
  ),
};
