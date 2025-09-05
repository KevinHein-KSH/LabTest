import { http } from "./http";
import type { Page, WorkOrder, FlightWorkOrdersApiResponse, WorkOrderPreview } from "../types/types";

export async function fetchWorkOrdersByFlight(params: {
  flightId: string;
  page: number;
  pageSize: number;
}): Promise<FlightWorkOrdersApiResponse> {
  const res = await http.get<FlightWorkOrdersApiResponse>(
    `/WorkOrder/flight/${params.flightId}`,
    { params: { pageNumber: params.page, pageSize: params.pageSize } }
  );
  return res.data;
}

export function mapPreviewToWorkOrder(flightId: string, p: WorkOrderPreview): WorkOrder {
  return {
    id: p.id,
    flightId,
    raw: p.raw,
    parsed: p.parsed ?? undefined,
    createdAt: p.createdAt ?? new Date().toISOString(),
    updatedAt: p.updatedAt ?? null,
  };
}

export function mapResponseToPage(flightId: string, r: FlightWorkOrdersApiResponse): Page<WorkOrder> {
  const items = r.workOrdersPreview.items.map((p) => mapPreviewToWorkOrder(flightId, p));
  return {
    items,
    total: r.workOrdersPreview.totalCount,
    page: r.workOrdersPreview.pageNumber,
    pageSize: r.workOrdersPreview.pageSize,
  };
}

export async function submitWorkOrder(flightId: string, raw: string): Promise<WorkOrder> {
  const res = await http.post<WorkOrderPreview>(`/WorkOrder/${flightId}`, { raw });
  return mapPreviewToWorkOrder(flightId, res.data);
}
