jest.mock(
  '@react-native-async-storage/async-storage',
  () =>
    require(
      '@react-native-async-storage/async-storage/jest/async-storage-mock'
    )
);


import {
  Product,
  useProductStore,
} from '../productStore';


beforeEach(() => {

  useProductStore.setState({
    products: [],
  });

});


describe('productStore', () => {

  test(
    'inicia con la lista de productos vacía',
    () => {

      const products =
        useProductStore
          .getState()
          .products;


      expect(products)
        .toEqual([]);

    }
  );


  test(
    'agrega un producto correctamente',
    () => {

      const product: Product = {
        id: '1',
        name: 'Leche',
      };


      useProductStore
        .getState()
        .addProduct(product);


      const products =
        useProductStore
          .getState()
          .products;


      expect(products)
        .toHaveLength(1);


      expect(
        products[0].name
      ).toBe('Leche');

    }
  );


  test(
    'elimina un producto correctamente',
    () => {

      const product: Product = {
        id: '1',
        name: 'Pan',
      };


      useProductStore
        .getState()
        .addProduct(product);


      useProductStore
        .getState()
        .removeProduct('1');


      const products =
        useProductStore
          .getState()
          .products;


      expect(products)
        .toHaveLength(0);

    }
  );


  test(
    'actualiza un producto correctamente',
    () => {

      const product: Product = {
        id: '1',
        name: 'Arroz',
      };


      useProductStore
        .getState()
        .addProduct(product);


      useProductStore
        .getState()
        .updateProduct(
          '1',
          {
            name:
              'Arroz integral',
          }
        );


      const products =
        useProductStore
          .getState()
          .products;


      expect(
        products[0].name
      ).toBe(
        'Arroz integral'
      );

    }
  );

});