import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/app/api'

// Query keys
export const adminKeys = {
  all: ['admin'] as const,
  tags: () => [...adminKeys.all, 'tags'] as const,
  collections: () => [...adminKeys.all, 'collections'] as const,
  products: () => [...adminKeys.all, 'products'] as const,
}

// Tags queries
export function useTags() {
  return useQuery({
    queryKey: adminKeys.tags(),
    queryFn: async () => {
      const response = await api.get('/marketplace/admin/tags')
      return response.data
    },
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await api.post('/marketplace/admin/tags', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tags() })
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; description?: string } }) => {
      const response = await api.put(`/marketplace/admin/tags/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tags() })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/marketplace/admin/tags/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.tags() })
    },
  })
}

// Collections queries
export function useCollections() {
  return useQuery({
    queryKey: adminKeys.collections(),
    queryFn: async () => {
      const response = await api.get('/marketplace/admin/collections')
      return response.data
    },
  })
}

export function useCreateCollection() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await api.post('/marketplace/admin/collections', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.collections() })
    },
  })
}

export function useUpdateCollection() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; description?: string } }) => {
      const response = await api.put(`/marketplace/admin/collections/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.collections() })
    },
  })
}

export function useDeleteCollection() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/marketplace/admin/collections/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.collections() })
    },
  })
} 