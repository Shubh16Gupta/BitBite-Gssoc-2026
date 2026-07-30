import { useState, useEffect } from 'react'
import { Search, Filter, Gift, ExternalLink, Tag, Calendar } from 'lucide-react'

export default function Schemes() {
  const [schemes, setSchemes] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchemes()
  }, [])

  const fetchSchemes = async () => {
    setLoading(true)
    try {
      // TODO: API call to fetch government schemes
      const mockSchemes = [
        {
          id: 1,
          name: 'PM-Kisan Samman Nidhi',
          description: 'Income support of ₹6,000 per year to small and marginal farmers',
          type: 'Income Support',
          eligibility: 'Small & marginal farmers',
          amount: '₹6,000/year',
          deadline: '2026-12-31',
          link: '#'
        },
        {
          id: 2,
          name: 'Kisan Credit Card (KCC)',
          description: 'Short-term credit for crop production and working capital',
          type: 'Credit',
          eligibility: 'All farmers',
          amount: 'Up to ₹3L',
          deadline: 'Rolling',
          link: '#'
        },
        {
          id: 3,
          name: 'Pradhan Mantri Fasal Bima Yojana',
          description: 'Crop insurance against natural calamities and crop failure',
          type: 'Insurance',
          eligibility: 'All farmers',
          amount: 'Subsidized premium',
          deadline: '2026-08-15',
          link: '#'
        },
        {
          id: 4,
          name: 'Solar Agriculture Pump Scheme',
          description: 'Subsidized solar pumps for irrigation and sustainable farming',
          type: 'Sustainable',
          eligibility: 'Small farmers',
          amount: '60-80% subsidy',
          deadline: '2026-09-30',
          link: '#'
        }
      ]
      setSchemes(mockSchemes)
    } catch (error) {
      console.error('Failed to fetch schemes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSchemes = schemes.filter(scheme => {
    const matchesFilter = filter === 'all' || scheme.type.toLowerCase() === filter
    const matchesSearch = scheme.name.toLowerCase().includes(search.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getTypeColor = (type) => {
    const colors = {
      'Income Support': 'bg-green-100 text-green-800',
      'Credit': 'bg-blue-100 text-blue-800',
      'Insurance': 'bg-orange-100 text-orange-800',
      'Sustainable': 'bg-purple-100 text-purple-800'
    }
    return colors[type] || 'bg-secondary-100 text-secondary-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Government Schemes</h1>
        <p className="text-secondary-600">Discover schemes tailored for your farming needs</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Search schemes..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'Income Support', 'Credit', 'Insurance', 'Sustainable'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type.toLowerCase())}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === type.toLowerCase()
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredSchemes.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <Gift className="h-16 w-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900">No schemes found</h3>
            <p className="text-secondary-600">Try adjusting your search or filter</p>
          </div>
        ) : (
          filteredSchemes.map((scheme) => (
            <div key={scheme.id} className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-secondary-900">{scheme.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(scheme.type)}`}>
                  {scheme.type}
                </span>
              </div>
              <p className="text-sm text-secondary-600 mb-3">{scheme.description}</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-secondary-700">
                  <Tag className="h-4 w-4 text-secondary-400" />
                  <span>Amount: {scheme.amount}</span>
                </div>
                <div className="flex items-center gap-2 text-secondary-700">
                  <Calendar className="h-4 w-4 text-secondary-400" />
                  <span>Deadline: {scheme.deadline}</span>
                </div>
                <div className="flex items-center gap-2 text-secondary-700">
                  <span className="text-secondary-400">Eligibility: {scheme.eligibility}</span>
                </div>
              </div>
              <a
                href={scheme.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Apply Now <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  )
}