import React, { useRef, useState } from 'react';
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

import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Calendar from 'expo-calendar/legacy';

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

import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';

import { Product, useProductStore } from '../stores/productStore';

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

export default function AddProductScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();

  const [showCamera, setShowCamera] = useState(false);

  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [gettingLocation, setGettingLocation] = useState(false);

  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [showContacts, setShowContacts] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const [supplierName, setSupplierName] = useState<string | undefined>();
  const [supplierPhone, setSupplierPhone] = useState<string | undefined>();
  const [supplierEmail, setSupplierEmail] = useState<string | undefined>();

  const [calendarEventCreated, setCalendarEventCreated] =
    useState(false);

  const addProductToStore = useProductStore(
    (state) => state.addProduct
  );

  const cameraRef = useRef<any>(null);

  const [
    cameraPermission,
    requestCameraPermission,
  ] = useCameraPermissions();

  // -------------------------
  // CÁMARA
  // -------------------------

  const openCamera = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();

      if (!result.granted) {
        Alert.alert(
          'Permiso denegado',
          'La aplicación necesita permiso para usar la cámara.'
        );
        return;
      }
    }

    setShowCamera(true);
  };

  const takePhoto = async () => {
    try {
      if (!cameraRef.current) {
        return;
      }

      const photo = await cameraRef.current.takePictureAsync();

      if (photo?.uri) {
        setImageUri(photo.uri);
        setShowCamera(false);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo tomar la fotografía.'
      );
    }
  };

  // -------------------------
  // GALERÍA
  // -------------------------

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permiso denegado',
          'La aplicación necesita permiso para acceder a la galería.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.8,
        });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo seleccionar la imagen.'
      );
    }
  };

  // -------------------------
  // UBICACIÓN
  // -------------------------

  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permiso denegado',
          'La aplicación necesita permiso para acceder a la ubicación.'
        );

        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo obtener la ubicación.'
      );
    } finally {
      setGettingLocation(false);
    }
  };

  // -------------------------
  // CONTACTOS
  // -------------------------

  const loadContacts = async () => {
    try {
      setLoadingContacts(true);

      let permission =
        await getContactsPermissionsAsync();

      if (!permission.granted) {
        permission =
          await requestContactsPermissionsAsync();
      }

      if (!permission.granted) {
        Alert.alert(
          'Permiso denegado',
          'La aplicación necesita permiso para acceder a los contactos.'
        );

        return;
      }

      const result = await Contact.getAllDetails(
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

      const contactItems: ContactItem[] =
        result.map((contact: any) => ({
          id: contact.id,

          name:
            contact.fullName ||
            'Sin nombre',

          phone:
            contact.phones &&
            contact.phones.length > 0
              ? contact.phones[0].number
              : undefined,

          email:
            contact.emails &&
            contact.emails.length > 0
              ? contact.emails[0].address
              : undefined,
        }));

      setContacts(contactItems);
      setShowContacts(true);
    } catch (error) {
      console.log('Error contactos:', error);

      Alert.alert(
        'Error',
        'No se pudieron cargar los contactos.'
      );
    } finally {
      setLoadingContacts(false);
    }
  };

  const selectContact = (contact: ContactItem) => {
    setSupplierName(contact.name);
    setSupplierPhone(contact.phone);
    setSupplierEmail(contact.email);

    setShowContacts(false);
  };

  // -------------------------
  // CALENDARIO
  // -------------------------

  const createCalendarReminder = async () => {
    if (!name.trim()) {
      Alert.alert(
        'Producto requerido',
        'Primero escribí el nombre del producto.'
      );

      return;
    }

    try {
      const permission =
        await Calendar.requestCalendarPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'La aplicación necesita permiso para acceder al calendario.'
        );

        return;
      }

      const calendars =
        await Calendar.getCalendarsAsync(
          Calendar.EntityTypes.EVENT
        );

      const writableCalendar =
        calendars.find(
          (calendar: any) =>
            calendar.allowsModifications
        );

      if (!writableCalendar) {
        Alert.alert(
          'Calendario no disponible',
          'No se encontró un calendario en el que se puedan crear eventos.'
        );

        return;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);

      const endDate = new Date(
        startDate.getTime() + 30 * 60 * 1000
      );

      await Calendar.createEventAsync(
        writableCalendar.id,
        {
          title: `Comprar ${name.trim()}`,
          notes:
            'Recordatorio creado desde MiListaShopping',
          startDate,
          endDate,
        }
      );

      setCalendarEventCreated(true);

      Alert.alert(
        'Recordatorio creado',
        `Se creó en el calendario un evento para comprar ${name.trim()} dentro de 24 horas.`
      );
    } catch (error) {
      console.log('Error calendario:', error);

      Alert.alert(
        'Error',
        'No se pudo crear el evento en el calendario.'
      );
    }
  };

  // -------------------------
  // NOTIFICACIÓN
  // -------------------------

  const scheduleNotification = async () => {
    try {
      let permission =
        await getPermissionsAsync();

      if (!permission.granted) {
        permission =
          await requestPermissionsAsync();
      }

      if (!permission.granted) {
        return;
      }

      await scheduleNotificationAsync({
        content: {
          title: 'Compras pendientes',
          body: 'Recordá revisar tu lista de compras.',
        },

        trigger: {
          type:
            SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 4,
        },
      });
    } catch (error) {
      console.log(
        'Error al programar notificación:',
        error
      );
    }
  };

  // -------------------------
  // GUARDAR PRODUCTO
  // -------------------------

  const addProduct = async () => {
    if (!name.trim()) {
      Alert.alert(
        'Dato requerido',
        'Ingresá el nombre del producto.'
      );

      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: name.trim(),
      imageUri,
      latitude,
      longitude,
      supplierName,
      supplierPhone,
      supplierEmail,
      calendarReminderCreated:
        calendarEventCreated,
    };

    addProductToStore(newProduct);

    await scheduleNotification();

    Alert.alert(
      'Producto agregado',
      'El producto se agregó correctamente.'
    );

    setName('');
    setImageUri(undefined);
    setLatitude(undefined);
    setLongitude(undefined);
    setSupplierName(undefined);
    setSupplierPhone(undefined);
    setSupplierEmail(undefined);
    setCalendarEventCreated(false);

    navigation.goBack();
  };

  // -------------------------
  // PANTALLA CÁMARA
  // -------------------------

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />

        <View style={styles.cameraButtons}>
          <Button
            title="Tomar foto"
            onPress={takePhoto}
          />

          <Button
            title="Cancelar"
            onPress={() => setShowCamera(false)}
          />
        </View>
      </View>
    );
  }

  // -------------------------
  // PANTALLA NORMAL
  // -------------------------

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Agregar producto
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del producto"
        value={name}
        onChangeText={setName}
      />

      <View style={styles.buttonSpace}>
        <Button
          title="Tomar foto"
          onPress={openCamera}
        />
      </View>

      <View style={styles.buttonSpace}>
        <Button
          title="Elegir de galería"
          onPress={pickImage}
        />
      </View>

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
        />
      )}

      <View style={styles.buttonSpace}>
        <Button
          title={
            gettingLocation
              ? 'Obteniendo ubicación...'
              : 'Obtener ubicación actual'
          }
          onPress={getCurrentLocation}
          disabled={gettingLocation}
        />
      </View>

      {latitude !== undefined &&
        longitude !== undefined && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>
              Ubicación seleccionada:
            </Text>

            <Text style={styles.infoText}>
              {latitude.toFixed(6)},{' '}
              {longitude.toFixed(6)}
            </Text>
          </View>
        )}

      <View style={styles.buttonSpace}>
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
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            Proveedor:
          </Text>

          <Text style={styles.infoText}>
            {supplierName}
          </Text>

          {supplierPhone && (
            <Text style={styles.infoText}>
              Tel: {supplierPhone}
            </Text>
          )}

          {supplierEmail && (
            <Text style={styles.infoText}>
              Email: {supplierEmail}
            </Text>
          )}
        </View>
      )}

      <View style={styles.buttonSpace}>
        <Button
          title={
            calendarEventCreated
              ? 'Recordatorio creado'
              : 'Crear recordatorio en calendario'
          }
          onPress={createCalendarReminder}
          disabled={calendarEventCreated}
        />
      </View>

      {calendarEventCreated && (
        <Text style={styles.calendarText}>
          ✓ Evento agregado al calendario
        </Text>
      )}

      <View style={styles.saveButton}>
        <Button
          title="Guardar producto"
          onPress={addProduct}
        />
      </View>

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
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() =>
                  selectContact(item)
                }
              >
                <Text style={styles.contactName}>
                  {item.name}
                </Text>

                {item.phone && (
                  <Text style={styles.contactDetail}>
                    {item.phone}
                  </Text>
                )}

                {item.email && (
                  <Text style={styles.contactDetail}>
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
    paddingTop: 40,
  },

  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },

  buttonSpace: {
    marginVertical: 5,
  },

  image: {
    width: 160,
    height: 160,
    alignSelf: 'center',
    borderRadius: 8,
    marginVertical: 10,
  },

  infoBox: {
    backgroundColor: '#eeeeee',
    padding: 10,
    borderRadius: 6,
    marginVertical: 8,
  },

  infoTitle: {
    fontWeight: '600',
    marginBottom: 3,
  },

  infoText: {
    fontSize: 13,
    color: '#555',
  },

  calendarText: {
    textAlign: 'center',
    marginTop: 5,
    color: '#555',
  },

  saveButton: {
    marginTop: 15,
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

  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
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
    marginTop: 3,
  },
});