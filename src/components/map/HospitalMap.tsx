"use client";

import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Phone, Hospital as HospitalIcon } from "lucide-react";
import type { Hospital } from "@/lib/types";
import type { MapRequest } from "./MapExplorer";

export const HospitalMap = ({
  hospitals,
  requestsByHospital,
  selected,
  onSelect,
}: {
  hospitals: Hospital[];
  requestsByHospital: Map<string, MapRequest[]>;
  selected: Hospital | null;
  onSelect: (h: Hospital | null) => void;
}) => {
  const selectedRequests = selected ? requestsByHospital.get(selected.id) ?? [] : [];

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{ longitude: 96.15, latitude: 16.83, zoom: 10.5 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/light-v11"
    >
      <NavigationControl position="top-right" />

      {hospitals.map((h) => {
        const reqs = requestsByHospital.get(h.id);
        return (
          <Marker
            key={h.id}
            longitude={h.lng}
            latitude={h.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelect(h);
            }}
          >
            {reqs ? (
              <span className="animate-pulse-marker flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-red-600 text-[10px] font-bold text-white shadow-lg">
                {reqs.length > 1 ? `${reqs.length}×` : reqs[0].blood_type}
              </span>
            ) : (
              <span className="block h-3 w-3 cursor-pointer rounded-full border border-white bg-slate-400 shadow" />
            )}
          </Marker>
        );
      })}

      {selected && (
        <Popup
          longitude={selected.lng}
          latitude={selected.lat}
          anchor="bottom"
          offset={20}
          onClose={() => onSelect(null)}
          closeButton
          className="min-w-56"
        >
          <div className="flex flex-col gap-1.5 p-1">
            <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <HospitalIcon className="h-4 w-4 shrink-0 text-red-600" /> {selected.name}
            </p>
            {selected.township && <p className="text-xs text-slate-500">{selected.township}</p>}
            {selected.phone && (
              <a href={`tel:${selected.phone}`} className="flex items-center gap-1 text-xs font-medium text-red-600">
                <Phone className="h-3 w-3" /> {selected.phone}
              </a>
            )}
            {selectedRequests.length > 0 && (
              <div className="mt-1 flex flex-col gap-1 border-t border-slate-100 pt-1.5">
                {selectedRequests.map((r) => (
                  <p key={r.id} className="text-xs text-slate-700">
                    <span className="font-bold text-red-600">{r.blood_type}</span>
                    {" · "}{r.units_needed} unit{r.units_needed > 1 ? "s" : ""} · {r.urgency}
                  </p>
                ))}
                <p className="text-[10px] text-slate-400">
                  Walk in or call the hospital to donate for this request.
                </p>
              </div>
            )}
          </div>
        </Popup>
      )}
    </Map>
  );
};
