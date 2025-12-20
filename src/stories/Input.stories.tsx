import type { Meta, StoryObj } from '@storybook/react'
import { Search, Mail } from 'lucide-react'

import { Input } from '@/components/ui/input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'search'],
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'text',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <label htmlFor="email" className="text-sm font-medium">
        Email
      </label>
      <Input type="email" id="email" placeholder="Enter your email" />
    </div>
  ),
}

export const WithError: Story = {
  args: {
    placeholder: 'Enter email',
    error: 'Please enter a valid email address',
    defaultValue: 'invalid-email',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    defaultValue: 'Cannot edit',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
}

export const Search: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className="pl-10" placeholder="Search..." />
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="email" className="pl-10" placeholder="Enter email" />
    </div>
  ),
}

export const FormExample: Story = {
  render: () => (
    <form className="w-full max-w-sm space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input id="name" placeholder="John Doe" />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="form-email" className="text-sm font-medium">
          Email
        </label>
        <Input id="form-email" type="email" placeholder="john@example.com" />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone
        </label>
        <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
      </div>
    </form>
  ),
}

export const AllStates: Story = {
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Input placeholder="Default" />
      <Input placeholder="With value" defaultValue="Some value" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="With error" error="This field is required" />
    </div>
  ),
}
