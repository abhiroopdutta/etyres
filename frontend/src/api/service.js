import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stringifyQuery, transformData } from '../utils';

const getServiceInvoices = (query) => axios.get(`/api/notax/invoices?${query}`);
const createServiceInvoice = (postBody) => axios.post(`/api/notax/invoices`, postBody)
const deleteServiceInvoice = (invoiceNumber) => axios.delete(`/api/notax/invoices/${invoiceNumber}`);

export function useCreateServiceInvoice({ onSuccess, onError }) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createServiceInvoice,
        onSuccess: (response, postBody) => {
            queryClient.invalidateQueries({
                queryKey: ["serviceInvoiceList"],
            });
            onSuccess(response, postBody);
        },
        onError: onError,
    });
}

export function useServiceInvoiceList({ query }) {
    return useQuery({
        queryKey: ["serviceInvoiceList", query],
        queryFn: () => getServiceInvoices(stringifyQuery(query)),
        select: (result) => transformData(result, query.page_size),
        keepPreviousData: true,
    });
}

export function useDeleteServiceInvoice({ onSuccess }) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteServiceInvoice,
        onSuccess: (response, postBody) => {
            queryClient.invalidateQueries({
                queryKey: ["serviceInvoiceList"],
            });
            onSuccess(response, postBody)
        },
    });
}