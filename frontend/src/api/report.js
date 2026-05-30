import axios from 'axios';
import { useQuery } from "@tanstack/react-query";

const getItemHistory = (itemCode) => axios.get(`/api/reports/item-history/${itemCode}`);

export function useItemHistory({ itemCode, enabled }) {
    return useQuery({
        queryKey: ["itemHistory", itemCode],
        queryFn: () => getItemHistory(itemCode),
        select: (data) => data.data,
        enabled: enabled,
    });
}
