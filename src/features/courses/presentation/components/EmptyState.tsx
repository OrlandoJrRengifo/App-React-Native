import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Empty Student State
interface EmptyStudentStateProps {}

export const EmptyStudentState = ({}: EmptyStudentStateProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>👥</Text>
      <Text style={styles.message}>No estás inscrito en cursos</Text>
    </View>
  );
};

// Empty Teaching State
interface EmptyTeachingStateProps {
  onCreateCourse: () => void;
}

export const EmptyTeachingState = ({ onCreateCourse }: EmptyTeachingStateProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📚</Text>
      <Text style={styles.message}>Aún no tienes cursos</Text>
      <TouchableOpacity style={styles.button} onPress={onCreateCourse}>
        <Text style={styles.buttonText}>+ Crear</Text>
      </TouchableOpacity>
    </View>
  );
};

// Error State
interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState = ({ onRetry }: ErrorStateProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.errorIcon}>❌</Text>
      <Text style={styles.errorMessage}>Ocurrió un error</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default {
  EmptyStudentState,
  EmptyTeachingState,
  ErrorState,
};