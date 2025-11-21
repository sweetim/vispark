import type { Meta, StoryObj } from '@storybook/react';
import ProgressTimeline from './ProgressTimeline';

const meta = {
  title: 'Components/ProgressTimeline',
  component: ProgressTimeline,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A progress timeline component showing the status of video processing steps (gathering transcripts and summarizing).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    step: {
      control: 'select',
      options: ['idle', 'gathering', 'summarizing', 'complete', 'error'],
      description: 'Current processing step',
    },
    errorStep: {
      control: 'select',
      options: [null, 'gathering', 'summarizing'],
      description: 'Which step encountered an error',
    },
    isSubmitting: {
      control: 'boolean',
      description: 'Whether the form is submitting',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  args: {
    step: 'idle',
    errorStep: null,
    isSubmitting: false,
    error: null,
  },
};

export const GatheringTranscripts: Story = {
  args: {
    step: 'gathering',
    errorStep: null,
    isSubmitting: true,
    error: null,
  },
};

export const Summarizing: Story = {
  args: {
    step: 'summarizing',
    errorStep: null,
    isSubmitting: true,
    error: null,
  },
};

export const Complete: Story = {
  args: {
    step: 'complete',
    errorStep: null,
    isSubmitting: true,
    error: null,
  },
};

export const GatheringError: Story = {
  args: {
    step: 'error',
    errorStep: 'gathering',
    isSubmitting: true,
    error: 'Failed to fetch video transcript. The video may not have captions available.',
  },
};

export const SummarizingError: Story = {
  args: {
    step: 'error',
    errorStep: 'summarizing',
    isSubmitting: true,
    error: 'Failed to generate summary. The AI service may be temporarily unavailable.',
  },
};

export const NetworkError: Story = {
  args: {
    step: 'error',
    errorStep: 'gathering',
    isSubmitting: true,
    error: 'Network connection failed. Please check your internet connection and try again.',
  },
};
