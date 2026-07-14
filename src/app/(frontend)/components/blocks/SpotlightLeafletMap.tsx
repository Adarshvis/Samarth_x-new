'use client'

import React from 'react'
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface SpotlightLeafletMapProps {
  lat: number
  lng: number
  zoom: number
  markerLabel?: string | null
  markerSublabel?: string | null
  accent?: string | null
}

export default function SpotlightLeafletMap({
  lat,
  lng,
  zoom,
  markerLabel,
  markerSublabel,
  accent = '#F59E0B',
}: SpotlightLeafletMapProps) {
  const icon = React.useMemo(
    () =>
      L.divIcon({
        className: 'ch-leaflet-pin',
        html: `<span style="position:relative;display:flex;height:16px;width:16px">
          <span style="position:absolute;inset:0;border-radius:9999px;background:${accent};animation:lpulse 1.4s ease-out infinite"></span>
          <span style="position:relative;height:16px;width:16px;border-radius:9999px;background:#F59E0B;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>
        </span>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    [accent],
  )

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      scrollWheelZoom={false}
      className="w-full h-full rounded-2xl"
      style={{ minHeight: '300px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={icon}>
        {(markerLabel || markerSublabel) && (
          <Tooltip permanent direction="top" offset={[0, -10]} className="ch-spotlight-tooltip">
            {markerLabel && <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>{markerLabel}</div>}
            {markerSublabel && <div style={{ color: '#64748B', fontSize: 11 }}>{markerSublabel}</div>}
          </Tooltip>
        )}
      </Marker>
    </MapContainer>
  )
}
