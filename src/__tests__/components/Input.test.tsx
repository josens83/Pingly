/**
 * Input Component Test Suite
 * Testing the core Input primitive
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/primitives'
import { Mail } from 'lucide-react'

describe('Input', () => {
  describe('Rendering', () => {
    it('should render an input element', () => {
      render(<Input />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Input className="custom-input" />)
      expect(screen.getByRole('textbox')).toHaveClass('custom-input')
    })
  })

  describe('Types', () => {
    it('should render email input', () => {
      render(<Input type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('should render password input', () => {
      render(<Input type="password" />)
      // Password inputs don't have textbox role
      const input = document.querySelector('input[type="password"]')
      expect(input).toBeInTheDocument()
    })

    it('should render number input', () => {
      render(<Input type="number" />)
      const input = document.querySelector('input[type="number"]')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Icons', () => {
    it('should render left icon', () => {
      render(<Input leftIcon={<Mail data-testid="mail-icon" />} />)
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
    })

    it('should render right icon', () => {
      render(<Input rightIcon={<Mail data-testid="mail-icon" />} />)
      expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error message', () => {
      render(<Input error="This field is required" />)
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should have error styling', () => {
      render(<Input error="Error" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-destructive')
    })

    it('should have aria-invalid when error', () => {
      render(<Input error="Error" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('should have disabled styling', () => {
      render(<Input disabled />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('disabled:opacity-50')
    })
  })

  describe('User Interactions', () => {
    it('should handle text input', async () => {
      const user = userEvent.setup()
      render(<Input />)
      const input = screen.getByRole('textbox')
      await user.type(input, 'Hello World')
      expect(input).toHaveValue('Hello World')
    })

    it('should call onChange when value changes', async () => {
      const handleChange = jest.fn()
      const user = userEvent.setup()
      render(<Input onChange={handleChange} />)
      await user.type(screen.getByRole('textbox'), 'a')
      expect(handleChange).toHaveBeenCalled()
    })

    it('should call onFocus when focused', () => {
      const handleFocus = jest.fn()
      render(<Input onFocus={handleFocus} />)
      fireEvent.focus(screen.getByRole('textbox'))
      expect(handleFocus).toHaveBeenCalled()
    })

    it('should call onBlur when blurred', () => {
      const handleBlur = jest.fn()
      render(<Input onBlur={handleBlur} />)
      const input = screen.getByRole('textbox')
      fireEvent.focus(input)
      fireEvent.blur(input)
      expect(handleBlur).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Email address" />)
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    })

    it('should support aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="helper-text" />
          <span id="helper-text">Enter your email</span>
        </>
      )
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'aria-describedby',
        'helper-text'
      )
    })

    it('should be focusable', () => {
      render(<Input />)
      const input = screen.getByRole('textbox')
      input.focus()
      expect(input).toHaveFocus()
    })
  })
})
