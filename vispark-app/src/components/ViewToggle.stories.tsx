import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ViewToggle from './ViewToggle';

const meta = {
  title: 'Components/ViewToggle',
  component: ViewToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A toggle component for switching between summary and transcript views with loading state support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    view: {
      control: 'select',
      options: ['summary', 'transcript'],
      description: 'Currently selected view',
    },
    hasSummary: {
      control: 'boolean',
      description: 'Whether summary is available',
    },
    hasTranscript: {
      control: 'boolean',
      description: 'Whether transcript is available',
    },
    isTranscriptLoading: {
      control: 'boolean',
      description: 'Shows loading spinner on transcript button',
    },
    onChange: {
      action: 'view-changed',
      description: 'Callback when view selection changes',
    },
  },
} satisfies Meta<typeof ViewToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SummarySelected: Story = {
  args: {
    view: 'summary',
    hasSummary: true,
    hasTranscript: true,
    isTranscriptLoading: false,
    onChange: () => {},
  },
};

export const TranscriptSelected: Story = {
  args: {
    view: 'transcript',
    hasSummary: true,
    hasTranscript: true,
    isTranscriptLoading: false,
    onChange: () => {},
  },
};

export const TranscriptLoading: Story = {
  args: {
    view: 'transcript',
    hasSummary: true,
    hasTranscript: true,
    isTranscriptLoading: true,
    onChange: () => {},
  },
};

export const SummaryDisabled: Story = {
  args: {
    view: 'transcript',
    hasSummary: false,
    hasTranscript: true,
    isTranscriptLoading: false,
    onChange: () => {},
  },
};

export const TranscriptDisabled: Story = {
  args: {
    view: 'summary',
    hasSummary: true,
    hasTranscript: false,
    isTranscriptLoading: false,
    onChange: () => {},
  },
};

export const BothDisabled: Story = {
  args: {
    view: 'summary',
    hasSummary: false,
    hasTranscript: false,
    isTranscriptLoading: false,
    onChange: () => {},
  },
};

export const Interactive = {
  render: () => {
    const [view, setView] = useState<'summary' | 'transcript'>('summary');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (newView: 'summary' | 'transcript') => {
      setView(newView);
      if (newView === 'transcript') {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
      }
    };

    return (
      <div className="space-y-4">
        <ViewToggle
          view={view}
          hasSummary={true}
          hasTranscript={true}
          isTranscriptLoading={isLoading}
          onChange={handleChange}
        />
        <p className="text-sm text-gray-400 text-center">
          Current view: {view}
          {isLoading && ' (Loading...)'}
        </p>
      </div>
    );
  },
};
