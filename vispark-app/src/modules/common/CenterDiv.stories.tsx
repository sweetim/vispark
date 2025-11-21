import type { Meta, StoryObj } from '@storybook/react';
import CenterDiv from './CenterDiv';

const meta = {
  title: 'Components/CenterDiv',
  component: CenterDiv,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A simple utility component for centering content both horizontally and vertically.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
  },
} satisfies Meta<typeof CenterDiv>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="glass-effect p-8 rounded-xl">
        <h3 className="text-white text-lg font-semibold mb-2">Centered Content</h3>
        <p className="text-gray-300">This content is perfectly centered both horizontally and vertically.</p>
      </div>
    ),
  },
};

export const WithCustomClass: Story = {
  args: {
    className: 'bg-gray-800 p-4',
    children: (
      <div className="text-center">
        <h3 className="text-white text-lg font-semibold mb-2">Custom Styling</h3>
        <p className="text-gray-300">This has additional background and padding.</p>
      </div>
    ),
  },
};

export const WithText: Story = {
  args: {
    children: (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Simple Text</h2>
        <p className="text-gray-400">Just some centered text content</p>
      </div>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <div className="text-center">
        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4 mx-auto">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-white font-medium">Icon Centered</p>
      </div>
    ),
  },
};

export const WithMultipleChildren: Story = {
  args: {
    children: [
      <div key="1" className="glass-effect p-4 rounded-lg mb-4">
        <h4 className="text-white font-medium">First Item</h4>
      </div>,
      <div key="2" className="glass-effect p-4 rounded-lg">
        <h4 className="text-white font-medium">Second Item</h4>
      </div>,
    ],
  },
};

export const Minimal: Story = {
  args: {
    children: <p className="text-white">Minimal centered text</p>,
  },
};

export const LargeContent: Story = {
  args: {
    children: (
      <div className="glass-effect p-12 rounded-xl max-w-2xl">
        <h2 className="text-3xl font-bold text-white mb-4">Large Centered Content</h2>
        <p className="text-gray-300 mb-6">
          This demonstrates how the CenterDiv component handles larger content areas while maintaining perfect centering.
          The component uses flexbox to ensure content is centered both horizontally and vertically within its container.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Feature 1</h3>
            <p className="text-gray-400 text-sm">Description of the first feature</p>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Feature 2</h3>
            <p className="text-gray-400 text-sm">Description of the second feature</p>
          </div>
        </div>
      </div>
    ),
  },
};
