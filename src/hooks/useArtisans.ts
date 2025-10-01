import { useQuery } from '@tanstack/react-query'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export interface Artisan {
  _id: string
  name: string
  bio: string
  location: {
    city: string
    state: string
    country: string
  }
  avatar: string
  coverImage: string
  specialties: string[]
  experience: number
  rating: number
  totalRatings: number
  totalProducts: number
  totalSales: number
  verification: {
    isVerified: boolean
    verifiedAt?: Date
  }
  isActive: boolean
  joinedDate: Date
}

export interface ArtisanForDisplay {
  id: string
  name: string
  specialty: string
  location: string
  experience: string
  rating: number
  products: number
  image: string
  avatar: string
  description: string
  achievements: string[]
  joinedYear?: string
  specialties?: string[]
}

// Transform backend artisan to frontend format
function transformArtisan(artisan: Artisan): ArtisanForDisplay {
  return {
    id: artisan._id,
    name: artisan.name,
    specialty: artisan.specialties[0] || 'Artisan',
    location: `${artisan.location.city}, ${artisan.location.state}`,
    experience: `${artisan.experience} years`,
    rating: artisan.rating,
    products: artisan.totalProducts,
    image: `${API_BASE_URL}/images/${artisan.coverImage}`,
    avatar: `${API_BASE_URL}/images/${artisan.avatar}`,
    description: artisan.bio,
    achievements: ['Verified Artisan', `${artisan.totalProducts} Products`, `${artisan.experience}+ Years Experience`],
    joinedYear: new Date(artisan.joinedDate).getFullYear().toString(),
    specialties: artisan.specialties
  }
}

export const useArtisans = () => {
  return useQuery({
    queryKey: ['artisans'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/artisans`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch artisans')
      }
      
      const artisans: Artisan[] = await response.json()
      return artisans.map(transformArtisan)
    }
  })
}

export const useArtisan = (id: string) => {
  return useQuery({
    queryKey: ['artisan', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/artisans/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch artisan')
      }
      
      const artisan: Artisan = await response.json()
      return transformArtisan(artisan)
    },
    enabled: !!id
  })
}
