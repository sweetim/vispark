import type { Meta, StoryObj } from '@storybook/react';
import StatsCard from './StatsCard';

const meta = {
  title: 'Components/StatsCard',
  component: StatsCard,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0f172a' },
      ],
    },
    docs: {
      description: {
        component: 'A card component for displaying statistics with customizable content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Title of the stats card',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof StatsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Total Views',
    children: <div className="text-3xl font-bold text-indigo-400">1,234</div>,
  },
};

export const WithPercentage: Story = {
  args: {
    title: 'Conversion Rate',
    children: (
      <div className="text-center">
        <div className="text-3xl font-bold text-green-400">24.5%</div>
        <div className="text-sm text-gray-400 mt-1">+2.3% from last month</div>
      </div>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Active Users',
    children: (
      <div className="flex flex-col items-center">
        <div className="text-3xl font-bold text-indigo-400">842</div>
        <div className="text-sm text-gray-400 mt-1">Currently online</div>
      </div>
    ),
  },
};

export const WithTrend: Story = {
  args: {
    title: 'Revenue',
    children: (
      <div className="text-center">
        <div className="text-3xl font-bold text-green-400">$12,345</div>
        <div className="text-sm text-green-400 mt-1">↑ 12% increase</div>
      </div>
    ),
  },
};

export const WithChart: Story = {
  args: {
    title: 'Performance',
    children: (
      <div className="flex justify-center items-center h-20">
        <div className="flex items-end gap-1">
          <div className="w-2 bg-indigo-400 h-8"></div>
          <div className="w-2 bg-indigo-400 h-12"></div>
          <div className="w-2 bg-indigo-400 h-6"></div>
          <div className="w-2 bg-indigo-400 h-16"></div>
          <div className="w-2 bg-indigo-400 h-10"></div>
          <div className="w-2 bg-indigo-400 h-14"></div>
        </div>
      </div>
    ),
  },
};

export const WithProgress: Story = {
  args: {
    title: 'Storage Used',
    children: (
      <div className="w-full">
        <div className="text-2xl font-bold text-indigo-400 mb-2">68%</div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-indigo-400 h-2 rounded-full" style={{ width: '68%' }}></div>
        </div>
        <div className="text-sm text-gray-400 mt-1">6.8GB of 10GB</div>
      </div>
    ),
  },
};

export const MultipleCards = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard title="Total Users">
        <div className="text-3xl font-bold text-indigo-400">2,543</div>
      </StatsCard>
      <StatsCard title="Active Sessions">
        <div className="text-3xl font-bold text-green-400">421</div>
      </StatsCard>
      <StatsCard title="Bounce Rate">
        <div className="text-3xl font-bold text-red-400">32.1%</div>
      </StatsCard>
    </div>
  ),
};

export const ComplexCard: Story = {
  args: {
    title: 'Monthly Analytics',
    children: (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Page Views</span>
          <span className="font-semibold">45.2K</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Unique Visitors</span>
          <span className="font-semibold">12.8K</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Avg. Duration</span>
          <span className="font-semibold">3:42</span>
        </div>
      </div>
    ),
  },
};
