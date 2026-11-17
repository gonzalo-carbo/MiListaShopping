import React from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';

import { useProductStore } from '../stores/productStore';

type Props = {
  navigation: any;
  onLogout: () => void;
};

export default function HomeScreen({
  navigation,
  onLogout,
}: Props) {
  const products = useProductStore(
    (state) => state.products
  );

  const removeProduct = useProductStore(
    (state) => state.removeProduct
  );

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
          onPress: () => removeProduct(id),
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
            {item.imageUri && (
              <Image
                source={{ uri: item.imageUri }}
                style={styles.productImage}
              />
            )}

            <View style={styles.productInfo}>
              <Text style={styles.productText}>
                {item.name}
              </Text>

              {item.latitude !== undefined &&
                item.longitude !== undefined && (
                  <View
                    style={
                      styles.locationContainer
                    }
                  >
                    <Text
                      style={styles.infoTitle}
                    >
                      Ubicación:
                    </Text>

                    <Text
                      style={styles.infoText}
                    >
                      {item.latitude.toFixed(6)},{' '}
                      {item.longitude.toFixed(6)}
                    </Text>
                  </View>
                )}

              {item.supplierName && (
                <View
                  style={
                    styles.supplierContainer
                  }
                >
                  <Text
                    style={styles.infoTitle}
                  >
                    Proveedor:
                  </Text>

                  <Text
                    style={styles.infoText}
                  >
                    {item.supplierName}
                  </Text>

                  {item.supplierPhone && (
                    <Text
                      style={styles.infoText}
                    >
                      Tel: {item.supplierPhone}
                    </Text>
                  )}

                  {item.supplierEmail && (
                    <Text
                      style={styles.infoText}
                    >
                      Email: {item.supplierEmail}
                    </Text>
                  )}
                </View>
              )}

              {item.calendarReminderCreated && (
                <View
                  style={
                    styles.calendarContainer
                  }
                >
                  <Text
                    style={styles.infoTitle}
                  >
                    Recordatorio:
                  </Text>

                  <Text
                    style={styles.infoText}
                  >
                    Creado en calendario
                  </Text>
                </View>
              )}
            </View>

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
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#eeeeee',
    marginBottom: 10,
    borderRadius: 6,
  },

  productImage: {
    width: 70,
    height: 70,
    borderRadius: 6,
    marginRight: 12,
  },

  productInfo: {
    flex: 1,
  },

  productText: {
    fontSize: 18,
    fontWeight: '600',
  },

  locationContainer: {
    marginTop: 6,
  },

  supplierContainer: {
    marginTop: 8,
  },

  calendarContainer: {
    marginTop: 8,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },

  infoText: {
    fontSize: 12,
    color: '#666',
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