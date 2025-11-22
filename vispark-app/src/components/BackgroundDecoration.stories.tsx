import type { Meta, StoryObj } from '@storybook/react'
import BackgroundDecoration from './BackgroundDecoration'

const meta = {
  title: 'Components/BackgroundDecoration',
  component: BackgroundDecoration,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0f172a' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="relative min-h-screen bg-slate-950">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BackgroundDecoration>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
