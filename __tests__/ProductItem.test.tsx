import React from 'react';

import {
  render,
  fireEvent,
  screen,
} from '@testing-library/react-native';

import ProductItem from '../src/components/ProductItem';

describe('ProductItem', () => {

  test('muestra el nombre del producto', async () => {

    await render(
      <ProductItem
        name="Leche"
        onDelete={() => {}}
      />
    );

    expect(
      screen.getByText('Leche')
    ).toBeTruthy();

  });


  test('ejecuta onDelete al pulsar Eliminar', async () => {

    const onDelete = jest.fn();

    await render(
      <ProductItem
        name="Pan"
        onDelete={onDelete}
      />
    );

    await fireEvent.press(
      screen.getByText('Eliminar')
    );

    expect(
      onDelete
    ).toHaveBeenCalled();

  });

});