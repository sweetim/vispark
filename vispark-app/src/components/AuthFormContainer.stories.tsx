import type { Meta, StoryObj } from '@storybook/react';
import AuthFormContainer from './AuthFormContainer';

const meta = {
  title: 'Components/AuthFormContainer',
  component: AuthFormContainer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A glass morphism container for authentication forms with optional title and subtitle.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Title displayed at the top of the container',
    },
    subtitle: {
      control: 'text',
      description: 'Subtitle displayed below the title',
    },
    children: {
      control: 'text',
      description: 'Form content to display inside the container',
    },
  },
} satisfies Meta<typeof AuthFormContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email address"
          className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
        />
        <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Sign In
        </button>
      </div>
    ),
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Welcome Back',
    children: (
      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email address"
          className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
        />
        <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Sign In
        </button>
      </div>
    ),
  },
};

export const WithTitleAndSubtitle: Story = {
  args: {
    title: 'Create Account',
    subtitle: 'Sign up to get started with our service',
    children: (
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Full name"
          className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
        />
        <input
          type="email"
          placeholder="Email address"
          className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
        />
        <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Sign Up
        </button>
      </div>
    ),
  },
};

export const SimpleForm: Story = {
  args: {
    title: 'Login',
    subtitle: 'Enter your credentials to access your account',
    children: (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-sm text-gray-300">Remember me</span>
          </label>
          <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300">
            Forgot password?
          </a>
        </div>
        <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Sign In
        </button>
      </div>
    ),
  },
};

export const RegistrationForm: Story = {
  args: {
    title: 'Join Us Today',
    subtitle: 'Create your account and start your journey',
    children: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="First name"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
          />
          <input
            type="text"
            placeholder="Last name"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
          />
        </div>
        <input
          type="email"
          placeholder="Email address"
          className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
        />
        <input
          type="password"
          placeholder="Confirm password"
          className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
        />
        <div className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span className="text-sm text-gray-300">
            I agree to the{' '}
            <a href="#" className="text-indigo-400 hover:text-indigo-300">Terms</a>{' '}
            and{' '}
            <a href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>
          </span>
        </div>
        <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Create Account
        </button>
      </div>
    ),
  },
};

export const MinimalForm: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Username or email"
          className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
        />
        <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Continue
        </button>
        <div className="text-center">
          <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300">
            Need help signing in?
          </a>
        </div>
      </div>
    ),
  },
};

export const WithAdditionalActions: Story = {
  args: {
    title: 'Sign In',
    subtitle: 'Choose your preferred method',
    children: (
      <div className="space-y-4">
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="space-y-2">
          <button className="w-full px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
        </div>

        <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Sign In
        </button>
      </div>
    ),
  },
};

export const FormExamples = {
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
      <AuthFormContainer
        title="Login"
        subtitle="Welcome back! Please enter your details."
      >
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
          />
          <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Sign In
          </button>
        </div>
      </AuthFormContainer>

      <AuthFormContainer
        title="Sign Up"
        subtitle="Create your account to get started"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 bg-white/5 border border-white/20 text-white placeholder-gray-400 rounded-lg"
          />
          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Create Account
          </button>
        </div>
      </AuthFormContainer>
    </div>
  ),
};
