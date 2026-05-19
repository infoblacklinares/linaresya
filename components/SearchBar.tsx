import React, { useState } from 'react'
import { Search, MapPin } from 'lucide-react'

interface SearchBarProps {
  onSearch?: (query: string) => void
  onFilterClick?: () => void
  placeholder?: string
}

const SearchBar = ({
  onSearch,
  onFilterClick,
  placeholder = '¿Qué buscas en Linares?',
}: SearchBarProps) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(query)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <div className="flex-1 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-4 pr-12 rounded-lg border-2 border-[#E8E4DE] focus:border-[#2B6E80] focus:outline-none transition-colors bg-white text-[#1A1410] placeholder-[#8E8279]"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E8279]" size={20} />
      </div>
      <button
        type="button"
        onClick={onFilterClick}
        className="px-4 py-3 bg-[#2B6E80] hover:bg-[#265d70] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <MapPin size={20} />
        <span className="hidden sm:inline">Filtrar</span>
      </button>
    </form>
  )
}

export default SearchBar
