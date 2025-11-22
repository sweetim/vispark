import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import FormInput from './FormInput';

const meta = {
  title: 'Components/FormInput',
  component: FormInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A form input component with label, error, and helper text support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the input field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'Input type',
    },
    value: {
      control: 'text',
      description: 'Input value',
    },
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    helperText: {
      control: 'text',
      description: 'Helper text to display below the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof FormInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Name',
    placeholder: 'Enter your name',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Email',
    type: 'email',
    value: 'john.doe@example.com',
    placeholder: 'Enter your email',
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    type: 'password',
    value: '123',
    error: 'Password must be at least 8 characters long',
    placeholder: 'Enter your password',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Username',
    placeholder: 'Choose a username',
    helperText: 'Username must be unique and contain only letters, numbers, and underscores',
  },
};

export const PasswordInput: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter a secure password',
    required: true,
  },
};

export const EmailInput: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    placeholder: 'your.email@example.com',
    required: true,
  },
};

export const NumberInput: Story = {
  args: {
    label: 'Age',
    type: 'number',
    placeholder: 'Enter your age',
    min: 18,
    max: 100,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    value: 'This field is disabled',
    disabled: true,
  },
};

export const Required: Story = {
  args: {
    label: 'Phone Number',
    type: 'tel',
    placeholder: '+1 (555) 123-4567',
    required: true,
  },
};

export const WithAllFeatures: Story = {
  args: {
    label: 'Website URL',
    type: 'url',
    placeholder: 'https://example.com',
    helperText: 'Enter a valid URL including https:// or http://',
    required: true,
  },
};

export const InteractiveExample = {
  render: () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({
      name: '',
      email: '',
      password: ''
    });

    const validateField = (field: string, value: string) => {
      let error = '';
      switch (field) {
        case 'name':
          if (!value.trim()) error = 'Name is required';
          else if (value.length < 2) error = 'Name must be at least 2 characters';
          break;
        case 'email':
          if (!value.trim()) error = 'Email is required';
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email';
          break;
        case 'password':
          if (!value) error = 'Password is required';
          else if (value.length < 8) error = 'Password must be at least 8 characters';
          break;
      }
      return error;
    };

    const handleChange = (field: string, value: string) => {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));

      switch (field) {
        case 'name':
          setName(value);
          break;
        case 'email':
          setEmail(value);
          break;
        case 'password':
          setPassword(value);
          break;
      }
    };

    return (
      <div className="w-full max-w-md space-y-6">
        <FormInput
          label="Full Name"
          value={name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter your full name"
          error={errors.name}
          required
        />

        <FormInput
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="your.email@example.com"
          error={errors.email}
          required
        />

        <FormInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="Enter a secure password"
          error={errors.password}
          helperText="Password must be at least 8 characters long"
          required
        />
      </div>
    );
  },
};

export const FormLayoutExample = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <FormInput
        label="First Name"
        placeholder="Enter your first name"
        required
      />
      <FormInput
        label="Last Name"
        placeholder="Enter your last name"
        required
      />
      <FormInput
        label="Email"
        type="email"
        placeholder="your.email@example.com"
        required
      />
      <FormInput
        label="Phone"
        type="tel"
        placeholder="+1 (555) 123-4567"
        helperText="Include country code for international numbers"
      />
      <FormInput
        label="Company"
        placeholder="Your company name"
      />
      <FormInput
        label="Job Title"
        placeholder="Your job title"
      />
    </div>
  ),
};
