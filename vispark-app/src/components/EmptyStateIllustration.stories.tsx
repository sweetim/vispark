import type { Meta, StoryObj } from '@storybook/react'
import EmptyStateIllustration from './EmptyStateIllustration'

const meta = {
  title: 'Components/EmptyStateIllustration',
  component: EmptyStateIllustration,
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
} satisfies Meta<typeof EmptyStateIllustration>

export default meta
type Story = StoryObj<typeof meta>

export const Search: Story = {
  args: {
    type: 'search',
  },
}

export const NoResults: Story = {
  args: {
    type: 'no-results',
  },
}
