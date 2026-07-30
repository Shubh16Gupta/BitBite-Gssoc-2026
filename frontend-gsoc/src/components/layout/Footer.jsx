import { Sprout } from 'lucide-react'

export default function Footer() {  
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-green-400" />
            <span className="text-xs text-gray-400 ml-1">by AnnData</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs text-gray-400">© 2026 AnnData. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}