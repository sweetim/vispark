import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ProcessingIndicator from './ProcessingIndicator';

const meta = {
  title: 'Components/ProcessingIndicator',
  component: ProcessingIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A processing indicator component that shows when an operation is in progress.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isProcessing: {
      control: 'boolean',
      description: 'Whether the processing indicator should be shown',
    },
    text: {
      control: 'text',
      description: 'Text to display in the indicator',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the spinner',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof ProcessingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isProcessing: true,
    text: 'Processing...',
    size: 'sm',
  },
};

export const CustomText: Story = {
  args: {
    isProcessing: true,
    text: 'Uploading file...',
    size: 'sm',
  },
};

export const SmallSize: Story = {
  args: {
    isProcessing: true,
    text: 'Loading...',
    size: 'sm',
  },
};

export const MediumSize: Story = {
  args: {
    isProcessing: true,
    text: 'Processing...',
    size: 'md',
  },
};

export const LargeSize: Story = {
  args: {
    isProcessing: true,
    text: 'Generating report...',
    size: 'lg',
  },
};

export const NotProcessing: Story = {
  args: {
    isProcessing: false,
    text: 'This will not be visible',
    size: 'sm',
  },
};

export const WithCustomStyling: Story = {
  args: {
    isProcessing: true,
    text: 'Custom styled',
    size: 'sm',
    className: 'bg-purple-600/80 border-purple-400/30',
  },
};

export const LongText: Story = {
  args: {
    isProcessing: true,
    text: 'Processing large dataset, please wait...',
    size: 'sm',
  },
};

export const InteractiveExample = {
  render: () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingText, setProcessingText] = useState('Starting...');

    const startProcessing = () => {
      setIsProcessing(true);
      setProcessingText('Initializing...');

      setTimeout(() => setProcessingText('Connecting to server...'), 1000);
      setTimeout(() => setProcessingText('Uploading data...'), 2000);
      setTimeout(() => setProcessingText('Processing...'), 3000);
      setTimeout(() => setProcessingText('Finalizing...'), 4000);
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingText('Complete!');
      }, 5000);
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <ProcessingIndicator
          isProcessing={isProcessing}
          text={processingText}
          size="sm"
        />
        <button
          onClick={startProcessing}
          disabled={isProcessing}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Start Processing'}
        </button>
        {!isProcessing && processingText === 'Complete!' && (
          <p className="text-green-400">Operation completed successfully!</p>
        )}
      </div>
    );
  },
};

export const MultipleIndicators = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ProcessingIndicator isProcessing={true} text="Uploading..." size="sm" />
        <span className="text-gray-400">File upload</span>
      </div>
      <div className="flex items-center gap-2">
        <ProcessingIndicator isProcessing={true} text="Analyzing..." size="sm" />
        <span className="text-gray-400">Data analysis</span>
      </div>
      <div className="flex items-center gap-2">
        <ProcessingIndicator isProcessing={true} text="Generating..." size="sm" />
        <span className="text-gray-400">Report generation</span>
      </div>
    </div>
  ),
};

export const InContextExample = {
  render: () => (
    <div className="w-full max-w-md">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Video Processing</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Status</span>
            <ProcessingIndicator
              isProcessing={true}
              text="Processing..."
              size="sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-300">65%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            Estimated time remaining: 2 minutes
          </div>
        </div>
      </div>
    </div>
  ),
};
