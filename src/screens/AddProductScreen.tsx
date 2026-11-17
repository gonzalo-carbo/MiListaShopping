import React, {
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  Modal,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import * as ImagePicker from 'expo-image-picker';

import * as Location from 'expo-location';

import {
  Contact,
  ContactField,
  getPermissionsAsync as getContactsPermissionsAsync,
  requestPermissionsAsync as requestContactsPermissionsAsync,
} from 'expo-contacts';

import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';

import {
  scheduleNotificationAsync,
} from 'expo-notifications/build/scheduleNotificationAsync';

import {
  setNotificationHandler,
} from 'expo-notifications/build/NotificationsHandler';

import {
  SchedulableTriggerInputTypes,
} from 'expo-notifications/build/Notifications.types';

import {
  Product,
  useProductStore,
} from '../stores/productStore';


type ContactItem = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
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

  const [name, setName] =
    useState('');

  const [imageUri, setImageUri] =
    useState<string | null>(null);

  const [showCamera, setShowCamera] =
    useState(false);

  const [latitude, setLatitude] =
    useState<number | null>(null);

  const [longitude, setLongitude] =
    useState<number | null>(null);

  const [gettingLocation, setGettingLocation] =
    useState(false);


  const [contacts, setContacts] =
    useState<ContactItem[]>([]);

  const [showContacts, setShowContacts] =
    useState(false);

  const [loadingContacts, setLoadingContacts] =
    useState(false);


  const [supplierName, setSupplierName] =
    useState<string | null>(null);

  const [supplierPhone, setSupplierPhone] =
    useState<string | null>(null);

  const [supplierEmail, setSupplierEmail] =
    useState<string | null>(null);


  const addProductToStore =
    useProductStore(
      (state) => state.addProduct
    );


  const [
    cameraPermission,
    requestCameraPermission,
  ] = useCameraPermissions();


  const cameraRef =
    useRef<CameraView>(null);


  const openCamera = async () => {

    if (!cameraPermission?.granted) {

      const result =
        await requestCameraPermission();


      if (!result.granted) {

        Alert.alert(
          'Permiso denegado',
          'Se necesita permiso para usar la cámara.'
        );

        return;

      }

    }


    setShowCamera(true);

  };


  const takePhoto = async () => {

    try {

      const photo =
        await cameraRef.current
          ?.takePictureAsync();


      if (photo?.uri) {

        setImageUri(
          photo.uri
        );

        setShowCamera(false);

      }

    } catch (error) {

      Alert.alert(
        'Error',
        'No se pudo tomar la foto.'
      );

      console.log(error);

    }

  };


  const pickImage = async () => {

    try {

      const permission =
        await ImagePicker
          .requestMediaLibraryPermissionsAsync();


      if (!permission.granted) {

        Alert.alert(
          'Permiso denegado',
          'Se necesita permiso para acceder a la galería.'
        );

        return;

      }


      const result =
        await ImagePicker
          .launchImageLibraryAsync({

            mediaTypes: ['images'],

            allowsEditing: false,

            quality: 0.8,

          });


      if (!result.canceled) {

        setImageUri(
          result.assets[0].uri
        );

      }

    } catch (error) {

      Alert.alert(
        'Error',
        'No se pudo seleccionar la imagen.'
      );

      console.log(error);

    }

  };


  const getCurrentLocation = async () => {

    try {

      setGettingLocation(true);


      const {
        status,
      } =
        await Location
          .requestForegroundPermissionsAsync();


      if (status !== 'granted') {

        Alert.alert(
          'Permiso denegado',
          'Se necesita permiso para obtener la ubicación.'
        );

        return;

      }


      const currentLocation =
        await Location
          .getCurrentPositionAsync({

            accuracy:
              Location.Accuracy.Balanced,

          });


      setLatitude(
        currentLocation
          .coords
          .latitude
      );

      setLongitude(
        currentLocation
          .coords
          .longitude
      );


      Alert.alert(
        'Ubicación obtenida',
        'La ubicación actual fue asociada al producto.'
      );

    } catch (error) {

      Alert.alert(
        'Error',
        'No se pudo obtener la ubicación.'
      );

      console.log(error);

    } finally {

      setGettingLocation(false);

    }

  };


  const loadContacts = async () => {

    try {

      setLoadingContacts(true);


      let permission =
        await getContactsPermissionsAsync();


      if (permission.status !== 'granted') {

        permission =
          await requestContactsPermissionsAsync();

      }


      if (permission.status !== 'granted') {

        Alert.alert(
          'Permiso denegado',
          'Se necesita permiso para acceder a los contactos.'
        );

        return;

      }


      const data =
        await Contact.getAllDetails(
          [
            ContactField.FULL_NAME,
            ContactField.PHONES,
            ContactField.EMAILS,
          ],
          {
            limit: 500,
            offset: 0,
          }
        );


      const mappedContacts: ContactItem[] =
        data
          .filter(
            (contact) =>
              contact.fullName
          )
          .map(
            (contact) => ({
              id: contact.id,

              name:
                contact.fullName ??
                'Sin nombre',

              phone:
                contact.phones?.[0]
                  ?.number,

              email:
                contact.emails?.[0]
                  ?.address,
            })
          );


      setContacts(
        mappedContacts
      );

      setShowContacts(true);

    } catch (error) {

      Alert.alert(
        'Error',
        'No se pudieron cargar los contactos.'
      );

      console.log(error);

    } finally {

      setLoadingContacts(false);

    }

  };


  const selectContact = (
    contact: ContactItem
  ) => {

    setSupplierName(
      contact.name
    );

    setSupplierPhone(
      contact.phone ?? null
    );

    setSupplierEmail(
      contact.email ?? null
    );

    setShowContacts(false);

  };


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

          title:
            'Lista de compras',

          body:
            'Tenés productos pendientes en tu lista de compras.',

          sound: 'default',

        },

        trigger: {

          type:
            SchedulableTriggerInputTypes
              .TIME_INTERVAL,

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


  const addProduct = () => {

    if (name.trim() === '') {

      Alert.alert(
        'Error',
        'Ingresá el nombre del producto.'
      );

      return;

    }


    const newProduct: Product = {

      id:
        Date.now().toString(),

      name:
        name.trim(),

      imageUri:
        imageUri ?? undefined,

      latitude:
        latitude ?? undefined,

      longitude:
        longitude ?? undefined,

      supplierName:
        supplierName ?? undefined,

      supplierPhone:
        supplierPhone ?? undefined,

      supplierEmail:
        supplierEmail ?? undefined,

    };


    addProductToStore(
      newProduct
    );


    scheduleNotification();


    Alert.alert(
      'Producto agregado',
      `${newProduct.name} fue agregado a la lista.`
    );


    setName('');

    setImageUri(null);

    setLatitude(null);

    setLongitude(null);

    setSupplierName(null);

    setSupplierPhone(null);

    setSupplierEmail(null);


    navigation.goBack();

  };


  if (showCamera) {

    return (

      <View
        style={
          styles.cameraContainer
        }
      >

        <CameraView
          ref={cameraRef}
          facing="back"
          style={styles.camera}
        />


        <View
          style={
            styles.cameraButtons
          }
        >

          <Button
            title="Capturar"
            onPress={takePhoto}
          />


          <Button
            title="Cancelar"
            onPress={() =>
              setShowCamera(false)
            }
          />

        </View>

      </View>

    );

  }


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


      <View style={styles.buttonContainer}>

        <Button
          title="Tomar foto"
          onPress={openCamera}
        />

      </View>


      <View style={styles.buttonContainer}>

        <Button
          title="Elegir de galería"
          onPress={pickImage}
        />

      </View>


      {imageUri && (

        <Image
          source={{
            uri: imageUri,
          }}
          style={styles.image}
        />

      )}


      <View style={styles.buttonContainer}>

        <Button
          title={
            gettingLocation
              ? 'Obteniendo ubicación...'
              : 'Obtener ubicación actual'
          }
          onPress={
            getCurrentLocation
          }
          disabled={
            gettingLocation
          }
        />

      </View>


      {latitude !== null &&
        longitude !== null && (

          <View
            style={
              styles.locationBox
            }
          >

            <Text>
              Ubicación asociada:
            </Text>

            <Text>
              Latitud:{' '}
              {latitude.toFixed(6)}
            </Text>

            <Text>
              Longitud:{' '}
              {longitude.toFixed(6)}
            </Text>

          </View>

        )}


      <View style={styles.buttonContainer}>

        <Button
          title={
            loadingContacts
              ? 'Cargando contactos...'
              : 'Seleccionar proveedor'
          }
          onPress={loadContacts}
          disabled={loadingContacts}
        />

      </View>


      {supplierName && (

        <View style={styles.supplierBox}>

          <Text style={styles.supplierTitle}>
            Proveedor:
          </Text>

          <Text>
            {supplierName}
          </Text>


          {supplierPhone && (

            <Text>
              Tel: {supplierPhone}
            </Text>

          )}


          {supplierEmail && (

            <Text>
              Email: {supplierEmail}
            </Text>

          )}

        </View>

      )}


      <Button
        title="Guardar producto"
        onPress={addProduct}
      />


      <Modal
        visible={showContacts}
        animationType="slide"
        onRequestClose={() =>
          setShowContacts(false)
        }
      >

        <View style={styles.modalContainer}>

          <Text style={styles.modalTitle}>
            Seleccionar proveedor
          </Text>


          <FlatList
            data={contacts}
            keyExtractor={(item) =>
              item.id
            }
            renderItem={({ item }) => (

              <TouchableOpacity
                style={
                  styles.contactItem
                }
                onPress={() =>
                  selectContact(item)
                }
              >

                <Text
                  style={
                    styles.contactName
                  }
                >
                  {item.name}
                </Text>


                {item.phone && (

                  <Text
                    style={
                      styles.contactDetail
                    }
                  >
                    {item.phone}
                  </Text>

                )}


                {item.email && (

                  <Text
                    style={
                      styles.contactDetail
                    }
                  >
                    {item.email}
                  </Text>

                )}

              </TouchableOpacity>

            )}
          />


          <Button
            title="Cancelar"
            onPress={() =>
              setShowContacts(false)
            }
          />

        </View>

      </Modal>

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


  buttonContainer: {
    marginBottom: 10,
  },


  image: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginVertical: 20,
    borderRadius: 8,
  },


  locationBox: {
    backgroundColor: '#eeeeee',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },


  supplierBox: {
    backgroundColor: '#eeeeee',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },


  supplierTitle: {
    fontWeight: '600',
    marginBottom: 3,
  },


  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },


  modalTitle: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 20,
  },


  contactItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
  },


  contactName: {
    fontSize: 17,
    fontWeight: '600',
  },


  contactDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },


  cameraContainer: {
    flex: 1,
  },


  camera: {
    flex: 1,
  },


  cameraButtons: {
    padding: 20,
    gap: 10,
  },

});