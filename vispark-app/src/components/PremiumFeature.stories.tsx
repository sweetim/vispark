import type { Meta, StoryObj } from '@storybook/react'
import PremiumFeature from './PremiumFeature'

const meta = {
  title: 'Components/PremiumFeature',
  component: PremiumFeature,
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
} satisfies Meta<typeof PremiumFeature>

export default meta
type Story = StoryObj<typeof meta>

export const Disabled: Story = {
  args: {
    featureName: 'Advanced Analytics',
    isEnabled: false,
  },
}

export const Enabled: Story = {
  args: {
    featureName: 'Detailed Trends',
    isEnabled: true,
  },
}

export const Multiple: Story = {
  args: {
    featureName: 'Advanced Analytics',
    isEnabled: false,
  },
}
