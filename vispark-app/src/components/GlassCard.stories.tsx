import type { Meta, StoryObj } from '@storybook/react';
import { UserIcon, GearIcon, HeartIcon } from '@phosphor-icons/react';
import GlassCard from './GlassCard';

const meta = {
  title: 'Components/GlassCard',
  component: GlassCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A glass morphism card component with customizable padding, header, and footer.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Content to display inside the card',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    header: {
      control: 'text',
      description: 'Header content',
    },
    footer: {
      control: 'text',
      description: 'Footer content',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Padding size for the card content',
    },
  },
} satisfies Meta<typeof GlassCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is the default glass card content with medium padding.',
    padding: 'md',
  },
};

export const WithHeader: Story = {
  args: {
    header: <div className="text-lg font-semibold text-white">Card Title</div>,
    children: 'This card has a header section with a title.',
    padding: 'md',
  },
};

export const WithFooter: Story = {
  args: {
    children: 'This card has a footer section with action buttons.',
    footer: (
      <div className="flex justify-end gap-2">
        <button className="px-3 py-1 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600">
          Cancel
        </button>
        <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">
          Save
        </button>
      </div>
    ),
    padding: 'md',
  },
};

export const WithHeaderAndFooter: Story = {
  args: {
    header: <div className="text-lg font-semibold text-white">Complete Card</div>,
    children: 'This card has both header and footer sections.',
    footer: (
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">Last updated: 2 hours ago</span>
        <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">
          Action
        </button>
      </div>
    ),
    padding: 'md',
  },
};

export const NoPadding: Story = {
  args: {
    children: (
      <div className="p-6">
        This card has no padding applied by the GlassCard component, but content has its own padding.
      </div>
    ),
    padding: 'none',
  },
};

export const SmallPadding: Story = {
  args: {
    children: 'This card uses small padding for more compact content.',
    padding: 'sm',
  },
};

export const LargePadding: Story = {
  args: {
    children: 'This card uses large padding for more spacious content layout.',
    padding: 'lg',
  },
};

export const WithComplexContent: Story = {
  args: {
    header: (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
          <UserIcon size={20} className="text-white" />
        </div>
        <div>
          <div className="text-lg font-semibold text-white">User Profile</div>
          <div className="text-sm text-gray-400">john.doe@example.com</div>
        </div>
      </div>
    ),
    children: (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Status</span>
          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">Active</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Member Since</span>
          <span className="text-white">January 2023</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Projects</span>
          <span className="text-white">12</span>
        </div>
      </div>
    ),
    footer: (
      <div className="flex justify-between">
        <button className="flex items-center gap-2 text-gray-300 hover:text-white">
          <GearIcon size={16} />
          <span className="text-sm">Settings</span>
        </button>
        <button className="flex items-center gap-2 text-red-400 hover:text-red-300">
          <HeartIcon size={16} />
          <span className="text-sm">Favorite</span>
        </button>
      </div>
    ),
    padding: 'md',
  },
};

export const MultipleCards = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
      <GlassCard header={<div className="text-white font-semibold">Analytics</div>}>
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-400">2,543</div>
          <div className="text-sm text-gray-400">Total Views</div>
        </div>
      </GlassCard>
      <GlassCard header={<div className="text-white font-semibold">Performance</div>}>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">98.5%</div>
          <div className="text-sm text-gray-400">Uptime</div>
        </div>
      </GlassCard>
      <GlassCard header={<div className="text-white font-semibold">Users</div>}>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">421</div>
          <div className="text-sm text-gray-400">Active Now</div>
        </div>
      </GlassCard>
    </div>
  ),
};

export const WithCustomStyling: Story = {
  args: {
    className: 'border-indigo-500/30 bg-indigo-500/5',
    header: <div className="text-lg font-semibold text-indigo-300">Custom Styled Card</div>,
    children: 'This card has custom styling with indigo accent colors.',
    padding: 'lg',
  },
};
