import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text } from 'react-native-paper';

export const EmptyTeachingState = ({ onCreateCourse }: { onCreateCourse: () => void }) => (
  <View style={styles.container}>
    <Icon source="book-outline" size={48} color="#999" />
    <Text style={styles.text}>Aún no tienes cursos</Text>
    <Button mode="contained" onPress={onCreateCourse} style={styles.button}>
      Crear Curso
    </Button>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 8, color: '#666' },
  button: { marginTop: 16 },
});