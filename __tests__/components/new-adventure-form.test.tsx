/**
 * Component tests for NewAdventureForm (Phase 1)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewAdventureForm } from '@/components/adventures/new-adventure-form'

// Mock the server action
jest.mock('@/app/actions/adventures', () => ({
  createAdventure: jest.fn(),
}))

const mockCharacters = [
  {
    id: 'char-1',
    name: 'Alice',
    age: 25,
    gender: 'female',
    tags: 'brave,kind',
    appearance: 'Tall with brown hair',
    scents_aromas: 'roses',
    personality: 'Brave and kind-hearted',
    background: 'A noble knight',
    created_by: 'user-1',
    visibility: 'private'
  },
  {
    id: 'char-2',
    name: 'Bob',
    age: 30,
    gender: 'male',
    tags: 'wise,mysterious',
    appearance: 'Short with a beard',
    scents_aromas: 'sage',
    personality: 'Wise and mysterious',
    background: 'A learned wizard',
    created_by: 'user-1',
    visibility: 'private'
  }
]

const mockLocations = [
  {
    id: 'loc-1',
    name: 'Enchanted Forest',
    description: 'A magical forest full of wonder',
    created_by: 'user-1'
  },
  {
    id: 'loc-2',
    name: 'Ancient Castle',
    description: 'A mysterious castle on a hill',
    created_by: 'user-1'
  }
]

describe('NewAdventureForm', () => {
  const defaultProps = {
    characters: mockCharacters,
    locations: mockLocations,
    userId: 'user-1'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the form with all required fields', () => {
    render(<NewAdventureForm {...defaultProps} />)

    expect(screen.getByText('Create Your Adventure')).toBeInTheDocument()
    expect(screen.getByLabelText(/adventure title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/select character/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/select location/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/setting description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start adventure/i })).toBeInTheDocument()
  })

  it('displays character select with proper attributes', () => {
    render(<NewAdventureForm {...defaultProps} />)

    const characterSelect = screen.getByRole('combobox', { name: /select character/i })
    expect(characterSelect).toBeInTheDocument()
    expect(characterSelect).toHaveAttribute('aria-required', 'true')
  })

  it('displays location select when locations exist', () => {
    render(<NewAdventureForm {...defaultProps} />)

    const locationSelect = screen.getByRole('combobox', { name: /select location/i })
    expect(locationSelect).toBeInTheDocument()
  })

  it('hides location select when no locations are provided', () => {
    render(<NewAdventureForm {...defaultProps} locations={[]} />)

    expect(screen.queryByLabelText(/select location/i)).not.toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<NewAdventureForm {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: /start adventure/i })
    await user.click(submitButton)

    // HTML5 validation should prevent form submission
    const titleInput = screen.getByLabelText(/adventure title/i)
    expect(titleInput).toBeRequired()
  })

  it('allows user to fill out form fields', async () => {
    const user = userEvent.setup()
    render(<NewAdventureForm {...defaultProps} />)

    // Fill out the form
    await user.type(screen.getByLabelText(/adventure title/i), 'My Epic Adventure')
    await user.type(
      screen.getByLabelText(/setting description/i),
      'A thrilling adventure in a magical realm'
    )

    // Verify form fields can be filled
    expect(screen.getByLabelText(/adventure title/i)).toHaveValue('My Epic Adventure')
    expect(screen.getByLabelText(/setting description/i)).toHaveValue('A thrilling adventure in a magical realm')
  })

  it('renders submit button correctly', () => {
    render(<NewAdventureForm {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: /start adventure/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('has proper form structure for server action', () => {
    render(<NewAdventureForm {...defaultProps} />)

    const form = screen.getByLabelText(/adventure title/i).closest('form')
    expect(form).toBeInTheDocument()
    
    // Verify form has action attribute (server action)
    expect(form).toHaveAttribute('action')
    
    // Verify required input fields have proper names for form data
    expect(screen.getByLabelText(/adventure title/i)).toHaveAttribute('name', 'title')
    expect(screen.getByLabelText(/setting description/i)).toHaveAttribute('name', 'settingDescription')
  })

  it('renders form for characters with ages', () => {
    render(<NewAdventureForm {...defaultProps} />)

    const characterSelect = screen.getByRole('combobox', { name: /select character/i })
    expect(characterSelect).toBeInTheDocument()
  })

  it('renders form for characters without ages', () => {
    const charactersWithoutAge = [
      { ...mockCharacters[0], age: null },
      { ...mockCharacters[1], age: null }
    ]
    
    render(<NewAdventureForm {...defaultProps} characters={charactersWithoutAge} />)

    const characterSelect = screen.getByRole('combobox', { name: /select character/i })
    expect(characterSelect).toBeInTheDocument()
  })
})