import type { Meta, StoryObj } from '@storybook/react';
import CountBadge from './CountBadge';

const meta = {
  title: 'Components/CountBadge',
  component: CountBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A badge component to display counts with different color variants and optional custom content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    count: {
      control: 'number',
      description: 'The count number to display',
    },
    variant: {
      control: 'select',
      options: ['indigo', 'green', 'gray'],
      description: 'The color variant of the badge',
    },
    children: {
      control: 'text',
      description: 'Optional custom content to override the count',
    },
  },
} satisfies Meta<typeof CountBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Indigo: Story = {
  args: {
    count: 42,
    variant: 'indigo',
  },
};

export const Green: Story = {
  args: {
    count: 15,
    variant: 'green',
  },
};

export const Gray: Story = {
  args: {
    count: 8,
    variant: 'gray',
  },
};

export const WithCustomContent: Story = {
  args: {
    count: 0,
    variant: 'indigo',
    children: 'New',
  },
};

export const LargeCount: Story = {
  args: {
    count: 999,
    variant: 'indigo',
  },
};

export const Zero: Story = {
  args: {
    count: 0,
    variant: 'gray',
  },
};
