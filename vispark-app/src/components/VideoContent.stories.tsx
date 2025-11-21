import type { Meta, StoryObj } from '@storybook/react';
import VideoContent from './VideoContent';

const meta = {
  title: 'Components/VideoContent',
  component: VideoContent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A comprehensive content display component that handles summary, transcript, loading, and error states with beautiful animations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    view: {
      control: 'select',
      options: ['summary', 'transcript'],
      description: 'Current view mode',
    },
    hasSummary: {
      control: 'boolean',
      description: 'Whether summary is available',
    },
    hasTranscript: {
      control: 'boolean',
      description: 'Whether transcript is available',
    },
    summary: {
      control: 'text',
      description: 'The summary content',
    },
    streamingSummary: {
      control: 'text',
      description: 'Currently streaming summary content',
    },
    transcript: {
      control: 'text',
      description: 'The transcript content',
    },
    isGenerating: {
      control: 'boolean',
      description: 'Whether summary is currently being generated',
    },
    loading: {
      control: 'boolean',
      description: 'Whether content is loading',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VideoContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleSummary = `# Key Takeaways

## 🎯 Main Points
- React hooks revolutionized component development
- State management patterns are crucial for scalable applications
- Performance optimization requires understanding of React internals

## 📋 Detailed Summary

### Introduction to React Hooks
Hooks allow functional components to use state and other React features without writing a class. The most commonly used hooks are:

- **useState**: For managing component state
- **useEffect**: For handling side effects
- **useContext**: For consuming context values
- **useCallback**: For memoizing functions
- **useMemo**: For memoizing expensive calculations

### Best Practices
1. Always use the functional form of setState when new state depends on previous state
2. Use useCallback to prevent unnecessary re-renders
3. Implement proper cleanup in useEffect
4. Consider using custom hooks for complex logic

## 🔧 Practical Applications
These concepts are essential for building modern, efficient React applications that scale well and maintain good performance.`;

const sampleTranscript = `Welcome to this comprehensive tutorial on React hooks and state management!

In today's video, we'll explore the fundamental concepts that every React developer should master.

[00:00] Introduction
React hooks were introduced in React 16.8 as a way to use state and other React features in functional components without writing a class.

[00:30] useState Hook
The useState hook is the most basic hook that lets you add React state to functional components.

[01:15] useEffect Hook
The useEffect hook lets you perform side effects in functional components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount in React classes.

[02:45] State Management Patterns
When building larger applications, you'll need more sophisticated state management solutions like Redux, Zustand, or React Context.

[04:20] Performance Optimization
Learn about useCallback, useMemo, and React.memo to optimize your React applications for better performance.`;

export const SummaryView: Story = {
  args: {
    view: 'summary',
    hasSummary: true,
    hasTranscript: true,
    summary: sampleSummary,
    streamingSummary: '',
    transcript: sampleTranscript,
    isGenerating: false,
    loading: false,
    error: null,
  },
};

export const TranscriptView: Story = {
  args: {
    view: 'transcript',
    hasSummary: true,
    hasTranscript: true,
    summary: sampleSummary,
    streamingSummary: '',
    transcript: sampleTranscript,
    isGenerating: false,
    loading: false,
    error: null,
  },
};

export const GeneratingSummary: Story = {
  args: {
    view: 'summary',
    hasSummary: false,
    hasTranscript: false,
    summary: null,
    streamingSummary: '',
    transcript: '',
    isGenerating: true,
    loading: false,
    error: null,
  },
};

export const StreamingSummary: Story = {
  args: {
    view: 'summary',
    hasSummary: false,
    hasTranscript: false,
    summary: null,
    streamingSummary: '# Key Takeaways\n\n## 🎯 Main Points\n- React hooks revolutionized',
    transcript: '',
    isGenerating: false,
    loading: false,
    error: null,
  },
};

export const LoadingState: Story = {
  args: {
    view: 'summary',
    hasSummary: false,
    hasTranscript: false,
    summary: null,
    streamingSummary: '',
    transcript: '',
    isGenerating: false,
    loading: true,
    error: null,
  },
};

export const ErrorState: Story = {
  args: {
    view: 'summary',
    hasSummary: false,
    hasTranscript: false,
    summary: null,
    streamingSummary: '',
    transcript: '',
    isGenerating: false,
    loading: false,
    error: 'Failed to load content. The video may not be available or there might be a network issue.',
  },
};

export const NoContentAvailable: Story = {
  args: {
    view: 'summary',
    hasSummary: false,
    hasTranscript: false,
    summary: null,
    streamingSummary: '',
    transcript: '',
    isGenerating: false,
    loading: false,
    error: null,
  },
};

export const SummaryOnly: Story = {
  args: {
    view: 'summary',
    hasSummary: true,
    hasTranscript: false,
    summary: sampleSummary,
    streamingSummary: '',
    transcript: '',
    isGenerating: false,
    loading: false,
    error: null,
  },
};

export const TranscriptOnly: Story = {
  args: {
    view: 'transcript',
    hasSummary: false,
    hasTranscript: true,
    summary: null,
    streamingSummary: '',
    transcript: sampleTranscript,
    isGenerating: false,
    loading: false,
    error: null,
  },
};

export const LongContent: Story = {
  args: {
    view: 'summary',
    hasSummary: true,
    hasTranscript: true,
    summary: sampleSummary + '\n\n' + sampleSummary,
    streamingSummary: '',
    transcript: sampleTranscript + '\n\n' + sampleTranscript,
    isGenerating: false,
    loading: false,
    error: null,
  },
};
