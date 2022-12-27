import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stringifyQuery, transformData } from '../utils';

const getSaleInvoices = (query) => axios.get(`/api/sales/invoices?${query}`);
const getSaleInvoiceByNumber = (invoiceNumber) => axios.get(`/api/sales/invoices/${invoiceNumber}`);
const createSaleInvoice = (postBody) => axios.post(`/api/sales/invoices`, postBody)
const updateSaleInvoice = (invoiceNumber, postBody) => axios.patch(`/api/sales/invoices/${invoiceNumber}`, postBody);
const getNewSaleInvoiceNumber = () => axios.get(`/api/sales/new-invoice-number`);
const getCustomers = () => axios.get(`/api/customers`);

export function useCreateSaleInvoice({ onSuccess }) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createSaleInvoice,
        onSuccess: (response, postBody) => {
            queryClient.invalidateQueries({
                queryKey: ["saleInvoice", postBody.invoiceNumber],
            });
            //since stock changed, update products page
            queryClient.invalidateQueries({
                queryKey: ['products'],
                exact: true,
            });
            queryClient.invalidateQueries({
                queryKey: ["customerList"],
            });
            onSuccess(response, postBody);
        }
    });
}

export function useUpdateSaleInvoice({ onSuccess, onError }) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => updateSaleInvoice(data.invoiceNumber, {
            invoiceStatus: data.invoiceStatus,
            payment: data.payment,
        }),
        onSuccess: (response, postBody) => {
            queryClient.invalidateQueries({
                queryKey: ["saleInvoice", postBody.invoiceNumber],
            });
            //update sale table
            queryClient.invalidateQueries({
                queryKey: ["saleInvoiceList"],
            });
            //since stock changed, update products page
            if (postBody.invoiceStatus === "cancelled") {
                queryClient.invalidateQueries({
                    queryKey: ['products'],
                    exact: true,
                });
            }
            onSuccess(response, postBody);
        },
        onError: onError,
    });
}

export function useSaleInvoiceList({ query, onSuccess }) {
    return useQuery({
        queryKey: ["saleInvoiceList", query],
        queryFn: () => getSaleInvoices(stringifyQuery(query)),
        select: (result) => transformData(result, query.page_size),
        onSuccess: (result) => onSuccess(result),
        keepPreviousData: true,
    });
}

export function useSaleInvoice({ invoiceNumber, enabled }) {
    return useQuery({
        queryKey: ["saleInvoice", invoiceNumber],
        queryFn: () => getSaleInvoiceByNumber(invoiceNumber),
        select: (data) => data.data,
        enabled: enabled,
    });
}

export function useNewSaleInvoiceNumber({ enabled }) {
    return useQuery({
        queryKey: ["saleInvoiceNumber"],
        queryFn: getNewSaleInvoiceNumber,
        select: (data) => data.data.invoiceNumber,
        placeholder: 0,
        enabled: enabled,
    });
}

export function useCustomerList() {
    return useQuery({
        queryKey: ["customerList"],
        queryFn: getCustomers,
        select: (data) => data.data.map(customer => ({
            ...customer,
            label: customer.contact,
            value: customer.contact,
        })),
        placeholder: [],
    });
}