import type { Meta, StoryObj } from '@storybook/react';
import UserAvatar from './UserAvatar';

const meta = {
  title: 'Components/UserAvatar',
  component: UserAvatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A user avatar component that displays an image or falls back to initials.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'URL of the avatar image',
    },
    alt: {
      control: 'text',
      description: 'Alt text for the avatar image',
    },
    name: {
      control: 'text',
      description: 'User name for fallback initials',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Size of the avatar',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof UserAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'John Doe',
    size: 'md',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://picsum.photos/seed/user1/200/200.jpg',
    alt: 'John Doe avatar',
    name: 'John Doe',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    name: 'Jane Smith',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    name: 'Alice Johnson',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    name: 'Bob Wilson',
    size: 'xl',
  },
};

export const SingleLetterName: Story = {
  args: {
    name: 'A',
    size: 'md',
  },
};

export const LongName: Story = {
  args: {
    name: 'Christopher Alexander Montgomery',
    size: 'md',
  },
};

export const BrokenImage: Story = {
  args: {
    src: 'https://invalid-url.com/broken-image.jpg',
    alt: 'Broken image',
    name: 'Fallback User',
    size: 'md',
  },
};

export const AllSizes = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <UserAvatar name="Small" size="sm" />
        <span className="text-xs text-gray-400">sm</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <UserAvatar name="Medium" size="md" />
        <span className="text-xs text-gray-400">md</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <UserAvatar name="Large" size="lg" />
        <span className="text-xs text-gray-400">lg</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <UserAvatar name="Extra Large" size="xl" />
        <span className="text-xs text-gray-400">xl</span>
      </div>
    </div>
  ),
};

export const WithAndWithoutImages = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <UserAvatar
          src="https://picsum.photos/seed/user2/200/200.jpg"
          name="With Image"
          size="md"
        />
        <span className="text-xs text-gray-400">With Image</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <UserAvatar name="Without Image" size="md" />
        <span className="text-xs text-gray-400">Without Image</span>
      </div>
    </div>
  ),
};
