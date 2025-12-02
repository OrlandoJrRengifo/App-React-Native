import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

export const EmptyTeachingState = () => (
  <View style={styles.container}>
    <Icon source="book-outline" size={48} color="#999" />
    <Text style={styles.text}>Aún no tienes cursos</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 8, color: '#666' },
  button: { marginTop: 16 },
});