import { validateCredentials } from '../src/utils/validation';

describe('validateCredentials', () => {

  test('acepta usuario y contraseña válida', () => {
    expect(
      validateCredentials('gonzalo', '123456')
    ).toBe(true);
  });

  test('rechaza contraseña menor a 6 caracteres', () => {
    expect(
      validateCredentials('gonzalo', '123')
    ).toBe(false);
  });

});