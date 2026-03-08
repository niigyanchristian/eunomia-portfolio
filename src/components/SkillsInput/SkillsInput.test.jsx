import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SkillsInput } from './SkillsInput'

const setup = (skills = [], onChange = vi.fn()) => {
  const utils = render(<SkillsInput skills={skills} onChange={onChange} />)
  const input = screen.getByRole('textbox', { name: /add skill/i })
  return { ...utils, input, onChange }
}

describe('SkillsInput', () => {
  it('renders existing skills as tags', () => {
    setup(['React', 'Python'])
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })

  it('shows React in dropdown when typing "React"', async () => {
    const user = userEvent.setup()
    const { input } = setup()
    await user.type(input, 'React')
    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument()
  })

  it('clicking a suggestion adds the tag and clears input', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { input } = setup([], onChange)
    await user.type(input, 'React')
    const option = screen.getByRole('option', { name: 'React' })
    fireEvent.mouseDown(option)
    expect(onChange).toHaveBeenCalledWith(['React'])
    expect(input.value).toBe('')
  })

  it('pressing Enter adds the first matching suggestion', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { input } = setup([], onChange)
    await user.type(input, 'React')
    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(['React'])
    expect(input.value).toBe('')
  })

  it('pressing Escape closes the dropdown without adding a skill', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { input } = setup([], onChange)
    await user.type(input, 'React')
    expect(screen.getByRole('option', { name: 'React' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByRole('option', { name: 'React' })).not.toBeInTheDocument()
  })

  it('clicking X on a tag removes it', () => {
    const onChange = vi.fn()
    setup(['React', 'Python'], onChange)
    const removeBtn = screen.getByRole('button', { name: /remove react/i })
    fireEvent.click(removeBtn)
    expect(onChange).toHaveBeenCalledWith(['Python'])
  })

  it('adding a duplicate skill is ignored', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { input } = setup(['React'], onChange)
    await user.type(input, 'React')
    // React should not appear in suggestions since it is already added
    expect(screen.queryByRole('option', { name: 'React' })).not.toBeInTheDocument()
    // Pressing Enter should not call onChange with a duplicate
    await user.keyboard('{Enter}')
    expect(onChange).not.toHaveBeenCalled()
  })
})
