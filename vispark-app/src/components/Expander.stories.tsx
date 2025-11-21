import type { Meta, StoryObj } from '@storybook/react';
import Expander from './Expander';

const meta = {
  title: 'Components/Expander',
  component: Expander,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A collapsible/expandable container component with optional controlled state and summarizing indicator.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'The title displayed in the header',
    },
    defaultExpanded: {
      control: 'boolean',
      description: 'Initial expanded state (uncontrolled mode)',
    },
    isExpanded: {
      control: 'boolean',
      description: 'Controlled expanded state',
    },
    isSummarizing: {
      control: 'boolean',
      description: 'Shows summarizing indicator badge',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Expander>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleContent = (
  <div className="p-4 space-y-4">
    <p className="text-gray-300">
      This is the expandable content area. It can contain any React components or elements.
    </p>
    <ul className="list-disc list-inside text-gray-400 space-y-2">
      <li>Feature one: Advanced functionality</li>
      <li>Feature two: Improved performance</li>
      <li>Feature three: Better user experience</li>
    </ul>
  </div>
);

export const Collapsed: Story = {
  args: {
    title: 'Click to expand',
    defaultExpanded: false,
    children: sampleContent,
  },
};

export const Expanded: Story = {
  args: {
    title: 'Expanded by default',
    defaultExpanded: true,
    children: sampleContent,
  },
};

export const WithSummarizing: Story = {
  args: {
    title: 'Processing content',
    defaultExpanded: true,
    isSummarizing: true,
    children: sampleContent,
  },
};

export const LongTitle: Story = {
  args: {
    title: 'This is a very long title that demonstrates how the expander handles lengthy header text content',
    defaultExpanded: false,
    children: sampleContent,
  },
};

export const WithRichContent: Story = {
  args: {
    title: 'Video Summary',
    defaultExpanded: true,
    children: (
      <div className="p-4 space-y-4">
        <div className="glass-effect rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Key Points</h3>
          <ul className="space-y-2 text-gray-300">
            <li>🎯 Introduction to the main topic</li>
            <li>📊 Data analysis and findings</li>
            <li>💡 Practical applications</li>
            <li>🔮 Future implications</li>
          </ul>
        </div>
        <div className="glass-effect rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Timestamps</h3>
          <div className="space-y-1 text-sm text-gray-400">
            <div>0:00 - Introduction</div>
            <div>2:30 - Main content</div>
            <div>8:45 - Conclusion</div>
          </div>
        </div>
      </div>
    ),
  },
};

export const MultipleExpanders = {
  render: () => (
    <div className="space-y-4">
      <Expander title="Section 1: Introduction" defaultExpanded={true}>
        <div className="p-4 text-gray-300">
          Content for section 1
        </div>
      </Expander>
      <Expander title="Section 2: Details" defaultExpanded={false}>
        <div className="p-4 text-gray-300">
          Content for section 2
        </div>
      </Expander>
      <Expander title="Section 3: Summary" defaultExpanded={false} isSummarizing={true}>
        <div className="p-4 text-gray-300">
          Content for section 3 (currently being processed)
        </div>
      </Expander>
    </div>
  ),
};
