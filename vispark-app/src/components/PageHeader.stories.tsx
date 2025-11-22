import type { Meta, StoryObj } from '@storybook/react';
import { BookOpenIcon, UsersIcon, ChartLineIcon, SparkleIcon } from '@phosphor-icons/react';
import PageHeader from './PageHeader';

const meta = {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A page header component with animated background, title, subtitle, and optional icon.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Main title text',
    },
    subtitle: {
      control: 'text',
      description: 'Subtitle text below the title',
    },
    icon: {
      control: 'select',
      options: ['none', 'BookOpen', 'Users', 'ChartLine', 'Sparkle'],
      mapping: {
        none: undefined,
        BookOpen: <BookOpenIcon size={40} className="text-indigo-400" />,
        Users: <UsersIcon size={40} className="text-purple-400" />,
        ChartLine: <ChartLineIcon size={40} className="text-green-400" />,
        Sparkle: <SparkleIcon size={40} className="text-yellow-400" />,
      },
      description: 'Icon to display next to title',
    },
    children: {
      control: 'text',
      description: 'Additional content to display on the right side',
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Welcome to Dashboard',
    subtitle: 'Manage your content and track your performance from one central location.',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Analytics Overview',
    subtitle: 'Track your performance metrics and gain insights into your audience engagement.',
    icon: <ChartLineIcon size={40} className="text-green-400" />,
  },
};

export const WithChildren: Story = {
  args: {
    title: 'User Management',
    subtitle: 'Manage user accounts, permissions, and access controls.',
    children: (
      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
        Add New User
      </button>
    ),
  },
};

export const WithIconAndChildren: Story = {
  args: {
    title: 'Content Library',
    subtitle: 'Browse, organize, and manage all your video content in one place.',
    icon: <BookOpenIcon size={40} className="text-indigo-400" />,
    children: (
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Upload Video
        </button>
        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
          Import
        </button>
      </div>
    ),
  },
};

export const LongTitle: Story = {
  args: {
    title: 'This is a Very Long Title That Demonstrates How Component Handles Extended Text Content',
    subtitle: 'This subtitle is also quite long and shows how layout adapts to accommodate more descriptive content while maintaining visual hierarchy.',
    icon: <SparkleIcon size={40} className="text-yellow-400" />,
  },
};

export const NoSubtitle: Story = {
  args: {
    title: 'Simple Header',
    icon: <UsersIcon size={40} className="text-purple-400" />,
  },
};

export const ShortTitle: Story = {
  args: {
    title: 'Settings',
    subtitle: 'Configure your application preferences and account settings.',
  },
};

export const DifferentIcons = {
  render: () => (
    <div className="space-y-8">
      <PageHeader
        title="Documentation"
        subtitle="Comprehensive guides and API references."
        icon={<BookOpenIcon size={40} className="text-indigo-400" />}
      />

      <PageHeader
        title="Team Members"
        subtitle="Manage your team and collaborate effectively."
        icon={<UsersIcon size={40} className="text-purple-400" />}
      />

      <PageHeader
        title="Performance Metrics"
        subtitle="Monitor key performance indicators and trends."
        icon={<ChartLineIcon size={40} className="text-green-400" />}
      />

      <PageHeader
        title="Features"
        subtitle="Explore latest features and improvements."
        icon={<SparkleIcon size={40} className="text-yellow-400" />}
      />
    </div>
  ),
};

export const WithActions = {
  render: () => (
    <div className="space-y-8">
      <PageHeader
        title="Video Management"
        subtitle="Upload, edit, and organize your video content."
        icon={<BookOpenIcon size={40} className="text-indigo-400" />}
      >
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Upload
          </button>
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            Import
          </button>
        </div>
      </PageHeader>

      <PageHeader
        title="Analytics Dashboard"
        subtitle="Track your performance and audience engagement."
        icon={<ChartLineIcon size={40} className="text-green-400" />}
      >
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            Schedule
          </button>
        </div>
      </PageHeader>
    </div>
  ),
};

export const ResponsiveExample = {
  render: () => (
    <PageHeader
      title="Responsive Design Example"
      subtitle="This header demonstrates how layout adapts to different screen sizes, with title and actions stacking appropriately on mobile devices."
      icon={<SparkleIcon size={40} className="text-yellow-400" />}
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Primary Action
        </button>
        <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
          Secondary Action
        </button>
      </div>
    </PageHeader>
  ),
};
