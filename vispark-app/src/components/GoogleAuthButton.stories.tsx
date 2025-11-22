import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import GoogleAuthButton from './GoogleAuthButton';

const meta = {
  title: 'Components/GoogleAuthButton',
  component: GoogleAuthButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A Google authentication button with loading states and sign in/sign up variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: {
      action: 'clicked',
      description: 'Callback function when button is clicked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button is in loading state',
    },
    type: {
      control: 'select',
      options: ['signIn', 'signUp'],
      description: 'Type of authentication action',
    },
  },
} satisfies Meta<typeof GoogleAuthButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  args: {
    type: 'signIn',
    disabled: false,
    loading: false,
    onClick: () => console.log('Sign in clicked'),
  },
};

export const SignUp: Story = {
  args: {
    type: 'signUp',
    disabled: false,
    loading: false,
    onClick: () => console.log('Sign up clicked'),
  },
};

export const Loading: Story = {
  args: {
    type: 'signIn',
    disabled: false,
    loading: true,
    onClick: () => console.log('Sign in clicked'),
  },
};

export const Disabled: Story = {
  args: {
    type: 'signIn',
    disabled: true,
    loading: false,
    onClick: () => console.log('Sign in clicked'),
  },
};

export const LoadingAndDisabled: Story = {
  args: {
    type: 'signUp',
    disabled: true,
    loading: true,
    onClick: () => console.log('Sign up clicked'),
  },
};

export const InteractiveExample = {
  render: () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const [authType, setAuthType] = useState<'signIn' | 'signUp'>('signIn');

    const handleClick = () => {
      setIsLoading(true);
      setIsDisabled(true);

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setIsDisabled(false);
        alert(`${authType === 'signIn' ? 'Sign in' : 'Sign up'} with Google completed!`);
      }, 2000);
    };

    const toggleType = () => {
      setAuthType(authType === 'signIn' ? 'signUp' : 'signIn');
    };

    return (
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            {authType === 'signIn' ? 'Sign In' : 'Sign Up'} Example
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Click the button below to simulate Google authentication
          </p>
        </div>

        <GoogleAuthButton
          type={authType}
          loading={isLoading}
          disabled={isDisabled}
          onClick={handleClick}
        />

        <div className="flex justify-center">
          <button
            onClick={toggleType}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Switch to {authType === 'signIn' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-2">Current State:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>Type: {authType === 'signIn' ? 'Sign In' : 'Sign Up'}</li>
            <li>Loading: {isLoading ? 'Yes' : 'No'}</li>
            <li>Disabled: {isDisabled ? 'Yes' : 'No'}</li>
          </ul>
        </div>
      </div>
    );
  },
};

export const AuthFormExample = {
  render: () => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleAuth = () => {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        alert(`Google ${isSignIn ? 'sign in' : 'sign up'} successful!`);
      }, 2000);
    };

    return (
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">
            {isSignIn ? 'Welcome Back' : 'Create Account'}
          </h3>
          <p className="text-gray-400 text-sm">
            {isSignIn
              ? 'Sign in to access your account'
              : 'Sign up to get started with our service'
            }
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400">
                {isSignIn ? 'Or sign in with' : 'Or sign up with'}
              </span>
            </div>
          </div>

          <GoogleAuthButton
            type={isSignIn ? 'signIn' : 'signUp'}
            loading={isLoading}
            onClick={handleGoogleAuth}
          />

          <div className="text-center">
            <button
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isSignIn
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>
      </div>
    );
  },
};

export const MultipleVariants = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Sign In Variants</h3>

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 w-24">Normal:</span>
            <GoogleAuthButton type="signIn" onClick={() => console.log('Sign in clicked')} />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-400 w-24">Loading:</span>
            <GoogleAuthButton type="signIn" loading={true} onClick={() => console.log('Sign in clicked')} />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-400 w-24">Disabled:</span>
            <GoogleAuthButton type="signIn" disabled={true} onClick={() => console.log('Sign in clicked')} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Sign Up Variants</h3>

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 w-24">Normal:</span>
            <GoogleAuthButton type="signUp" onClick={() => console.log('Sign up clicked')} />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-400 w-24">Loading:</span>
            <GoogleAuthButton type="signUp" loading={true} onClick={() => console.log('Sign up clicked')} />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-400 w-24">Disabled:</span>
            <GoogleAuthButton type="signUp" disabled={true} onClick={() => console.log('Sign up clicked')} />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const InContext = {
  render: () => (
    <div className="w-full max-w-2xl">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Authentication Options</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">New User</h3>
            <p className="text-gray-400 mb-4 text-sm">
              Create a new account to get started with all our features
            </p>
            <GoogleAuthButton
              type="signUp"
              onClick={() => alert('Sign up with Google')}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Existing User</h3>
            <p className="text-gray-400 mb-4 text-sm">
              Sign in to access your existing account and continue where you left off
            </p>
            <GoogleAuthButton
              type="signIn"
              onClick={() => alert('Sign in with Google')}
            />
          </div>
        </div>
      </div>
    </div>
  ),
};
