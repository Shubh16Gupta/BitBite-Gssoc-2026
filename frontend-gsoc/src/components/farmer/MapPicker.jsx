/**
 * Map-based GPS picker (Leaflet + OpenStreetMap — free, no API key).
 * The farmer clicks the map to drop a pin, or uses their device location.
 * These coordinates are stored on the Field and drive the weather + rainfall
 * lookups for every crop-cycle phase.
 */
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, LocateFixed } from 'lucide-react'

const DEFAULT_CENTER = [22.9734, 78.6569] // India
const DEFAULT_ZOOM = 4

export default function MapPicker({ value, onChange, height = 280 }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState('')

  // Keep the latest callback without re-initialising the map.
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const setPin = (lat, lng) => {
    const map = mapRef.current
    if (!map) return
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      markerRef.current = L.circleMarker([lat, lng], {
        radius: 9,
        color: '#065f46',
        weight: 2,
        fillColor: '#10b981',
        fillOpacity: 1,
      }).addTo(map)
    }
    onChangeRef.current?.(Number(lat.toFixed(6)), Number(lng.toFixed(6)))
  }

  useEffect(() => {
    if (mapRef.current) return
    const hasValue = value?.latitude != null && value?.longitude != null
    const map = L.map(containerRef.current).setView(
      hasValue ? [value.latitude, value.longitude] : DEFAULT_CENTER,
      hasValue ? 15 : DEFAULT_ZOOM
    )
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(map)
    map.on('click', (e) => setPin(e.latlng.lat, e.latlng.lng))
    mapRef.current = map
    if (hasValue) setPin(value.latitude, value.longitude)
    setTimeout(() => map.invalidateSize(), 120)

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const useMyLocation = () => {
    setGeoError('')
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        mapRef.current?.setView([latitude, longitude], 16)
        setPin(latitude, longitude)
        setLocating(false)
      },
      (err) => {
        setGeoError(err.message || 'Could not get your location.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500">Tap the map to mark your field</span>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
        >
          <LocateFixed className="h-3.5 w-3.5" />
          {locating ? 'Locating…' : 'Use my location'}
        </button>
      </div>

      <div
        ref={containerRef}
        style={{ height }}
        className="w-full rounded-xl border border-slate-200 overflow-hidden z-0"
      />

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-slate-600">
          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
          {value?.latitude != null
            ? `${value.latitude}, ${value.longitude}`
            : 'No location selected yet'}
        </span>
        {geoError && <span className="text-red-500">{geoError}</span>}
      </div>
    </div>
  )
}
