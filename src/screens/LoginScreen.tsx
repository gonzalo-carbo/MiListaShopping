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

type Props = {
  navigation: any;
  onLogin: () => void;
};

export default function LoginScreen({
  navigation,
  onLogin,
}: Props) {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {

    const savedUser =
      await AsyncStorage.getItem(USER_KEY);

    if (!savedUser) {

      Alert.alert(
        'Error',
        'No hay ningún usuario registrado.'
      );

      return;
    }

    const user = JSON.parse(savedUser);

    if (
      user.username === username.trim() &&
      user.password === password
    ) {

      onLogin();

    } else {

      Alert.alert(
        'Error',
        'Usuario o contraseña incorrectos.'
      );

    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Login
      </Text>

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
        title="Ingresar"
        onPress={login}
      />

      <Button
        title="Ir a Registro"
        onPress={() =>
          navigation.navigate('Register')
        }
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