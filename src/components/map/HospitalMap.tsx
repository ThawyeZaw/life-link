"use client";

import { useCallback, type MouseEvent as ReactMouseEvent } from "react";
import Map, { Marker, NavigationControl, Popup } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  Activity,
  Building2,
  Droplets,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";

import { useT } from "@/i18n";
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
  onSelect: (hospital: Hospital | null) => void;
}) => {
  const { t } = useT();
  const selectedRequests = selected
    ? (requestsByHospital.get(selected.id) ?? [])
    : [];

  const handleMapClick = useCallback(() => {
    if (selected) {
      onSelect(null);
    }
  }, [onSelect, selected]);

  const handleMarkerClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>, hospital: Hospital) => {
      event.preventDefault();
      event.stopPropagation();

      if (selected?.id !== hospital.id) {
        onSelect(hospital);
      }
    },
    [onSelect, selected?.id],
  );

  const handlePopupClose = useCallback(() => {
    if (selected) {
      onSelect(null);
    }
  }, [onSelect, selected]);

  return (
    <div className="relative h-full min-h-[500px] w-full overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: 96.15,
          latitude: 16.83,
          zoom: 10.5,
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        onClick={handleMapClick}
      >
        <NavigationControl position="top-right" showCompass showZoom />

        {hospitals.map((hospital) => {
          const requests = requestsByHospital.get(hospital.id) ?? [];

          const hasRequests = requests.length > 0;
          const isSelected = selected?.id === hospital.id;

          return (
            <Marker
              key={hospital.id}
              longitude={hospital.lng}
              latitude={hospital.lat}
              anchor="center"
            >
              <button
                type="button"
                onClick={(event) => handleMarkerClick(event, hospital)}
                aria-label={`View ${hospital.name}`}
                aria-pressed={isSelected}
                className="group relative flex cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-red-300"
              >
                {hasRequests ? (
                  <>
                    <span className="absolute h-14 w-14 animate-ping rounded-full bg-red-400/20" />

                    <span
                      className={`absolute h-14 w-14 rounded-full border transition duration-300 ${
                        isSelected
                          ? "scale-110 border-red-400 bg-red-100/90"
                          : "border-red-200 bg-red-50/80 group-hover:scale-110"
                      }`}
                    />

                    <span
                      className={`relative flex h-11 min-w-11 items-center justify-center rounded-full border-2 border-white bg-red-600 px-2 text-[10px] font-black text-white shadow-[0_10px_28px_rgba(220,38,38,0.35)] transition duration-200 group-hover:scale-105 ${
                        isSelected ? "scale-105 ring-4 ring-red-200" : ""
                      }`}
                    >
                      {requests.length > 1
                        ? `${requests.length}×`
                        : requests[0].blood_type}
                    </span>

                    <span className="pointer-events-none absolute top-[calc(100%+8px)] hidden whitespace-nowrap rounded-lg bg-slate-950 px-2 py-1 text-[9px] font-bold text-white shadow-lg group-hover:block">
                      {hospital.name}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={`absolute h-9 w-9 rounded-full border transition duration-200 ${
                        isSelected
                          ? "scale-110 border-slate-400 bg-slate-200"
                          : "border-slate-200 bg-white/90 group-hover:scale-110"
                      }`}
                    />

                    <span
                      className={`relative block h-4 w-4 rounded-full border-2 border-white bg-slate-500 shadow-[0_6px_16px_rgba(15,23,42,0.25)] transition ${
                        isSelected
                          ? "scale-110 ring-4 ring-slate-200"
                          : "group-hover:bg-slate-700"
                      }`}
                    />

                    <span className="pointer-events-none absolute top-[calc(100%+8px)] hidden whitespace-nowrap rounded-lg bg-slate-950 px-2 py-1 text-[9px] font-bold text-white shadow-lg group-hover:block">
                      {hospital.name}
                    </span>
                  </>
                )}
              </button>
            </Marker>
          );
        })}

        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="top"
            offset={30}
            onClose={handlePopupClose}
            closeButton
            closeOnClick={false}
            maxWidth="340px"
            className="lifelink-map-popup"
          >
            <div
              className="max-h-[420px] min-w-[260px] overflow-y-auto overflow-x-hidden rounded-[20px] bg-white sm:min-w-[290px]"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="relative overflow-hidden border-b border-slate-100 bg-[linear-gradient(135deg,#fff1f2_0%,#ffffff_60%,#f8fafc_100%)] px-4 pb-4 pt-4">
                <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-red-100 blur-2xl" />

                <div className="relative flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-[0_10px_24px_rgba(220,38,38,0.24)]">
                    <Building2 className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1 pr-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-emerald-700">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>
                        {t("map.hospitalLabel")}
                      </span>

                      {selectedRequests.length > 0 && (
                        <span className="rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-red-700">
                          {selectedRequests.length} {t("map.active")}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 break-words text-sm font-black leading-5 text-slate-950">
                      {selected.name}
                    </h3>

                    {selected.name_mya && (
                      <p className="mt-0.5 break-words text-xs font-medium text-slate-500">
                        {selected.name_mya}
                      </p>
                    )}

                    {(selected.township || selected.address) && (
                      <div className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-slate-500">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />

                        <p className="break-words">
                          {selected.township ?? ""}
                          {selected.township && selected.address ? " · " : ""}
                          {selected.address ?? ""}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              <div className="space-y-3 p-4">
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone}`}
                    onClick={(event) => event.stopPropagation()}
                    className="group flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                        <Phone className="h-3.5 w-3.5" />
                      </span>

                      <span className="truncate">{selected.phone}</span>
                    </span>

                    <Navigation className="h-3.5 w-3.5 shrink-0 transition group-hover:translate-x-0.5" />
                  </a>
                )}

                {selectedRequests.length > 0 ? (
                  <section className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                        <Activity className="h-3.5 w-3.5 text-red-500" />
                        {t("map.emergencyNeeds")}
                      </p>

                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] text-red-600">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                        </span>
                        {t("map.live")}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedRequests.map((request) => (
                        <div
                          key={request.id}
                          className="rounded-2xl border border-red-100 bg-red-50/70 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 px-2 text-xs font-black text-white shadow-sm">
                              {request.blood_type}
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black text-slate-900">
                                {request.units_needed} unit
                                {request.units_needed > 1 ? "s" : ""} needed
                              </p>

                              <p className="mt-0.5 truncate text-[10px] font-black uppercase tracking-[0.08em] text-red-600">
                                {request.urgency}
                              </p>
                            </div>

                            <Droplets className="h-4 w-4 shrink-0 text-red-400" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[10px] leading-4 text-amber-800">
                      <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />

                      <span>
                        Call the hospital before travelling to confirm the
                        donation process.
                      </span>
                    </div>
                  </section>
                ) : (
                  <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-500">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                    <span>
                      This hospital currently has no active public blood
                      requests.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      <div className="pointer-events-none absolute left-4 top-4 z-10">
        <div className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.10)] backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>

          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-700">
            Live blood map
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden sm:block">
        <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/90 px-3 py-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.10)] backdrop-blur-xl">
          <MapLegend className="bg-red-600" label="Active request" />

          <span className="h-4 w-px bg-slate-200" />

          <MapLegend className="bg-slate-500" label="Hospital" />
        </div>
      </div>
    </div>
  );
};

const MapLegend = ({
  className,
  label,
}: {
  className: string;
  label: string;
}) => (
  <div className="flex items-center gap-1.5">
    <span
      className={`h-3 w-3 rounded-full border-2 border-white shadow-sm ${className}`}
    />

    <span className="text-[10px] font-bold text-slate-600">{label}</span>
  </div>
);
