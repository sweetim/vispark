import type { Meta, StoryObj } from '@storybook/react'
import ToggleOption from './ToggleOption'

const meta = {
  title: 'Components/ToggleOption',
  component: ToggleOption,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-950 p-8">
        <div className="w-full max-w-md">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof ToggleOption>

export default meta
type Story = StoryObj<typeof meta>

export const On: Story = {
  args: {
    title: 'Enable Notifications',
    description: 'Receive notifications about new content and updates',
    isOn: true,
    onToggle: () => console.log('Toggle clicked'),
  },
}

export const Off: Story = {
  args: {
    title: 'Dark Mode',
    description: 'Use dark theme across the application',
    isOn: false,
    onToggle: () => console.log('Toggle clicked'),
  },
}

export const Interactive: Story = {
  args: {
    title: 'Interactive Toggle',
    description: 'Click to toggle this option on and off',
    isOn: false,
    onToggle: () => console.log('Toggle clicked'),
  },
}
