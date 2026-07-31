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

  /** Turn a GeolocationPositionError into something the farmer can act on. */
  const explainGeoError = (err) => {
    switch (err?.code) {
      case 1: // PERMISSION_DENIED
        return 'Location permission denied. Allow location for this site (click the icon in the address bar), or tap the map to place the pin yourself.'
      case 3: // TIMEOUT
        return 'Locating took too long. Try again, or tap the map to place the pin yourself.'
      case 2: // POSITION_UNAVAILABLE
      default:
        return 'Your device could not provide a location. On a Mac, check System Settings → Privacy & Security → Location Services is on for your browser. Otherwise just tap the map to place the pin.'
    }
  }

  const useMyLocation = () => {
    setGeoError('')
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser. Tap the map instead.')
      return
    }
    // Geolocation is blocked outside a secure context, which silently bites when
    // the site is opened over plain http (e.g. a LAN IP on a phone).
    if (window.isSecureContext === false) {
      setGeoError('Location needs a secure (https) connection. Tap the map to place the pin instead.')
      return
    }

    setLocating(true)

    const onSuccess = (pos) => {
      const { latitude, longitude } = pos.coords
      mapRef.current?.setView([latitude, longitude], 16)
      setPin(latitude, longitude)
      setLocating(false)
    }

    // Desktops usually have no GPS radio, so a high-accuracy request often fails
    // outright. Fall back to the coarse (wifi/IP) fix, which is plenty for
    // picking a field on a map, before giving up.
    const tryCoarse = (highAccuracyErr) => {
      navigator.geolocation.getCurrentPosition(onSuccess, (err) => {
        setGeoError(explainGeoError(err.code === 1 ? err : highAccuracyErr || err))
        setLocating(false)
      }, { enableHighAccuracy: false, timeout: 20000, maximumAge: 300000 })
    }

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (err) => {
        // A denied permission will not be fixed by retrying.
        if (err.code === 1) {
          setGeoError(explainGeoError(err))
          setLocating(false)
          return
        }
        tryCoarse(err)
      },
      { enableHighAccuracy: true, timeout: 8000 }
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

      <div className="mt-2 text-xs">
        <span className="flex items-center gap-1 text-slate-600">
          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
          {value?.latitude != null
            ? `${value.latitude}, ${value.longitude}`
            : 'No location selected yet'}
        </span>
        {geoError && (
          <p className="mt-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-amber-800">
            {geoError}
          </p>
        )}
      </div>
    </div>
  )
}
