import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stringifyQuery, transformData } from '../utils';

const getPurchaseInvoices = (query) => axios.get(`/api/purchases/invoices?${query}`);
const createPurchaseInvoice = (postBody) => axios.post(`/api/purchases/invoices`, postBody)
const updatePurchaseInvoice = (invoiceNumber, postBody) => axios.patch(`/api/purchases/invoices/${invoiceNumber}`, postBody);
const getSuppliers = () => axios.get(`/api/suppliers`);

export function useCreatePurchaseInvoice({ onSuccess }) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createPurchaseInvoice,
        onSuccess: (response, postBody) => {
            //since stock changed, update products page
            queryClient.invalidateQueries({
                queryKey: ['products'],
                exact: true,
            });
            //update purchase table
            queryClient.invalidateQueries({
                queryKey: ["purchaseInvoiceList"],
            });
            queryClient.invalidateQueries({
                queryKey: ["supplierList"],
            });
            onSuccess(response, postBody);
        }
    });
}

export function useUpdatePurchaseInvoice({ onSuccess, onError }) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => {
            let postBody = {
                invoiceStatus: data.invoiceStatus
            };
            if (data.invoiceStatus !== "cancelled") {
                postBody.payment = data.payment
            }
            return updatePurchaseInvoice(data.invoiceNumber, postBody)
        },
        onSuccess: (response, postBody) => {
            //update sale table
            queryClient.invalidateQueries({
                queryKey: ["purchaseInvoiceList"],
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

export function usePurchaseInvoiceList({ query, onSuccess }) {
    return useQuery({
        queryKey: ["purchaseInvoiceList", query],
        queryFn: () => getPurchaseInvoices(stringifyQuery(query)),
        select: (result) => transformData(result, query.page_size),
        onSuccess: (result) => onSuccess(result),
        keepPreviousData: true,
    });
}

export function useSupplierList() {
    return useQuery({
        queryKey: ["supplierList"],
        queryFn: getSuppliers,
        select: (data) => data.data.map(supplier => ({
            label: supplier.name,
            value: supplier.name,
            GSTIN: supplier.GSTIN,
        })),
        placeholder: [],
    });
}
