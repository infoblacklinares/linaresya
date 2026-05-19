'use client'

import React, { useState } from 'react'
import SearchBar from '@/components/SearchBar'
import BusinessCard from '@/components/BusinessCard'

// Mock data de ejemplo
const MOCK_BUSINESSES = [
  {
    id: '1',
    name: 'Ferretería El Candado',
    category: 'Construcción',
    address: 'Independencia 456, Linares',
    distance: '0.8 km',
    phone: '+56973661593',
    whatsapp: '+56973661593',
    rating: 4.5,
    reviews: 23,
    isOpen: true,
    discount: '20% desc lunes',
  },
  {
    id: '2',
    name: 'Confitería Wippy',
    category: 'Gastronomía',
    address: 'Brasil 123, Linares',
    distance: '1.2 km',
    phone: '+56973661593',
    whatsapp: '+56973661593',
    rating: 4.8,
    reviews: 45,
    isOpen: true,
  },
  {
    id: '3',
    name: 'Tienda Germani',
    category: 'Almacenes',
    address: 'Maipú 789, Linares',
    distance: '0.5 km',
    phone: '+56973661593',
    whatsapp: '+56973661593',
    rating: 4.3,
    reviews: 67,
    isOpen: true,
  },
  {
    id: '4',
    name: 'Centro Digital Linares',
    category: 'Servicios',
    address: 'Arturo Prat 234, Linares',
    distance: '1.5 km',
    phone: '+56973661593',
    whatsapp: '+56973661593',
    rating: 4.6,
    reviews: 12,
    isOpen: true,
  },
  {
    id: '5',
    name: 'Mueblería Rocha',
    category: 'Construcción',
    address: 'Yerbas Buenas, Linares',
    distance: '2.1 km',
    phone: '+56973661593',
    whatsapp: '+56973661593',
    rating: 4.7,
    reviews: 34,
    isOpen: true,
    discount: '10% desc muebles',
  },
  {
    id: '6',
    name: 'Hospedaje Alcázar',
    category: 'Gastronomía',
    address: 'Enero 345, Linares',
    distance: '2.3 km',
    phone: '+56973661593',
    whatsapp: '+56973661593',
    rating: 4.4,
    reviews: 28,
    isOpen: true,
  },
]

const CATEGORIES = [
  { name: 'Alimentación', icon: '🥗' },
  { name: 'Servicios', icon: '🔧' },
  { name: 'Construcción', icon: '🏗️' },
  { name: 'Gastronomía', icon: '🍽️' },
  { name: 'Salud', icon: '⚕️' },
  { name: 'Educación', icon: '📚' },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('')

  const filteredBusinesses = MOCK_BUSINESSES.filter((business) => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !activeCategory || business.category === activeCategory

    return matchesSearch && matchesCategory
  })

  return (
    <main className="min-h-screen bg-[#F9F8F6]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2B6E80] to-[#1f5268] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
            El Centro de Linares en tu bolsillo
          </h1>
          <p className="text-lg text-blue-100 mb-8">
            Descubre los mejores negocios, servicios y oficios de tu comuna. Directo, sin intermediarios.
          </p>

          {/* Buscador */}
          <SearchBar
            onSearch={setSearchQuery}
            onFilterClick={() => console.log('Filtros')}
            placeholder="¿Qué buscas en Linares?"
          />
        </div>
      </section>

      {/* Categorías */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
              !activeCategory
                ? 'bg-[#2B6E80] text-white'
                : 'bg-white text-[#2B6E80] border-2 border-[#2B6E80] hover:bg-[#2B6E80]/5'
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors flex items-center gap-2 ${
                activeCategory === cat.name
                  ? 'bg-[#C05A46] text-white'
                  : 'bg-white text-[#1A1410] border-2 border-[#E8E4DE] hover:border-[#C05A46]'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Publicidad Destacada */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-gradient-to-r from-[#C05A46] to-[#a84d3a] text-white rounded-xl p-6 sm:p-8 shadow-linares">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black mb-2">Ferretería El Candado</h2>
            <p className="text-orange-100 mb-4">Todos los materiales de construcción que necesitas</p>
            <button className="bg-white text-[#C05A46] px-6 py-2 rounded-lg font-bold hover:bg-orange-50 transition">
              ✨ 20% de descuento - Lunes
            </button>
          </div>
        </div>
      </section>

      {/* Grid de Negocios */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-[#1A1410] mb-2">
            {searchQuery
              ? `Resultados para "${searchQuery}"`
              : activeCategory
                ? `${activeCategory}`
                : 'Todos los negocios'}
          </h2>
          <p className="text-[#8E8279]">
            {filteredBusinesses.length} negocio{filteredBusinesses.length !== 1 ? 's' : ''} encontrado
            {filteredBusinesses.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <BusinessCard
                key={business.id}
                {...business}
                onWhatsappClick={() =>
                  window.open(
                    `https://wa.me/${business.whatsapp.replace(/\D/g, '')}?text=Hola, vi tu negocio en Linares Conectado`,
                    '_blank'
                  )
                }
                onCallClick={() => window.open(`tel:${business.phone}`)}
                onMapClick={() => console.log('Abrir mapa')}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#8E8279] text-lg">No encontramos negocios con esos criterios</p>
          </div>
        )}
      </section>
    </main>
  )
}
