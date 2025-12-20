import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { SkipLink } from '@/components/accessibility/SkipLink'
import { VisuallyHidden, ScreenReaderOnly } from '@/components/accessibility/VisuallyHidden'
import { LiveRegion, useAnnounce } from '@/components/accessibility/LiveRegion'
import { FocusTrap } from '@/components/accessibility/FocusTrap'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// SkipLink Stories
const skipLinkMeta: Meta<typeof SkipLink> = {
  title: 'Accessibility/SkipLink',
  component: SkipLink,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Skip link allows keyboard users to bypass navigation and jump directly to main content. Press Tab to see it appear.',
      },
    },
  },
  tags: ['autodocs'],
}

export default skipLinkMeta
type SkipLinkStory = StoryObj<typeof skipLinkMeta>

export const Default: SkipLinkStory = {
  render: () => (
    <div className="min-h-screen">
      <SkipLink targetId="main" />
      <nav className="bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          Press Tab to see the skip link appear
        </p>
      </nav>
      <main id="main" tabIndex={-1} className="p-4">
        <h1 className="text-2xl font-bold">Main Content</h1>
        <p>This is the main content area.</p>
      </main>
    </div>
  ),
}

// VisuallyHidden Stories
export const VisuallyHiddenMeta: Meta<typeof VisuallyHidden> = {
  title: 'Accessibility/VisuallyHidden',
  component: VisuallyHidden,
  parameters: {
    docs: {
      description: {
        component:
          'Hides content visually while keeping it accessible to screen readers.',
      },
    },
  },
}

type VisuallyHiddenStory = StoryObj<typeof VisuallyHiddenMeta>

export const HiddenText: VisuallyHiddenStory = {
  render: () => (
    <div>
      <p>There is hidden text after this sentence.</p>
      <VisuallyHidden>
        This text is only visible to screen readers.
      </VisuallyHidden>
      <p className="text-sm text-muted-foreground mt-4">
        Inspect the DOM to see the hidden element.
      </p>
    </div>
  ),
}

export const IconButtonWithLabel: VisuallyHiddenStory = {
  render: () => (
    <button className="p-2 rounded-md hover:bg-muted">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
      <ScreenReaderOnly>Add new item</ScreenReaderOnly>
    </button>
  ),
}

// LiveRegion Stories
export const LiveRegionMeta: Meta<typeof LiveRegion> = {
  title: 'Accessibility/LiveRegion',
  component: LiveRegion,
  parameters: {
    docs: {
      description: {
        component:
          'Announces dynamic content changes to screen readers using ARIA live regions.',
      },
    },
  },
}

type LiveRegionStory = StoryObj<typeof LiveRegionMeta>

const LiveRegionDemo = () => {
  const { announce, Announcer } = useAnnounce()
  const [count, setCount] = useState(0)

  const handleClick = () => {
    const newCount = count + 1
    setCount(newCount)
    announce(`Count is now ${newCount}`)
  }

  return (
    <div className="space-y-4">
      <Button onClick={handleClick}>Increment Count: {count}</Button>
      <p className="text-sm text-muted-foreground">
        Screen readers will announce the count change
      </p>
      <Announcer />
    </div>
  )
}

export const Announcements: LiveRegionStory = {
  render: () => <LiveRegionDemo />,
}

const PoliteVsAssertiveDemo = () => {
  const { announce, Announcer } = useAnnounce()

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => announce('This is a polite announcement', 'polite')}
        >
          Polite Announcement
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            announce('This is an assertive (urgent) announcement!', 'assertive')
          }
        >
          Assertive Announcement
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Polite: waits for user to finish current task. Assertive: interrupts immediately.
      </p>
      <Announcer />
    </div>
  )
}

export const PoliteVsAssertive: LiveRegionStory = {
  render: () => <PoliteVsAssertiveDemo />,
}

// FocusTrap Stories
export const FocusTrapMeta: Meta<typeof FocusTrap> = {
  title: 'Accessibility/FocusTrap',
  component: FocusTrap,
  parameters: {
    docs: {
      description: {
        component:
          'Traps keyboard focus within a container. Useful for modals and dialogs.',
      },
    },
  },
}

type FocusTrapStory = StoryObj<typeof FocusTrapMeta>

const FocusTrapDemo = () => {
  const [isActive, setIsActive] = useState(false)

  return (
    <div className="space-y-4">
      <Button onClick={() => setIsActive(true)}>Open Modal</Button>

      {isActive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <FocusTrap active={isActive} onEscape={() => setIsActive(false)}>
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full space-y-4">
              <h2 className="text-lg font-semibold">Focus Trapped Modal</h2>
              <p className="text-muted-foreground">
                Tab through the elements. Focus stays within this modal.
              </p>
              <Input placeholder="First input" />
              <Input placeholder="Second input" />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsActive(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsActive(false)}>Confirm</Button>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}
    </div>
  )
}

export const ModalFocusTrap: FocusTrapStory = {
  render: () => <FocusTrapDemo />,
}

// Combined accessibility example
export const AllAccessibilityFeatures: SkipLinkStory = {
  render: () => {
    const [message, setMessage] = useState('')

    return (
      <div className="min-h-screen">
        <SkipLink targetId="content" label="Skip to content" />

        <header className="bg-muted p-4 border-b">
          <nav className="flex gap-4">
            <a href="#" className="text-sm hover:underline focus:ring-2 focus:ring-primary">
              Home
            </a>
            <a href="#" className="text-sm hover:underline focus:ring-2 focus:ring-primary">
              About
            </a>
            <a href="#" className="text-sm hover:underline focus:ring-2 focus:ring-primary">
              Contact
            </a>
          </nav>
        </header>

        <main id="content" tabIndex={-1} className="p-6 space-y-6">
          <h1 className="text-2xl font-bold">Accessibility Demo</h1>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Live Region Test</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button onClick={() => alert(`Message: ${message}`)}>
                Submit
                <ScreenReaderOnly>(opens alert)</ScreenReaderOnly>
              </Button>
            </div>
            <LiveRegion
              message={message ? `You typed: ${message}` : ''}
              politeness="polite"
            />
          </section>
        </main>
      </div>
    )
  },
}
