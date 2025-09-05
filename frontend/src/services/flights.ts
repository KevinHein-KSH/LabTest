import { http } from "./http";
import type { Flight, Page } from "../types/types";
import { mapFlightsPage, UploadResponse, FlightsApiResponse } from "../types/types";

export async function fetchFlights(params: {
  page: number;
  pageSize: number;
  filter?: string;
}): Promise<Page<Flight>> {
  const res = await http.get<FlightsApiResponse<any>>("/Flight", {
    params: {
      pageNumber: params.page,
      pageSize: params.pageSize,
      // If/when backend supports filter, pass it here (adjust param name if needed)
      flightNumber: params.filter?.trim() || undefined,
    },
  });
  const mapped = {
    ...res.data,
    items: res.data.items.map((it: any) => ({
      id: it.id,
      flightNumber: it.flightNumber,
      scheduledArrivalTimeUtc: it.scheduledArrivalTimeUtc,
      originAirport: it.originAirport,
      destinationAirport: it.destinationAirport,
      createdAt: it.createdAt,
      lastWorkOrderAt: it.lastActiveWO ?? it.lastWorkOrderAt ?? null,
    } as Flight)),
  } as FlightsApiResponse<Flight>;
  return mapFlightsPage(mapped);
}

export async function uploadFlights(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await http.post<UploadResponse>("/Flight/bulk-upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
