
import { api } from "@/lib/axios"
import type {
  Accommodation,
  CreateAccommodationInput,
  UpdateAccommodationInput,
} from "../types/accommodation.types"

export const accommodationsApi = {
  async list(): Promise<Accommodation[]> {
    const { data } = await api.get<Accommodation[]>("/accommodations")
    return data
  },

  async getById(id: string): Promise<Accommodation> {
    const { data } = await api.get<Accommodation>(`/accommodations/${id}`)
    return data
  },

  async getByOrganization(
    organizationId: string
  ): Promise<Accommodation[]> {
    const { data } = await api.get<Accommodation[]>(
      `/accommodations/organization/${organizationId}`
    )
    return data
  },

  async create(input: CreateAccommodationInput): Promise<Accommodation> {
    const { data } = await api.post<Accommodation>("/accommodations", input)
    return data
  },

  async update(
    id: string,
    input: UpdateAccommodationInput
  ): Promise<Accommodation> {
    const { data } = await api.patch<Accommodation>(
      `/accommodations/${id}`,
      input
    )
    return data
  },

  async activate(id: string): Promise<Accommodation> {
    const { data } = await api.patch<Accommodation>(
      `/accommodations/${id}/activate`
    )
    return data
  },

  async deactivate(id: string): Promise<Accommodation> {
    const { data } = await api.patch<Accommodation>(
      `/accommodations/${id}/deactivate`
    )
    return data
  },
}
