import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Update your profile information and preferences.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  ),
}

export const Stats: Story = {
  render: () => (
    <Card className="w-[200px]">
      <CardHeader className="pb-2">
        <CardDescription>Total Revenue</CardDescription>
        <CardTitle className="text-3xl">$45,231.89</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
      </CardContent>
    </Card>
  ),
}

export const Interactive: Story = {
  render: () => (
    <Card className="w-[350px] cursor-pointer transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>Campaign Report</CardTitle>
        <CardDescription>View your campaign analytics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">1,234</span>
          <span className="text-sm text-green-600">+12%</span>
        </div>
        <p className="text-sm text-muted-foreground">Messages sent this week</p>
      </CardContent>
    </Card>
  ),
}

export const GridLayout: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Campaigns</CardDescription>
          <CardTitle className="text-2xl">12</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Contacts</CardDescription>
          <CardTitle className="text-2xl">2,350</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Messages</CardDescription>
          <CardTitle className="text-2xl">45.2K</CardTitle>
        </CardHeader>
      </Card>
    </div>
  ),
}
