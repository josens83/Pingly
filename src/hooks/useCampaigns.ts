import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Campaign, CampaignFormData, PaginatedResponse, CampaignStatus, MessageType } from '@/types'

interface UseCampaignsParams {
  page?: number
  limit?: number
  status?: CampaignStatus
  type?: MessageType
}

async function fetchCampaigns(params: UseCampaignsParams): Promise<PaginatedResponse<Campaign>> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())
  if (params.status) searchParams.set('status', params.status)
  if (params.type) searchParams.set('type', params.type)

  const response = await fetch(`/api/campaigns?${searchParams}`)
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns')
  }
  const data = await response.json()
  return {
    data: data.campaigns,
    pagination: data.pagination,
  }
}

async function fetchCampaign(id: string): Promise<Campaign> {
  const response = await fetch(`/api/campaigns/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch campaign')
  }
  const data = await response.json()
  return data.campaign
}

async function createCampaign(data: CampaignFormData): Promise<Campaign> {
  const response = await fetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create campaign')
  }
  const result = await response.json()
  return result.campaign
}

async function updateCampaign(id: string, data: Partial<CampaignFormData>): Promise<Campaign> {
  const response = await fetch(`/api/campaigns/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update campaign')
  }
  const result = await response.json()
  return result.campaign
}

async function sendCampaign(id: string): Promise<Campaign> {
  const response = await fetch(`/api/campaigns/${id}/send`, {
    method: 'POST',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send campaign')
  }
  const result = await response.json()
  return result.campaign
}

async function deleteCampaign(id: string): Promise<void> {
  const response = await fetch(`/api/campaigns/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete campaign')
  }
}

export function useCampaigns(params: UseCampaignsParams = {}) {
  return useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => fetchCampaigns(params),
  })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => fetchCampaign(id),
    enabled: !!id,
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CampaignFormData> }) =>
      updateCampaign(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.id] })
    },
  })
}

export function useSendCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendCampaign,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign', id] })
    },
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}
