import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Contact, ContactFormData, PaginatedResponse } from '@/types'

interface UseContactsParams {
  page?: number
  limit?: number
  search?: string
  groupId?: string
}

async function fetchContacts(params: UseContactsParams): Promise<PaginatedResponse<Contact>> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.search) searchParams.set('search', params.search)
  if (params.groupId) searchParams.set('groupId', params.groupId)

  const response = await fetch(`/api/contacts?${searchParams}`)
  if (!response.ok) {
    throw new Error('Failed to fetch contacts')
  }
  const data = await response.json()
  return {
    data: data.contacts,
    pagination: data.pagination,
  }
}

async function createContact(data: ContactFormData): Promise<Contact> {
  const response = await fetch('/api/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create contact')
  }
  const result = await response.json()
  return result.contact
}

async function updateContact(id: string, data: Partial<ContactFormData>): Promise<Contact> {
  const response = await fetch(`/api/contacts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update contact')
  }
  const result = await response.json()
  return result.contact
}

async function deleteContact(id: string): Promise<void> {
  const response = await fetch(`/api/contacts/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete contact')
  }
}

export function useContacts(params: UseContactsParams = {}) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => fetchContacts(params),
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContactFormData> }) =>
      updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}
