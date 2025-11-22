import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import VirtualizedGrid from './VirtualizedGrid';

const meta = {
  title: 'Components/VirtualizedGrid',
  component: VirtualizedGrid,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A virtualized grid component for efficiently displaying large lists of video items.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of video items to display',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the grid is in loading state',
    },
    isLoadingMore: {
      control: 'boolean',
      description: 'Whether more items are being loaded',
    },
    loadMoreRows: {
      action: 'loadMore',
      description: 'Function to load more items',
    },
    rowCount: {
      control: 'number',
      description: 'Total number of rows available',
    },
    scrollElement: {
      control: 'text',
      description: 'Scroll element reference',
    },
    emptyMessage: {
      control: 'text',
      description: 'Message to display when no items',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message to display',
    },
    error: {
      control: 'object',
      description: 'Error object',
    },
    onItemClick: {
      action: 'itemClicked',
      description: 'Function called when item is clicked',
    },
    processingVideoId: {
      control: 'text',
      description: 'ID of video being processed',
    },
    processingStatus: {
      control: 'select',
      options: ['idle', 'gathering', 'summarizing', 'complete', 'error'],
      description: 'Current processing status',
    },
  },
} satisfies Meta<typeof VirtualizedGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for stories
const mockItems = Array.from({ length: 20 }, (_, i) => ({
  id: `item-${i}`,
  videoId: `video-${i}`,
  title: `Video Title ${i + 1}`,
  channelTitle: `Channel ${i + 1}`,
  thumbnail: `https://picsum.photos/seed/video${i}/300/200.jpg`,
  createdTime: new Date(Date.now() - i * 1000000).toISOString(),
  isNewFromCallback: i % 5 === 0,
}));

const mockItemsLarge = Array.from({ length: 100 }, (_, i) => ({
  id: `item-${i}`,
  videoId: `video-${i}`,
  title: `Video Title ${i + 1}`,
  channelTitle: `Channel ${i + 1}`,
  thumbnail: `https://picsum.photos/seed/video${i}/300/200.jpg`,
  createdTime: new Date(Date.now() - i * 1000000).toISOString(),
  isNewFromCallback: i % 7 === 0,
}));

export const Default: Story = {
  args: {
    items: mockItems,
    isLoading: false,
    isLoadingMore: false,
    loadMoreRows: async () => {
      console.log('Loading more rows...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    rowCount: 10,
    scrollElement: null,
    emptyMessage: 'No videos found',
    errorMessage: 'Failed to load videos',
    error: null,
    onItemClick: (item) => console.log('Item clicked:', item),
    processingVideoId: null,
    processingStatus: 'idle',
  },
};

export const Loading: Story = {
  args: {
    items: [],
    isLoading: true,
    isLoadingMore: false,
    loadMoreRows: async () => {},
    rowCount: 0,
    scrollElement: null,
    emptyMessage: 'No videos found',
    errorMessage: 'Failed to load videos',
    error: null,
    onItemClick: (item) => console.log('Item clicked:', item),
    processingVideoId: null,
    processingStatus: 'idle',
  },
};

export const Empty: Story = {
  args: {
    items: [],
    isLoading: false,
    isLoadingMore: false,
    loadMoreRows: async () => {},
    rowCount: 0,
    scrollElement: null,
    emptyMessage: 'No videos found. Try adjusting your search criteria.',
    errorMessage: 'Failed to load videos',
    error: null,
    onItemClick: (item) => console.log('Item clicked:', item),
    processingVideoId: null,
    processingStatus: 'idle',
  },
};

export const WithError: Story = {
  args: {
    items: [],
    isLoading: false,
    isLoadingMore: false,
    loadMoreRows: async () => {},
    rowCount: 0,
    scrollElement: null,
    emptyMessage: 'No videos found',
    errorMessage: 'Failed to load videos',
    error: new Error('Network error occurred'),
    onItemClick: (item) => console.log('Item clicked:', item),
    processingVideoId: null,
    processingStatus: 'idle',
  },
};

export const WithProcessing: Story = {
  args: {
    items: mockItems,
    isLoading: false,
    isLoadingMore: false,
    loadMoreRows: async () => {},
    rowCount: 10,
    scrollElement: null,
    emptyMessage: 'No videos found',
    errorMessage: 'Failed to load videos',
    error: null,
    onItemClick: (item) => console.log('Item clicked:', item),
    processingVideoId: 'video-2',
    processingStatus: 'gathering',
  },
};

export const LargeDataset: Story = {
  args: {
    items: mockItemsLarge,
    isLoading: false,
    isLoadingMore: false,
    loadMoreRows: async () => {
      console.log('Loading more rows...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    rowCount: 100,
    scrollElement: null,
    emptyMessage: 'No videos found',
    errorMessage: 'Failed to load videos',
    error: null,
    onItemClick: (item) => console.log('Item clicked:', item),
    processingVideoId: null,
    processingStatus: 'idle',
  },
};

export const LoadingMore: Story = {
  args: {
    items: mockItems,
    isLoading: false,
    isLoadingMore: true,
    loadMoreRows: async () => {},
    rowCount: 50,
    scrollElement: null,
    emptyMessage: 'No videos found',
    errorMessage: 'Failed to load videos',
    error: null,
    onItemClick: (item) => console.log('Item clicked:', item),
    processingVideoId: null,
    processingStatus: 'idle',
  },
};

export const WithNewItems: Story = {
  args: {
    items: mockItems.map((item, index) => ({
      ...item,
      isNewFromCallback: index < 3, // First 3 items are new
    })),
    isLoading: false,
    isLoadingMore: false,
    loadMoreRows: async () => {},
    rowCount: 10,
    scrollElement: null,
    emptyMessage: 'No videos found',
    errorMessage: 'Failed to load videos',
    error: null,
    onItemClick: (item) => console.log('Item clicked:', item),
    processingVideoId: null,
    processingStatus: 'idle',
  },
};

export const InteractiveExample = {
  render: () => {
    const [items, setItems] = useState(mockItems);
    const [isLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [processingVideoId, setProcessingVideoId] = useState<string | null>(null);
    const [processingStatus, setProcessingStatus] = useState<'idle' | 'gathering' | 'summarizing' | 'complete' | 'error'>('idle');

    const loadMoreRows = async () => {
      setIsLoadingMore(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newItems = Array.from({ length: 10 }, (_, i) => ({
        id: `item-${items.length + i}`,
        videoId: `video-${items.length + i}`,
        title: `Additional Video ${items.length + i + 1}`,
        channelTitle: `Channel ${items.length + i + 1}`,
        thumbnail: `https://picsum.photos/seed/video${items.length + i}/300/200.jpg`,
        createdTime: new Date().toISOString(),
        isNewFromCallback: Math.random() > 0.7,
      }));

      setItems(prev => [...prev, ...newItems]);
      setIsLoadingMore(false);
    };

    const handleItemClick = (item: any) => {
      setProcessingVideoId(item.videoId);
      setProcessingStatus('gathering');

      // Simulate processing
      setTimeout(() => {
        setProcessingStatus('summarizing');
        setTimeout(() => {
          setProcessingStatus('complete');
          setTimeout(() => {
            setProcessingVideoId(null);
            setProcessingStatus('idle');
          }, 1000);
        }, 2000);
      }, 1000);
    };

    return (
      <div className="h-screen">
        <VirtualizedGrid
          items={items}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          loadMoreRows={loadMoreRows}
          rowCount={Math.ceil(items.length / 3) + 10} // Simulate more rows available
          scrollElement={null}
          emptyMessage="No videos found"
          errorMessage="Failed to load videos"
          error={null}
          onItemClick={handleItemClick}
          processingVideoId={processingVideoId}
          processingStatus={processingStatus}
        />
      </div>
    );
  },
};

export const DifferentStates = {
  render: () => {
    const [currentState, setCurrentState] = useState<'default' | 'loading' | 'empty' | 'error'>('default');

    const getStateProps = () => {
      switch (currentState) {
        case 'loading':
          return {
            items: [],
            isLoading: true,
            isLoadingMore: false,
            rowCount: 0,
          };
        case 'empty':
          return {
            items: [],
            isLoading: false,
            isLoadingMore: false,
            rowCount: 0,
          };
        case 'error':
          return {
            items: [],
            isLoading: false,
            isLoadingMore: false,
            rowCount: 0,
            error: new Error('Failed to connect to server'),
          };
        default:
          return {
            items: mockItems.slice(0, 6),
            isLoading: false,
            isLoadingMore: false,
            rowCount: 6,
          };
      }
    };

    const stateProps = getStateProps();

    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentState('default')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentState === 'default'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Default
          </button>
          <button
            onClick={() => setCurrentState('loading')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentState === 'loading'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Loading
          </button>
          <button
            onClick={() => setCurrentState('empty')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentState === 'empty'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Empty
          </button>
          <button
            onClick={() => setCurrentState('error')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentState === 'error'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Error
          </button>
        </div>

        <div className="h-96">
          <VirtualizedGrid
            {...stateProps}
            loadMoreRows={async () => {}}
            scrollElement={null}
            emptyMessage="No videos found. Try adjusting your search criteria."
            errorMessage="Failed to load videos. Please try again later."
            error={stateProps.error || undefined}
            onItemClick={(item) => console.log('Item clicked:', item)}
            processingVideoId={null}
            processingStatus="idle"
          />
        </div>
      </div>
    );
  },
};
