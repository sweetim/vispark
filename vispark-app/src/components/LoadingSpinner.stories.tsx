import type { Meta, StoryObj } from '@storybook/react';
import LoadingSpinner from './LoadingSpinner';

const meta = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A loading spinner component with customizable size and color.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the spinner',
    },
    color: {
      control: 'select',
      options: ['white', 'indigo', 'gray', 'green', 'red'],
      description: 'Color of the spinner',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'md',
    color: 'white',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    color: 'white',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    color: 'white',
  },
};

export const White: Story = {
  args: {
    size: 'md',
    color: 'white',
  },
};

export const Indigo: Story = {
  args: {
    size: 'md',
    color: 'indigo',
  },
};

export const Gray: Story = {
  args: {
    size: 'md',
    color: 'gray',
  },
};

export const Green: Story = {
  args: {
    size: 'md',
    color: 'green',
  },
};

export const Red: Story = {
  args: {
    size: 'md',
    color: 'red',
  },
};

export const AllVariants = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4 items-center">
        <LoadingSpinner size="sm" color="white" />
        <span className="text-white">Small White</span>
      </div>
      <div className="flex gap-4 items-center">
        <LoadingSpinner size="md" color="indigo" />
        <span className="text-white">Medium Indigo</span>
      </div>
      <div className="flex gap-4 items-center">
        <LoadingSpinner size="lg" color="green" />
        <span className="text-white">Large Green</span>
      </div>
      <div className="flex gap-4 items-center">
        <LoadingSpinner size="md" color="red" />
        <span className="text-white">Medium Red</span>
      </div>
    </div>
  ),
};
