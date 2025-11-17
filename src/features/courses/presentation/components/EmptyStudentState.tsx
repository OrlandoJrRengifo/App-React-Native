import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

export const EmptyStudentState = () => (
  <View style={styles.container}>
    <Icon source="account-group-outline" size={48} color="#999" />
    <Text style={styles.text}>No estás inscrito en cursos</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 8, color: '#666' },
});