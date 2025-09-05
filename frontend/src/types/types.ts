export type Flight = {
  id: string;
  flightNumber: string;
  scheduledArrivalTimeUtc: string;
  originAirport: string;
  destinationAirport: string;
  createdAt?: string;
  lastWorkOrderAt?: string;
};

export type ParsedWorkOrder = {
  chk?: number;
  bag?: number;
  clean?: number;
  pbb?: 0 | 90 | 180 | 270;
};

export type WorkOrder = {
  id: string;
  flightId: string;
  raw: string;
  parsed?: ParsedWorkOrder;
  error?: string;
  createdAt: string;
  updatedAt?: string | null;
};

export type Page<T> = {
  items: T[];
  total: number;
  page: number;      // 1-based
  pageSize: number;
};

// check usage
export type FlightsApiResponse<TItem> = {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  items: TItem[];
};

export type UploadResponse = {
  count: number;
  errors: string[];
};

// Mapper to your UI's Page<T> shape
export function mapFlightsPage<TItem>(
  r: FlightsApiResponse<TItem>
): { items: TItem[]; total: number; page: number; pageSize: number } {
  return {
    items: r.items,
    total: r.totalCount,
    page: r.pageNumber,
    pageSize: r.pageSize,
  };
}

// Work orders API types
export type WorkOrderPreview = {
  id: string;
  raw: string;
  parsed?: ParsedWorkOrder | null;
  createdAt?: string;
  updatedAt?: string | null;
};

export type FlightWorkOrdersApiResponse = {
  id: string;
  flightNumber: string;
  scheduledArrivalUtc: string;
  originAirport: string;
  destinationAirport: string;
  workOrdersPreview: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    items: WorkOrderPreview[];
  };
  activeWorkOrder?: WorkOrderPreview | null;
};
