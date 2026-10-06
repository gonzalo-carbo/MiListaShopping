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

const USER_KEY = '@usuario';

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    if (username.trim() === '') {
      Alert.alert('Error', 'Ingresá un usuario.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Error',
        'La contraseña debe tener al menos 6 caracteres.'
      );
      return;
    }

    const user = {
      username: username.trim(),
      password: password,
    };

    await AsyncStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );

    Alert.alert(
      'Registro exitoso',
      'Usuario guardado correctamente.'
    );

    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title="Registrarse"
        onPress={register}
      />

      <Button
        title="Volver a Login"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 15,
  },

  title: {
    fontSize: 30,
    textAlign: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: '#999',
    padding: 12,
    borderRadius: 6,
  },
});