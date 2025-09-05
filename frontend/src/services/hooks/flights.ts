import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFlights, uploadFlights } from "../flights";
import type { Page, Flight, UploadResponse } from "../../types/types";

export function useFlights(page: number, pageSize: number, filter: string) {
  return useQuery<Page<Flight>, Error>({
    queryKey: ["flights", page, pageSize, filter],
    queryFn: () => fetchFlights({ page, pageSize, filter }),
  });
}

export function useUploadFlights() {
  const qc = useQueryClient();
  return useMutation<UploadResponse, Error, File>({
    mutationFn: (file) => uploadFlights(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["flights"] });
    },
  });
}

