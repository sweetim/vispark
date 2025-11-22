import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRightIcon, GearIcon, UserIcon, PlusIcon } from '@phosphor-icons/react';
import NavigationButton from './NavigationButton';

const meta = {
  title: 'Components/NavigationButton',
  component: NavigationButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A navigation button component with support for icons and different variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    to: {
      control: 'text',
      description: 'URL to navigate to',
    },
    icon: {
      control: 'select',
      options: ['none', 'ArrowRight', 'Gear', 'User', 'Plus'],
      mapping: {
        none: undefined,
        ArrowRight: ArrowRightIcon,
        Gear: GearIcon,
        User: UserIcon,
        Plus: PlusIcon,
      },
      description: 'Icon to display',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
      description: 'Button variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof NavigationButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Click me',
    variant: 'secondary',
    size: 'md',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Settings',
    icon: GearIcon,
    variant: 'secondary',
    size: 'md',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary Action',
    variant: 'primary',
    size: 'md',
  },
};

export const PrimaryWithIcon: Story = {
  args: {
    children: 'Add Item',
    icon: PlusIcon,
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Action',
    variant: 'secondary',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Action',
    variant: 'ghost',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    children: 'Small',
    variant: 'secondary',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    variant: 'primary',
    size: 'lg',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
};

export const WithNavigation: Story = {
  args: {
    children: 'Go to Dashboard',
    to: '/dashboard',
    icon: ArrowRightIcon,
    variant: 'primary',
    size: 'md',
  },
};

export const AllVariants = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <NavigationButton variant="primary" size="sm">
          Primary Small
        </NavigationButton>
        <NavigationButton variant="secondary" size="sm">
          Secondary Small
        </NavigationButton>
        <NavigationButton variant="ghost" size="sm">
          Ghost Small
        </NavigationButton>
      </div>
      <div className="flex gap-4">
        <NavigationButton variant="primary" size="md">
          Primary Medium
        </NavigationButton>
        <NavigationButton variant="secondary" size="md">
          Secondary Medium
        </NavigationButton>
        <NavigationButton variant="ghost" size="md">
          Ghost Medium
        </NavigationButton>
      </div>
      <div className="flex gap-4">
        <NavigationButton variant="primary" size="lg">
          Primary Large
        </NavigationButton>
        <NavigationButton variant="secondary" size="lg">
          Secondary Large
        </NavigationButton>
        <NavigationButton variant="ghost" size="lg">
          Ghost Large
        </NavigationButton>
      </div>
    </div>
  ),
};

export const WithIcons = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <NavigationButton icon={UserIcon} variant="primary">
          Profile
        </NavigationButton>
        <NavigationButton icon={GearIcon} variant="secondary">
          Settings
        </NavigationButton>
        <NavigationButton icon={PlusIcon} variant="ghost">
          Add New
        </NavigationButton>
      </div>
    </div>
  ),
};

export const InteractiveExample = {
  render: () => {
    const handleClick = () => {
      alert('Button clicked!');
    };

    return (
      <div className="flex flex-col gap-4">
        <NavigationButton onClick={handleClick} variant="primary" icon={PlusIcon}>
          Click Me
        </NavigationButton>
        <NavigationButton onClick={handleClick} variant="secondary" icon={GearIcon}>
          Settings
        </NavigationButton>
        <NavigationButton onClick={handleClick} variant="ghost" icon={UserIcon}>
          Profile
        </NavigationButton>
      </div>
    );
  },
};
