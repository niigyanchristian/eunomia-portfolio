import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addEmailToGroup,
  removeEmailFromGroup,
  getEmailsFromGroups,
} from './stakeholderGroups'

const mockLocalStorage = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('stakeholderGroups', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('createGroup', () => {
    it('should create a new group with valid data', () => {
      const group = createGroup('Executives', ['exec1@example.com', 'exec2@example.com'])

      expect(group).toMatchObject({
        name: 'Executives',
        emails: ['exec1@example.com', 'exec2@example.com'],
      })
      expect(group.id).toBeDefined()
      expect(group.createdAt).toBeDefined()
    })

    it('should throw error if name is missing', () => {
      expect(() => createGroup('')).toThrow('Group name is required')
    })

    it('should throw error if duplicate name exists', () => {
      createGroup('Team Leads')
      expect(() => createGroup('Team Leads')).toThrow('already exists')
    })

    it('should trim whitespace from group name', () => {
      const group = createGroup('  Test Group  ')
      expect(group.name).toBe('Test Group')
    })
  })

  describe('getAllGroups', () => {
    it('should return empty array when no groups exist', () => {
      const groups = getAllGroups()
      expect(groups).toEqual([])
    })

    it('should return all groups', () => {
      createGroup('Group1')
      createGroup('Group2')

      const groups = getAllGroups()
      expect(groups).toHaveLength(2)
    })
  })

  describe('getGroupById', () => {
    it('should return null when group does not exist', () => {
      const group = getGroupById('nonexistent')
      expect(group).toBeNull()
    })

    it('should return group when it exists', () => {
      const created = createGroup('Test Group')
      const found = getGroupById(created.id)

      expect(found).toMatchObject({
        id: created.id,
        name: 'Test Group',
      })
    })
  })

  describe('updateGroup', () => {
    it('should update group name', () => {
      const group = createGroup('Old Name')
      const updated = updateGroup(group.id, { name: 'New Name' })

      expect(updated.name).toBe('New Name')
    })

    it('should update group emails', () => {
      const group = createGroup('Test Group', ['old@example.com'])
      const updated = updateGroup(group.id, { emails: ['new@example.com'] })

      expect(updated.emails).toEqual(['new@example.com'])
    })

    it('should throw error if group not found', () => {
      expect(() => updateGroup('nonexistent', { name: 'Test' })).toThrow('not found')
    })

    it('should throw error if duplicate name', () => {
      createGroup('Group1')
      const group2 = createGroup('Group2')

      expect(() => updateGroup(group2.id, { name: 'Group1' })).toThrow('already exists')
    })
  })

  describe('deleteGroup', () => {
    it('should delete group', () => {
      const group = createGroup('Test Group')
      deleteGroup(group.id)

      const found = getGroupById(group.id)
      expect(found).toBeNull()
    })

    it('should throw error if group not found', () => {
      expect(() => deleteGroup('nonexistent')).toThrow('not found')
    })
  })

  describe('addEmailToGroup', () => {
    it('should add email to group', () => {
      const group = createGroup('Test Group')
      const updated = addEmailToGroup(group.id, 'test@example.com')

      expect(updated.emails).toContain('test@example.com')
    })

    it('should throw error for invalid email', () => {
      const group = createGroup('Test Group')
      expect(() => addEmailToGroup(group.id, 'invalid-email')).toThrow('Valid email')
    })

    it('should throw error for duplicate email', () => {
      const group = createGroup('Test Group', ['test@example.com'])
      expect(() => addEmailToGroup(group.id, 'test@example.com')).toThrow('already exists')
    })

    it('should throw error if group not found', () => {
      expect(() => addEmailToGroup('nonexistent', 'test@example.com')).toThrow('not found')
    })
  })

  describe('removeEmailFromGroup', () => {
    it('should remove email from group', () => {
      const group = createGroup('Test Group', ['test@example.com', 'other@example.com'])
      const updated = removeEmailFromGroup(group.id, 'test@example.com')

      expect(updated.emails).not.toContain('test@example.com')
      expect(updated.emails).toContain('other@example.com')
    })

    it('should throw error if group not found', () => {
      expect(() => removeEmailFromGroup('nonexistent', 'test@example.com')).toThrow('not found')
    })

    it('should handle case-insensitive email removal', () => {
      const group = createGroup('Test Group', ['Test@Example.com'])
      const updated = removeEmailFromGroup(group.id, 'test@example.com')

      expect(updated.emails).toHaveLength(0)
    })
  })

  describe('getEmailsFromGroups', () => {
    it('should return empty array for empty group ids', () => {
      const emails = getEmailsFromGroups([])
      expect(emails).toEqual([])
    })

    it('should return emails from single group', () => {
      const group = createGroup('Test Group', ['test1@example.com', 'test2@example.com'])
      const emails = getEmailsFromGroups([group.id])

      expect(emails).toHaveLength(2)
      expect(emails).toContain('test1@example.com')
      expect(emails).toContain('test2@example.com')
    })

    it('should return unique emails from multiple groups', () => {
      const group1 = createGroup('Group1', ['test1@example.com', 'shared@example.com'])
      const group2 = createGroup('Group2', ['test2@example.com', 'shared@example.com'])
      const emails = getEmailsFromGroups([group1.id, group2.id])

      expect(emails).toHaveLength(3)
      expect(emails).toContain('test1@example.com')
      expect(emails).toContain('test2@example.com')
      expect(emails).toContain('shared@example.com')
    })

    it('should handle non-existent group ids', () => {
      const group = createGroup('Test Group', ['test@example.com'])
      const emails = getEmailsFromGroups([group.id, 'nonexistent'])

      expect(emails).toEqual(['test@example.com'])
    })
  })
})
