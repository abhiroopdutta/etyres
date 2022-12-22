import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stringifyQuery, transformData } from '../utils';

const getProducts = () => axios.get(`/api/products`);
const createProduct = (postBody) => axios.post(`/api/products`, postBody);
const updateProducts = () => axios.patch(`/api/products`);

export function useCreateProduct({ onSuccess }) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createProduct,
        onSuccess: (response, postBody) => {
            //since inventory changed, update products page
            queryClient.invalidateQueries({
                queryKey: ['products'],
                exact: true,
            });
            onSuccess(response, postBody);
        }
    });
}

export function useProductList({ onSuccess = () => null }) {
    return useQuery({
        queryKey: ["products"],
        queryFn: getProducts,
        select: (data) => {
            let result = data.data;
            return result.map(item => ({
                ...item,
                label: item.itemDesc,
                value: item.itemCode,
            }));
        },
        placeholder: [],
        onSuccess: onSuccess,
    });
}

export function useUpdateProductList({ onSuccess, onError }) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProducts,
        onSuccess: (response, postBody) => {
            //since stock changed, update products page
            queryClient.invalidateQueries({
                queryKey: ['products'],
                exact: true,
            });
            onSuccess(response, postBody);
        },
        onError: onError,
    });
}