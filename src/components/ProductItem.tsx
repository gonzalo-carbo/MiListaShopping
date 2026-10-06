import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type Props = {
  name: string;
  onDelete: () => void;
};

export default function ProductItem({
  name,
  onDelete,
}: Props) {

  return (
    <View style={styles.productItem}>

      <Text style={styles.productText}>
        {name}
      </Text>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={onDelete}
      >
        <Text style={styles.deleteText}>
          Eliminar
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

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

});