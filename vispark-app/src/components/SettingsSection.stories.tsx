import type { Meta, StoryObj } from '@storybook/react'
import SettingsSection from './SettingsSection'
import { GlobeIcon } from '@phosphor-icons/react'

const meta = {
  title: 'Components/SettingsSection',
  component: SettingsSection,
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
        <div className="w-full max-w-2xl">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Section Title',
    children: (
      <div className="space-y-4">
        <p className="text-gray-300">This is the content of the settings section.</p>
        <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-xl">
          <div>
            <h3 className="text-sm font-medium text-white">Setting Option</h3>
            <p className="text-sm text-gray-400">Description of the setting option</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
            Action
          </button>
        </div>
      </div>
    ),
  },
}

export const WithIcon: Story = {
  args: {
    title: 'Section with Icon',
    icon: <GlobeIcon size={20} weight="duotone" />,
    children: (
      <div className="space-y-4">
        <p className="text-gray-300">This section has an icon in the header.</p>
        <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-xl">
          <div>
            <h3 className="text-sm font-medium text-white">Setting Option</h3>
            <p className="text-sm text-gray-400">Description of the setting option</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors">
            Action
          </button>
        </div>
      </div>
    ),
  },
}
