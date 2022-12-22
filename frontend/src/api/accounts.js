import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stringifyQuery, transformData } from '../utils';

const getTransactions = (query) => axios.get(`/api/transactions?${query}`);
const createTransaction = (postBody) => axios.post(`/api/transactions`, postBody);
const getHeaders = () => axios.get(`/api/headers`);
const createHeader = (postBody) => axios.post(`/api/headers`, postBody);

export function useTransactionList({ query }) {
    return useQuery({
        queryKey: ["transactionList", query],
        queryFn: () => getTransactions(stringifyQuery(query)),
        select: (result) => transformData(result, query.page_size),
        keepPreviousData: true,
    });
}

export function useCreateTransaction({ onSuccess }) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTransaction,
        onSuccess: (response, postBody) => {
            //update transactions table
            queryClient.invalidateQueries({
                queryKey: ["transactionList"],
            });
            onSuccess(response, postBody);
        }
    });
}

export function useHeaderList({ onSuccess, onError }) {
    return useQuery({
        queryKey: ["headerList"],
        queryFn: getHeaders,
        select: (response) => response.data,
        onSuccess: onSuccess,
        onError: onError,
        refetchOnWindowFocus: false,
    });
}

export function useCreateHeader({ onSuccess }) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createHeader,
        onSuccess: (response, postBody) => {
            queryClient.invalidateQueries({
                queryKey: ["headerList"],
            });
            onSuccess(response, postBody);
        },
    });
}