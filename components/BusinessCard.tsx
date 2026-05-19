import React from 'react'
import Badge from './Badge'
import { MapPin, Phone, MessageCircle, Star } from 'lucide-react'

interface BusinessCardProps {
  id: string
  name: string
  category: string
  image?: string
  address: string
  distance?: string
  phone: string
  whatsapp: string
  rating?: number
  reviews?: number
  isOpen?: boolean
  discount?: string
  onWhatsappClick?: () => void
  onCallClick?: () => void
  onMapClick?: () => void
}

const BusinessCard = ({
  name,
  category,
  image,
  address,
  distance,
  phone,
  whatsapp,
  rating,
  reviews,
  isOpen = true,
  discount,
  onWhatsappClick,
  onCallClick,
  onMapClick,
}: BusinessCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-linares overflow-hidden hover:shadow-linares-lg transition-shadow duration-200 flex flex-col h-full">
      {/* Imagen */}
      <div className="relative w-full h-48 bg-gradient-to-br from-[#F9F8F6] to-[#E8E4DE] overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-[#8E8279] text-4xl">📦</div>
          </div>
        )}
        
        {/* Badge de descuento o estado */}
        <div className="absolute top-3 right-3 flex gap-2">
          {discount && (
            <Badge label={discount} status="highlight" />
          )}
          {isOpen && (
            <Badge label="Abierto" status="open" />
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Categoría */}
        <p className="text-xs font-medium text-[#8E8279] uppercase tracking-wide mb-1">
          {category}
        </p>

        {/* Nombre */}
        <h3 className="text-lg font-bold text-[#1A1410] mb-2 line-clamp-2">
          {name}
        </h3>

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(rating) ? 'fill-[#C05A46] text-[#C05A46]' : 'text-[#D4C9BE]'}
                />
              ))}
            </div>
            <span className="text-xs text-[#8E8279]">
              {rating} {reviews && `(${reviews})`}
            </span>
          </div>
        )}

        {/* Dirección y distancia */}
        <div className="flex items-start gap-2 text-sm text-[#8E8279] mb-3">
          <MapPin size={16} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="line-clamp-1">{address}</p>
            {distance && <p className="text-xs font-medium text-[#2B6E80]">{distance}</p>}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-auto flex gap-2 pt-3 border-t border-[#E8E4DE]">
          <button
            onClick={onWhatsappClick}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#25D366] hover:bg-[#1fa752] text-white rounded-lg font-medium text-sm transition-colors"
          >
            <MessageCircle size={16} />
            Chat
          </button>
          <button
            onClick={onCallClick}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#2B6E80] hover:bg-[#265d70] text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Phone size={16} />
            Llamar
          </button>
          <button
            onClick={onMapClick}
            className="flex-1 flex items-center justify-center gap-2 py-2 border-2 border-[#2B6E80] text-[#2B6E80] hover:bg-[#2B6E80]/5 rounded-lg font-medium text-sm transition-colors"
          >
            📍
          </button>
        </div>
      </div>
    </div>
  )
}

export default BusinessCard
