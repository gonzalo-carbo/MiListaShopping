import { create } from 'zustand';

import {
  persist,
  createJSONStorage,
} from 'zustand/middleware';

import AsyncStorage from '@react-native-async-storage/async-storage';


export type Product = {
  id: string;
  name: string;
  imageUri?: string;
  latitude?: number;
  longitude?: number;
  supplierName?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  calendarReminderCreated?: boolean;
};


type ProductStore = {

  products: Product[];

  addProduct: (
    product: Product
  ) => void;

  removeProduct: (
    id: string
  ) => void;

  updateProduct: (
    id: string,
    changes: Partial<Product>
  ) => void;

};


export const useProductStore =
  create<ProductStore>()(

    persist(

      (set) => ({

        products: [],


        addProduct: (
          product: Product
        ) =>

          set((state) => ({

            products: [
              ...state.products,
              product,
            ],

          })),


        removeProduct: (
          id: string
        ) =>

          set((state) => ({

            products:
              state.products.filter(
                (product) =>
                  product.id !== id
              ),

          })),


        updateProduct: (
          id: string,
          changes: Partial<Product>
        ) =>

          set((state) => ({

            products:
              state.products.map(
                (product) =>

                  product.id === id

                    ? {
                        ...product,
                        ...changes,
                      }

                    : product

              ),

          })),

      }),


      {

        name: '@productos_zustand',

        storage:
          createJSONStorage(
            () => AsyncStorage
          ),

      }

    )

  );