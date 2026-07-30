import React from 'react'

export default function Card({ 
  children, 
  className = '', 
  title,
  subtitle,
  actions,
  ...props 
}) {
  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 ${className}`} {...props}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-secondary-200 flex justify-between items-center">
          <div>
            {title && <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>}
            {subtitle && <p className="text-sm text-secondary-600">{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}