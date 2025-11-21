import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ToggleSwitch } from './ToggleSwitch';

const meta = {
  title: 'Components/ToggleSwitch',
  component: ToggleSwitch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A toggle switch component for binary on/off states with support for disabled state.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOn: {
      control: 'boolean',
      description: 'Whether the toggle is in the on state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled',
    },
    onToggle: {
      action: 'toggled',
      description: 'Callback function when toggle is clicked',
    },
  },
} satisfies Meta<typeof ToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {
  args: {
    isOn: false,
    disabled: false,
  },
};

export const On: Story = {
  args: {
    isOn: true,
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    isOn: false,
    disabled: true,
  },
};

export const DisabledOn: Story = {
  args: {
    isOn: true,
    disabled: true,
  },
};

// Interactive example with state management
export const Interactive = {
  render: () => {
    const [isOn, setIsOn] = useState(false);
    return (
      <div className="flex flex-col items-center gap-4">
        <ToggleSwitch isOn={isOn} onToggle={() => setIsOn(!isOn)} />
        <p className="text-sm text-gray-400">
          Current state: {isOn ? 'On' : 'Off'}
        </p>
      </div>
    );
  },
};
