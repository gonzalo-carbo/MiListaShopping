import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';

import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';

import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';

import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';


const PRODUCTS_KEY = '@productos';


type Product = {
  id: string;
  name: string;
};


setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


export default function AddProductScreen({
  navigation,
}: any) {

  const [name, setName] = useState('');


  const scheduleNotification = async () => {

    try {

      const permission =
        await getPermissionsAsync();


      let granted =
        permission.status === 'granted';


      if (!granted) {

        const result =
          await requestPermissionsAsync();

        granted =
          result.status === 'granted';

      }


      if (!granted) {

        console.log(
          'Permiso de notificaciones no concedido.'
        );

        return;

      }


      await scheduleNotificationAsync({

        content: {

          title: 'Lista de compras',

          body:
            'Tenés productos pendientes en tu lista de compras.',

          sound: 'default',

        },

        trigger: {

          type:
            SchedulableTriggerInputTypes.TIME_INTERVAL,

          seconds: 4,

        },

      });


      console.log(
        'Notificación programada correctamente.'
      );

    } catch (error) {

      console.log(
        'No se pudo programar la notificación:',
        error
      );

    }

  };


  const addProduct = async () => {

    if (name.trim() === '') {

      Alert.alert(
        'Error',
        'Ingresá el nombre del producto.'
      );

      return;

    }


    const savedProducts =
      await AsyncStorage.getItem(
        PRODUCTS_KEY
      );


    let products: Product[] = [];


    if (savedProducts) {

      products =
        JSON.parse(savedProducts);

    }


    const newProduct: Product = {

      id: Date.now().toString(),

      name: name.trim(),

    };


    const updatedProducts = [

      ...products,

      newProduct,

    ];


    await AsyncStorage.setItem(

      PRODUCTS_KEY,

      JSON.stringify(
        updatedProducts
      )

    );


    // Programa la notificación para 4 segundos después.
    scheduleNotification();


    Alert.alert(

      'Producto agregado',

      `${newProduct.name} fue agregado a la lista.`

    );


    setName('');


    navigation.goBack();

  };


  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Agregar producto
      </Text>

      <TextInput

        style={styles.input}

        placeholder="Ej: Leche"

        value={name}

        onChangeText={setName}

      />

      <Button

        title="Guardar producto"

        onPress={addProduct}

      />

    </View>

  );

}


const styles = StyleSheet.create({

  container: {

    flex: 1,

    padding: 20,

    paddingTop: 50,

  },


  title: {

    fontSize: 30,

    textAlign: 'center',

    marginBottom: 30,

  },


  input: {

    borderWidth: 1,

    borderColor: '#999',

    padding: 12,

    borderRadius: 6,

    marginBottom: 20,

  },

});