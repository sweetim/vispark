import type { Meta, StoryObj } from '@storybook/react';
import TranscriptView from './TranscriptView';

const meta = {
  title: 'Components/TranscriptView',
  component: TranscriptView,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A component for displaying video transcripts with proper formatting and glass morphism styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    transcript: {
      control: 'text',
      description: 'The transcript text to display',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TranscriptView>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTranscript = `Welcome to this tutorial on modern web development!

In today's video, we'll be covering:
1. Introduction to React hooks
2. State management patterns
3. Performance optimization techniques

Let's start with React hooks. Hooks revolutionized how we write React components by allowing us to use state and other React features without writing a class.

The most commonly used hooks are:
- useState: For managing component state
- useEffect: For side effects
- useContext: For consuming context
- useCallback: For memoizing functions
- useMemo: For memoizing expensive calculations

When using useState, remember that state updates are asynchronous. This means you shouldn't expect the state to be updated immediately after calling the setter function.

For example:
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(count + 1); // This doesn't update count immediately
  console.log(count); // This will still show the old value
};

That's why it's often better to use the functional form of setState when the new state depends on the previous state.

Now let's talk about useEffect...`;

export const Default: Story = {
  args: {
    transcript: sampleTranscript,
  },
};

export const Empty: Story = {
  args: {
    transcript: '',
  },
};

export const Null: Story = {
  args: {
    transcript: null as any,
  },
};

export const ShortTranscript: Story = {
  args: {
    transcript: 'This is a short transcript with just a few lines of text.',
  },
};

export const WithHtmlEntities: Story = {
  args: {
    transcript: 'This transcript contains "quoted text" and & ampersands that need to be properly decoded.',
  },
};

export const LongTranscript: Story = {
  args: {
    transcript: sampleTranscript + '\n\n' + sampleTranscript + '\n\n' + sampleTranscript,
  },
};

export const WithLineBreaks: Story = {
  args: {
    transcript: `Line 1
Line 2

Line 3 (after empty line)
Line 4`,
  },
};

export const WithSpecialCharacters: Story = {
  args: {
    transcript: 'Special characters: é à ü ñ 中文 العربية русский 日本語 한국어',
  },
};
