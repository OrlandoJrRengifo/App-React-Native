import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function EmptyStudentState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👥</Text>
      <Text style={styles.emptyMessage}>No estás inscrito en cursos</Text>
    </View>
  );
}

export function EmptyTeachingState({ onCreateCourse }: { onCreateCourse: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyMessage}>Aún no tienes cursos</Text>
      <TouchableOpacity style={styles.createButtonLarge} onPress={onCreateCourse}>
        <Text style={styles.buttonText}>+ Crear Curso</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButtonLarge: {
    backgroundColor: '#673AB7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});