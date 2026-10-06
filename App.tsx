import React, { useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddProductScreen from './src/screens/AddProductScreen';

const Stack = createNativeStackNavigator();

export default function App() {

  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <NavigationContainer>

      <Stack.Navigator>

        {!loggedIn ? (
          <>
            <Stack.Screen
              name="Login"
            >
              {(props) => (
                <LoginScreen
                  {...props}
                  onLogin={() => setLoggedIn(true)}
                />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="Register"
              component={RegisterScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
            >
              {(props) => (
                <HomeScreen
                  {...props}
                  onLogout={() => setLoggedIn(false)}
                />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="AddProduct"
              component={AddProductScreen}
            />
          </>
        )}

      </Stack.Navigator>

    </NavigationContainer>
  );
}