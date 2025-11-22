import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import LanguageSelector from './LanguageSelector'

const meta = {
  title: 'Components/LanguageSelector',
  component: LanguageSelector,
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
} satisfies Meta<typeof LanguageSelector>

export default meta
type Story = StoryObj<typeof meta>

export const EnglishSelected: Story = {
  args: {
    currentLanguage: 'en',
    onLanguageChange: (language) => console.log('Language changed to:', language),
    englishLabel: 'English',
    japaneseLabel: '日本語',
  },
}

export const JapaneseSelected: Story = {
  args: {
    currentLanguage: 'ja',
    onLanguageChange: (language) => console.log('Language changed to:', language),
    englishLabel: 'English',
    japaneseLabel: '日本語',
  },
}
