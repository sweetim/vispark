import type { Meta, StoryObj } from '@storybook/react';
import Toast from './Toast';

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A toast notification component with different types (success, error, warning, info) and optional video navigation.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'The message to display in the toast',
    },
    type: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'The type of toast notification',
    },
    duration: {
      control: 'number',
      description: 'Duration in milliseconds before auto-close',
    },
    videoId: {
      control: 'text',
      description: 'Optional video ID for navigation',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when toast is closed',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-900 p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    message: 'Video processing completed successfully!',
    type: 'success',
    duration: 50000,
    onClose: () => {},
  },
};

export const Error: Story = {
  args: {
    message: 'Failed to process video. Please try again.',
    type: 'error',
    duration: 50000,
    onClose: () => {},
  },
};

export const Warning: Story = {
  args: {
    message: 'Video processing is taking longer than expected.',
    type: 'warning',
    duration: 50000,
    onClose: () => {},
  },
};

export const Info: Story = {
  args: {
    message: 'New video available in your subscriptions.',
    type: 'info',
    duration: 50000,
    onClose: () => {},
  },
};

export const WithVideoLink: Story = {
  args: {
    message: 'Video summary is ready!',
    type: 'success',
    duration: 50000,
    videoId: 'dQw4w9WgXcQ',
    videoMetadata: {
      title: 'Sample Video Title',
      channelTitle: 'Sample Channel',
      channelId: 'UCxxxxxx',
      thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg',
    },
    onClose: () => {},
  },
};

export const LongMessage: Story = {
  args: {
    message: 'This is a very long message that demonstrates how the toast component handles longer text content. It should wrap appropriately and maintain good readability.',
    type: 'info',
    duration: 50000,
    onClose: () => {},
  },
};

export const ShortDuration: Story = {
  args: {
    message: 'This toast will close quickly (2 seconds)',
    type: 'info',
    duration: 2000,
    onClose: () => {},
  },
};
