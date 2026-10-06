import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  useFocusEffect,
} from '@react-navigation/native';

const PRODUCTS_KEY = '@productos';

type Product = {
  id: string;
  name: string;
};

type Props = {
  navigation: any;
  onLogout: () => void;
};

export default function HomeScreen({
  navigation,
  onLogout,
}: Props) {

  const [products, setProducts] =
    useState<Product[]>([]);

  const loadProducts = async () => {

    const savedProducts =
      await AsyncStorage.getItem(PRODUCTS_KEY);

    if (savedProducts) {

      const list: Product[] =
        JSON.parse(savedProducts);

      setProducts(list);

    } else {

      setProducts([]);

    }
  };

  useFocusEffect(

    useCallback(() => {

      loadProducts();

    }, [])

  );

  const deleteProduct = async (id: string) => {

    const updatedProducts =
      products.filter(
        (product) => product.id !== id
      );

    setProducts(updatedProducts);

    await AsyncStorage.setItem(
      PRODUCTS_KEY,
      JSON.stringify(updatedProducts)
    );
  };

  const confirmDelete = (
    id: string,
    name: string
  ) => {

    Alert.alert(
      'Eliminar producto',
      `¿Querés eliminar ${name}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteProduct(id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Lista de compras
      </Text>

      <Button
        title="Agregar producto"
        onPress={() =>
          navigation.navigate('AddProduct')
        }
      />

      <FlatList
        style={styles.list}
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <View style={styles.productItem}>

            <Text style={styles.productText}>
              {item.name}
            </Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>
                confirmDelete(
                  item.id,
                  item.name
                )
              }
            >

              <Text style={styles.deleteText}>
                Eliminar
              </Text>

            </TouchableOpacity>

          </View>

        )}
        ListEmptyComponent={

          <Text style={styles.emptyText}>
            No hay productos cargados.
          </Text>

        }
      />

      <Button
        title="Cerrar sesión"
        onPress={onLogout}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },

  title: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 20,
  },

  list: {
    marginTop: 20,
    marginBottom: 20,
  },

  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#eeeeee',
    marginBottom: 10,
    borderRadius: 6,
  },

  productText: {
    fontSize: 18,
  },

  deleteButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },

  deleteText: {
    color: 'white',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#777',
  },

});