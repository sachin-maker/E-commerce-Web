import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

import authReducer from "@/app/store/slices/authSlice";
import { productApi, useGetProductsQuery } from "./productApi";

const mockProduct = {
    _id: "product-1",
    title: "Test Product",
    description: "Test product description",
    price: 1000,
    discountPercentage: 10,
    rating: 4.5,
    stock: 20,
    brand: "Test Brand",
    category: "electronics",
    thumbnail: "/images/test-product.jpg",
    images: ["/images/test-product.jpg"],
    isActive: true,
    reviews: [],
};

const createTestStore = () =>
    configureStore({
        reducer: {
            auth: authReducer,
            [productApi.reducerPath]: productApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(productApi.middleware),
    });

describe("productApi integration", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("fetches products and transforms the API response", async () => {
        const mockResponse = {
            success: true,
            products: [mockProduct],
            pagination: {
                currentPage: 2,
                limit: 12,
                totalProducts: 25,
                totalPages: 3,
            },
        };

        jest.spyOn(global, "fetch").mockResolvedValueOnce(
            new Response(JSON.stringify(mockResponse), {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                },
            })
        );

        const store = createTestStore();

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        );

        const { result } = renderHook(
            () =>
                useGetProductsQuery({
                    limit: 12,
                    skip: 12,
                }),
            { wrapper }
        );

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual({
            products: [mockProduct],
            total: 25,
            skip: 12,
            limit: 12,
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);

        const fetchRequest = (global.fetch as jest.Mock).mock.calls[0][0];

        expect(fetchRequest.url).toBe(
            "http://localhost:5000/api/products?limit=12&skip=12"
        );

        expect(fetchRequest.method).toBe("GET");
    });
});