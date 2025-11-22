import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import TabNavigation from './TabNavigation';

const meta = {
  title: 'Components/TabNavigation',
  component: TabNavigation,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A tab navigation component for switching between different views or sections.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    tabs: {
      control: 'object',
      description: 'Array of tab objects with id, label, and optional disabled property',
    },
    activeTab: {
      control: 'text',
      description: 'ID of the currently active tab',
    },
    onTabChange: {
      action: 'tabChanged',
      description: 'Callback function when a tab is clicked',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof TabNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tabs: [
      { id: 'tab1', label: 'Overview' },
      { id: 'tab2', label: 'Details' },
      { id: 'tab3', label: 'Settings' },
    ],
    activeTab: 'tab1',
    onTabChange: (tabId: string) => console.log('Tab changed to:', tabId),
  },
};

export const TwoTabs: Story = {
  args: {
    tabs: [
      { id: 'login', label: 'Login' },
      { id: 'register', label: 'Register' },
    ],
    activeTab: 'login',
    onTabChange: (tabId: string) => console.log('Tab changed to:', tabId),
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'analytics', label: 'Analytics' },
      { id: 'reports', label: 'Reports' },
      { id: 'users', label: 'Users' },
      { id: 'settings', label: 'Settings' },
    ],
    activeTab: 'dashboard',
    onTabChange: (tabId: string) => console.log('Tab changed to:', tabId),
  },
};

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      { id: 'available', label: 'Available' },
      { id: 'disabled', label: 'Disabled', disabled: true },
      { id: 'active', label: 'Active' },
    ],
    activeTab: 'available',
    onTabChange: (tabId: string) => console.log('Tab changed to:', tabId),
  },
};

export const ActiveSecondTab: Story = {
  args: {
    tabs: [
      { id: 'first', label: 'First Tab' },
      { id: 'second', label: 'Second Tab' },
      { id: 'third', label: 'Third Tab' },
    ],
    activeTab: 'second',
    onTabChange: (tabId: string) => console.log('Tab changed to:', tabId),
  },
};

export const WithCustomStyling: Story = {
  args: {
    tabs: [
      { id: 'home', label: 'Home' },
      { id: 'profile', label: 'Profile' },
      { id: 'messages', label: 'Messages' },
    ],
    activeTab: 'home',
    className: 'bg-gray-900 p-2',
    onTabChange: (tabId: string) => console.log('Tab changed to:', tabId),
  },
};

export const InteractiveExample = {
  render: () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'analytics', label: 'Analytics' },
      { id: 'reports', label: 'Reports' },
    ];

    const renderContent = () => {
      switch (activeTab) {
        case 'overview':
          return (
            <div className="p-6 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
              <p className="text-gray-300">This is the overview content with general information and statistics.</p>
            </div>
          );
        case 'analytics':
          return (
            <div className="p-6 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
              <p className="text-gray-300">Detailed analytics and performance metrics are shown here.</p>
            </div>
          );
        case 'reports':
          return (
            <div className="p-6 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Reports</h3>
              <p className="text-gray-300">Generated reports and documentation can be found in this section.</p>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="w-full max-w-2xl space-y-4">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {renderContent()}
      </div>
    );
  },
};

export const WithDisabledTabsExample = {
  render: () => {
    const [activeTab, setActiveTab] = useState('free');

    const tabs = [
      { id: 'free', label: 'Free Features' },
      { id: 'pro', label: 'Pro Features', disabled: true },
      { id: 'enterprise', label: 'Enterprise', disabled: true },
    ];

    return (
      <div className="w-full max-w-md space-y-4">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="p-6 bg-gray-800 rounded-lg">
          <p className="text-gray-300">
            {activeTab === 'free'
              ? 'You are currently viewing free features. Upgrade to access Pro and Enterprise features.'
              : 'This tab is disabled. Please upgrade your plan to access these features.'
            }
          </p>
        </div>
      </div>
    );
  },
};

export const FormTabsExample = {
  render: () => {
    const [activeTab, setActiveTab] = useState('personal');

    const tabs = [
      { id: 'personal', label: 'Personal Info' },
      { id: 'security', label: 'Security' },
      { id: 'preferences', label: 'Preferences' },
    ];

    const renderForm = () => {
      switch (activeTab) {
        case 'personal':
          return (
            <div className="p-6 bg-gray-800 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                  <input type="text" className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white rounded-lg" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                  <input type="text" className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white rounded-lg" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white rounded-lg" placeholder="john.doe@example.com" />
              </div>
            </div>
          );
        case 'security':
          return (
            <div className="p-6 bg-gray-800 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                <input type="password" className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                <input type="password" className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                <input type="password" className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white rounded-lg" />
              </div>
            </div>
          );
        case 'preferences':
          return (
            <div className="p-6 bg-gray-800 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Email Notifications</span>
                <button className="w-12 h-6 bg-indigo-600 rounded-full relative">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Dark Mode</span>
                <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Two-Factor Authentication</span>
                <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                </button>
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="w-full max-w-2xl space-y-4">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {renderForm()}
      </div>
    );
  },
};
