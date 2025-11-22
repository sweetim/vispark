import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import AnimatedBackground from './AnimatedBackground';

const meta = {
  title: 'Components/AnimatedBackground',
  component: AnimatedBackground,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'An animated background component with floating gradient orbs that respond to scroll position.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    scrollY: {
      control: 'number',
      description: 'Vertical scroll position for animation effects',
      min: 0,
      max: 1000,
      step: 10,
    },
  },
} satisfies Meta<typeof AnimatedBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    scrollY: 0,
  },
};

export const WithScroll: Story = {
  args: {
    scrollY: 200,
  },
};

export const HighScroll: Story = {
  args: {
    scrollY: 500,
  },
};

export const MaxScroll: Story = {
  args: {
    scrollY: 1000,
  },
};

export const InteractiveExample = {
  render: () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
      const handleScroll = () => {
        setScrollY(window.scrollY);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
      <div className="relative min-h-screen">
        <AnimatedBackground scrollY={scrollY} />

        <div className="relative z-10 p-8 space-y-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Interactive Scroll Demo</h2>
            <p className="text-gray-300 mb-4">
              Scroll the page to see the background animation respond to scroll position.
            </p>
            <div className="bg-gray-900 rounded p-4">
              <p className="text-sm text-gray-400">Current scroll position: <span className="text-white font-mono">{scrollY}px</span></p>
            </div>
          </div>

          <div className="h-96 flex items-center justify-center">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">Scroll Down</h3>
              <p className="text-gray-300">Keep scrolling to see more content and animation effects</p>
            </div>
          </div>

          <div className="h-96 flex items-center justify-center">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">Middle Section</h3>
              <p className="text-gray-300">The background orbs should be moving differently now</p>
            </div>
          </div>

          <div className="h-96 flex items-center justify-center">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">Bottom Section</h3>
              <p className="text-gray-300">Maximum scroll effect applied to background</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const WithContent = {
  render: () => (
    <div className="relative min-h-screen">
      <AnimatedBackground scrollY={0} />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-white/10 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome</h2>
          <p className="text-gray-300 mb-6">
            This demonstrates how the animated background works with content overlay.
            The background creates a dynamic, engaging visual effect while maintaining
            readability and accessibility.
          </p>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              Get Started
            </button>
            <button className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const MultipleScrollPositions = {
  render: () => {
    const scrollPositions = [0, 100, 250, 500, 750];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-8">
        {scrollPositions.map((scrollY) => (
          <div key={scrollY} className="relative h-64 rounded-lg overflow-hidden border border-gray-700">
            <AnimatedBackground scrollY={scrollY} />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <p className="text-white font-semibold">Scroll: {scrollY}px</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const StaticExamples = {
  render: () => (
    <div className="space-y-8 p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative h-48 rounded-lg overflow-hidden border border-gray-700">
          <AnimatedBackground scrollY={0} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-white font-medium">No Scroll</span>
          </div>
        </div>

        <div className="relative h-48 rounded-lg overflow-hidden border border-gray-700">
          <AnimatedBackground scrollY={300} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-white font-medium">Medium Scroll</span>
          </div>
        </div>

        <div className="relative h-48 rounded-lg overflow-hidden border border-gray-700">
          <AnimatedBackground scrollY={600} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-white font-medium">High Scroll</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-2">Animation Behavior</h3>
        <ul className="text-gray-300 space-y-2">
          <li>• Blue orb moves up and left as scroll increases</li>
          <li>• Purple orb moves down and right as scroll increases</li>
          <li>• Movement is subtle to maintain visual harmony</li>
          <li>• Creates depth and parallax effect</li>
        </ul>
      </div>
    </div>
  ),
};
