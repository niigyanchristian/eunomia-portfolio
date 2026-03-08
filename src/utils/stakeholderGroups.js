const STAKEHOLDER_GROUPS_KEY = 'portfolio_stakeholder_groups'

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STAKEHOLDER_GROUPS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore parse errors
  }
  return []
}

function saveToStorage(data) {
  localStorage.setItem(STAKEHOLDER_GROUPS_KEY, JSON.stringify(data))
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function getAllGroups() {
  return loadFromStorage()
}

export function getGroupById(groupId) {
  const groups = loadFromStorage()
  return groups.find((g) => g.id === groupId) || null
}

export function createGroup(name, emails = []) {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Group name is required')
  }

  const groups = loadFromStorage()

  const duplicate = groups.find((g) => g.name.toLowerCase() === name.toLowerCase())
  if (duplicate) {
    throw new Error(`Group with name "${name}" already exists`)
  }

  const newGroup = {
    id: generateId(),
    name: name.trim(),
    emails: Array.isArray(emails) ? emails : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const updated = [...groups, newGroup]
  saveToStorage(updated)
  return newGroup
}

export function updateGroup(groupId, updates) {
  const groups = loadFromStorage()
  const index = groups.findIndex((g) => g.id === groupId)

  if (index === -1) {
    throw new Error(`Group with id "${groupId}" not found`)
  }

  if (updates.name && updates.name !== groups[index].name) {
    const duplicate = groups.find(
      (g) => g.id !== groupId && g.name.toLowerCase() === updates.name.toLowerCase()
    )
    if (duplicate) {
      throw new Error(`Group with name "${updates.name}" already exists`)
    }
  }

  const updated = [...groups]
  updated[index] = {
    ...updated[index],
    ...updates,
    id: groupId,
    createdAt: updated[index].createdAt,
    updatedAt: new Date().toISOString(),
  }

  saveToStorage(updated)
  return updated[index]
}

export function deleteGroup(groupId) {
  const groups = loadFromStorage()
  const filtered = groups.filter((g) => g.id !== groupId)

  if (filtered.length === groups.length) {
    throw new Error(`Group with id "${groupId}" not found`)
  }

  saveToStorage(filtered)
  return true
}

export function addEmailToGroup(groupId, email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Valid email address is required')
  }

  const groups = loadFromStorage()
  const index = groups.findIndex((g) => g.id === groupId)

  if (index === -1) {
    throw new Error(`Group with id "${groupId}" not found`)
  }

  const normalizedEmail = email.trim().toLowerCase()
  const group = groups[index]

  if (group.emails.some((e) => e.toLowerCase() === normalizedEmail)) {
    throw new Error(`Email "${email}" already exists in group`)
  }

  const updated = [...groups]
  updated[index] = {
    ...group,
    emails: [...group.emails, email.trim()],
    updatedAt: new Date().toISOString(),
  }

  saveToStorage(updated)
  return updated[index]
}

export function removeEmailFromGroup(groupId, email) {
  const groups = loadFromStorage()
  const index = groups.findIndex((g) => g.id === groupId)

  if (index === -1) {
    throw new Error(`Group with id "${groupId}" not found`)
  }

  const normalizedEmail = email.trim().toLowerCase()
  const updated = [...groups]
  updated[index] = {
    ...updated[index],
    emails: updated[index].emails.filter((e) => e.toLowerCase() !== normalizedEmail),
    updatedAt: new Date().toISOString(),
  }

  saveToStorage(updated)
  return updated[index]
}

export function getEmailsFromGroups(groupIds) {
  const groups = loadFromStorage()
  const selectedGroups = groups.filter((g) => groupIds.includes(g.id))

  const emailSet = new Set()
  selectedGroups.forEach((group) => {
    group.emails.forEach((email) => emailSet.add(email))
  })

  return Array.from(emailSet)
}
