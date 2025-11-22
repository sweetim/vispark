import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ChannelHeader from './ChannelHeader';

const meta = {
  title: 'Components/ChannelHeader',
  component: ChannelHeader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A channel header component displaying channel information with subscription toggle.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    channelName: {
      control: 'text',
      description: 'Name of the channel',
    },
    channelThumbnail: {
      control: 'text',
      description: 'URL of the channel thumbnail image',
    },
    videoCount: {
      control: 'number',
      description: 'Number of videos in the channel',
    },
    subscriberCount: {
      control: 'number',
      description: 'Number of subscribers',
    },
    isSubscribed: {
      control: 'boolean',
      description: 'Whether the user is subscribed to the channel',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the header is in loading state',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
  },
} satisfies Meta<typeof ChannelHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    channelName: 'Tech Channel',
    videoCount: 150,
    subscriberCount: 25000,
    isSubscribed: false,
    isLoading: false,
  },
};

export const WithThumbnail: Story = {
  args: {
    channelName: 'Programming Tutorials',
    channelThumbnail: 'https://picsum.photos/seed/channel1/200/200.jpg',
    videoCount: 320,
    subscriberCount: 125000,
    isSubscribed: true,
    isLoading: false,
  },
};

export const Subscribed: Story = {
  args: {
    channelName: 'Science Explained',
    videoCount: 85,
    subscriberCount: 45000,
    isSubscribed: true,
    isLoading: false,
  },
};

export const NotSubscribed: Story = {
  args: {
    channelName: 'Music Videos',
    videoCount: 200,
    subscriberCount: 80000,
    isSubscribed: false,
    isLoading: false,
  },
};

export const NoSubscriberCount: Story = {
  args: {
    channelName: 'New Channel',
    videoCount: 12,
    subscriberCount: undefined,
    isSubscribed: false,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    channelName: 'Loading Channel',
    videoCount: 0,
    subscriberCount: 0,
    isSubscribed: false,
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    channelName: 'Error Channel',
    videoCount: 0,
    subscriberCount: 0,
    isSubscribed: false,
    isLoading: false,
    error: 'Failed to load channel information. Please try again later.',
  },
};

export const LargeNumbers: Story = {
  args: {
    channelName: 'Popular Channel',
    channelThumbnail: 'https://picsum.photos/seed/channel2/200/200.jpg',
    videoCount: 1500,
    subscriberCount: 2500000,
    isSubscribed: true,
    isLoading: false,
  },
};

export const NoSubscriptionToggle: Story = {
  args: {
    channelName: 'View Only Channel',
    channelThumbnail: 'https://picsum.photos/seed/channel3/200/200.jpg',
    videoCount: 75,
    subscriberCount: 15000,
    isSubscribed: false,
    isLoading: false,
    onSubscriptionToggle: undefined,
  },
};

export const InteractiveExample = {
  render: () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const handleSubscriptionToggle = () => {
      setIsLoading(true);
      setError(undefined);

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        if (Math.random() > 0.8) {
          setError('Failed to update subscription. Please try again.');
        } else {
          setIsSubscribed(!isSubscribed);
        }
      }, 1000);
    };

    return (
      <div className="w-full max-w-2xl">
        <ChannelHeader
          channelName="Interactive Tech Channel"
          channelThumbnail="https://picsum.photos/seed/interactive/200/200.jpg"
          videoCount={245}
          subscriberCount={85000}
          isSubscribed={isSubscribed}
          isLoading={isLoading}
          error={error}
          onSubscriptionToggle={handleSubscriptionToggle}
        />

        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-300 text-sm">
            Status: {isLoading ? 'Updating subscription...' : error ? 'Error occurred' : isSubscribed ? 'Subscribed' : 'Not subscribed'}
          </p>
        </div>
      </div>
    );
  },
};

export const MultipleChannels = {
  render: () => (
    <div className="space-y-4">
      <ChannelHeader
        channelName="Gaming Channel"
        channelThumbnail="https://picsum.photos/seed/gaming/200/200.jpg"
        videoCount={500}
        subscriberCount={120000}
        isSubscribed={true}
        onSubscriptionToggle={() => console.log('Gaming channel subscription toggled')}
      />

      <ChannelHeader
        channelName="Educational Content"
        channelThumbnail="https://picsum.photos/seed/education/200/200.jpg"
        videoCount={180}
        subscriberCount={35000}
        isSubscribed={false}
        onSubscriptionToggle={() => console.log('Educational channel subscription toggled')}
      />

      <ChannelHeader
        channelName="Art & Design"
        channelThumbnail="https://picsum.photos/seed/art/200/200.jpg"
        videoCount={92}
        subscriberCount={18000}
        isSubscribed={false}
        onSubscriptionToggle={() => console.log('Art channel subscription toggled')}
      />
    </div>
  ),
};

export const StatesShowcase = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-white font-semibold mb-2">Normal State</h3>
        <ChannelHeader
          channelName="Normal Channel"
          videoCount={100}
          subscriberCount={50000}
          isSubscribed={false}
          onSubscriptionToggle={() => console.log('Normal channel subscription toggled')}
        />
      </div>

      <div>
        <h3 className="text-white font-semibold mb-2">Loading State</h3>
        <ChannelHeader
          channelName="Loading Channel"
          isLoading={true}
        />
      </div>

      <div>
        <h3 className="text-white font-semibold mb-2">Error State</h3>
        <ChannelHeader
          channelName="Error Channel"
          error="Network error occurred while loading channel data"
        />
      </div>
    </div>
  ),
};
