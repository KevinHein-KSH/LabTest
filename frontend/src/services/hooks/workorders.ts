import { useQuery } from "@tanstack/react-query";
import { fetchWorkOrdersByFlight, mapResponseToPage, mapPreviewToWorkOrder } from "../workorders";
import type { Page, WorkOrder } from "../../types/types";

export function useWorkOrdersByFlight(flightId?: string, page: number = 1, pageSize: number = 10) {
  return useQuery<{ page: Page<WorkOrder>; active: WorkOrder | null }, Error>({
    queryKey: ["workorders", flightId, page, pageSize],
    queryFn: async () => {
      const r = await fetchWorkOrdersByFlight({ flightId: flightId!, page, pageSize });
      const pageMapped = mapResponseToPage(flightId!, r);
      const active = r.activeWorkOrder ? mapPreviewToWorkOrder(flightId!, r.activeWorkOrder) : null;
      return { page: pageMapped, active };
    },
    enabled: !!flightId,
  });
}

