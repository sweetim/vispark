import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import SearchForm from './SearchForm';

const meta = {
  title: 'Components/SearchForm',
  component: SearchForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A search form component with input field and submit button.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: 'text',
      description: 'Current search value',
    },
    onChange: {
      action: 'changed',
      description: 'Callback when search value changes',
    },
    onSubmit: {
      action: 'submitted',
      description: 'Callback when form is submitted',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for search input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the search form is disabled',
    },
  },
} satisfies Meta<typeof SearchForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '',
    onChange: (value: string) => console.log('Search changed:', value),
    onSubmit: (value: string) => console.log('Search submitted:', value),
    placeholder: 'Search videos...',
    disabled: false,
  },
};

export const WithValue: Story = {
  args: {
    value: 'React tutorial',
    onChange: (value: string) => console.log('Search changed:', value),
    onSubmit: (value: string) => console.log('Search submitted:', value),
    placeholder: 'Search videos...',
    disabled: false,
  },
};

export const CustomPlaceholder: Story = {
  args: {
    value: '',
    onChange: (value: string) => console.log('Search changed:', value),
    onSubmit: (value: string) => console.log('Search submitted:', value),
    placeholder: 'Search for channels, videos, or users...',
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    value: 'Cannot search',
    onChange: (value: string) => console.log('Search changed:', value),
    onSubmit: (value: string) => console.log('Search submitted:', value),
    placeholder: 'Search videos...',
    disabled: true,
  },
};

export const EmptyValue: Story = {
  args: {
    value: '',
    onChange: (value: string) => console.log('Search changed:', value),
    onSubmit: (value: string) => console.log('Search submitted:', value),
    placeholder: 'What are you looking for?',
    disabled: false,
  },
};

export const LongValue: Story = {
  args: {
    value: 'This is a very long search query that demonstrates how the input handles extended text content',
    onChange: (value: string) => console.log('Search changed:', value),
    onSubmit: (value: string) => console.log('Search submitted:', value),
    placeholder: 'Search videos...',
    disabled: false,
  },
};

export const InteractiveExample = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    const handleChange = (value: string) => {
      setSearchValue(value);
      console.log('Search changed:', value);
    };

    const handleSubmit = (value: string) => {
      if (value.trim()) {
        setSearchHistory(prev => [value, ...prev.slice(0, 4)]);
        console.log('Search submitted:', value);
        alert(`Searching for: ${value}`);
      }
    };

    const toggleDisabled = () => {
      setIsDisabled(!isDisabled);
    };

    return (
      <div className="w-full max-w-2xl space-y-6">
        <SearchForm
          value={searchValue}
          onChange={handleChange}
          onSubmit={handleSubmit}
          placeholder="Search for videos, channels, or topics..."
          disabled={isDisabled}
        />

        <div className="flex justify-between items-center">
          <button
            onClick={toggleDisabled}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {isDisabled ? 'Enable Search' : 'Disable Search'}
          </button>

          <div className="text-sm text-gray-400">
            Current value: "{searchValue}"
          </div>
        </div>

        {searchHistory.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Recent Searches</h3>
            <div className="space-y-1">
              {searchHistory.map((search, index) => (
                <div key={index} className="text-sm text-gray-400">
                  {index + 1}. {search}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
};

export const InContext = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');

    return (
      <div className="w-full max-w-4xl">
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Video Search</h2>
            <p className="text-gray-400 text-sm mb-4">
              Search through our extensive library of videos and find exactly what you're looking for.
            </p>
            <SearchForm
              value={searchValue}
              onChange={setSearchValue}
              onSubmit={(value) => alert(`Searching for: ${value}`)}
              placeholder="Enter keywords, topics, or video titles..."
            />
          </div>

          <div className="p-6">
            <h3 className="text-lg font-medium text-white mb-3">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {['React Tutorial', 'Web Development', 'Machine Learning', 'Design Patterns', 'JavaScript'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchValue(term)}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const MultipleVariants = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Default Search</h3>
        <SearchForm
          value=""
          onChange={(value) => console.log('Default search:', value)}
          onSubmit={(value) => console.log('Default submitted:', value)}
          placeholder="Search..."
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Video Search</h3>
        <SearchForm
          value=""
          onChange={(value) => console.log('Video search:', value)}
          onSubmit={(value) => console.log('Video submitted:', value)}
          placeholder="Search videos by title or description..."
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Channel Search</h3>
        <SearchForm
          value=""
          onChange={(value) => console.log('Channel search:', value)}
          onSubmit={(value) => console.log('Channel submitted:', value)}
          placeholder="Find channels by name..."
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Disabled Search</h3>
        <SearchForm
          value="Search is disabled"
          onChange={(value) => console.log('Disabled search:', value)}
          onSubmit={(value) => console.log('Disabled submitted:', value)}
          placeholder="Cannot search right now..."
          disabled={true}
        />
      </div>
    </div>
  ),
};

export const WithSuggestions = {
  render: () => {
    const [searchValue, setSearchValue] = useState('');
    const suggestions = [
      'React hooks tutorial',
      'TypeScript basics',
      'CSS grid layout',
      'Node.js API',
      'Vue.js components'
    ];

    return (
      <div className="w-full max-w-2xl space-y-4">
        <SearchForm
          value={searchValue}
          onChange={setSearchValue}
          onSubmit={(value) => alert(`Searching for: ${value}`)}
          placeholder="Type to search or select a suggestion..."
        />

        {searchValue.length > 0 && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Suggestions</h4>
            <div className="space-y-2">
              {suggestions
                .filter(suggestion =>
                  suggestion.toLowerCase().includes(searchValue.toLowerCase())
                )
                .slice(0, 3)
                .map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchValue(suggestion)}
                    className="w-full text-left text-sm text-gray-400 hover:text-white transition-colors p-2 rounded hover:bg-gray-700"
                  >
                    {suggestion}
                  </button>
                ))
              }
            </div>
          </div>
        )}
      </div>
    );
  },
};
