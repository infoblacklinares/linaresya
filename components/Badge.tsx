import React from 'react'

interface BadgeProps {
  label: string
  status: 'open' | 'closed' | 'highlight' | 'new'
  icon?: React.ReactNode
}

const Badge = ({ label, status, icon }: BadgeProps) => {
  const statusStyles = {
    open: 'bg-[#3D5A45]/10 text-[#3D5A45] border border-[#3D5A45]/20',
    closed: 'bg-[#8E8279]/10 text-[#8E8279] border border-[#8E8279]/20',
    highlight: 'bg-[#C05A46]/10 text-[#C05A46] border border-[#C05A46]/20',
    new: 'bg-[#2B6E80]/10 text-[#2B6E80] border border-[#2B6E80]/20',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </span>
  )
}

export default Badge
