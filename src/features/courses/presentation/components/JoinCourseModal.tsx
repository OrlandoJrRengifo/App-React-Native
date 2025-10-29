// src/features/courses/presentation/components/JoinCourseModal.tsx

import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Course } from '../../domain/entities/Course';
import { useCourses } from '../context/CourseContext';

interface JoinCourseModalProps {
  visible: boolean;
  onClose: () => void;
  onJoinSuccess: (courses: Course[]) => void;
}

const JoinCourseModal = ({
  visible,
  onClose,
  onJoinSuccess,
}: JoinCourseModalProps) => {
  const [courseCode, setCourseCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { getCourseIdByCode, canJoinCourse, loadCoursesByIds } = useCourses();
  const { user } = useAuth();

  const handleJoin = async () => {
    if (!courseCode.trim()) {
      setError('Ingresa un código de curso');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'Debes iniciar sesión para unirte a un curso');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. Buscar el curso por código
      const courseId = await getCourseIdByCode(courseCode.trim());

      if (!courseId) {
        setError('No se encontró un curso con ese código');
        return;
      }

      // 2. Verificar si el usuario puede unirse (no es el profesor)
      const canJoin = await canJoinCourse(courseId);

      if (!canJoin) {
        setError('No puedes inscribirte en tu propio curso');
        return;
      }

      // 3. Verificar si ya está inscrito
      // TODO: Aquí deberías verificar con tu módulo de user_courses si ya está inscrito
      // const isAlreadyEnrolled = await checkIfAlreadyEnrolled(userId, courseId);
      // if (isAlreadyEnrolled) {
      //   setError('Ya estás inscrito en este curso');
      //   return;
      // }

      // 4. Verificar cupos disponibles
      // TODO: Implementar cuando tengas la función getAvailableSlots
      // const availableSlots = await getAvailableSlots(courseId);
      // if (availableSlots <= 0) {
      //   setError('El curso no tiene cupos disponibles');
      //   return;
      // }

      // 5. Inscribir al usuario en el curso
      // TODO: Llamar a tu módulo de user_courses para crear la relación
      // await enrollUserInCourse(userId, courseId);

      console.log('✅ Usuario inscrito exitosamente en el curso:', courseId);

      // 6. Recargar los cursos inscritos
      // TODO: Obtener los IDs de cursos del usuario desde user_courses
      // const userCourseIds = await getUserCourseIds(userId);
      // const enrolledCourses = await loadCoursesByIds(userCourseIds);
      
      // Por ahora, solo cerramos el modal
      Alert.alert(
        '¡Éxito!',
        'Te has inscrito correctamente en el curso',
        [
          {
            text: 'OK',
            onPress: () => {
              setCourseCode('');
              onClose();
              // onJoinSuccess(enrolledCourses); // Descomentar cuando tengas la lista
            },
          },
        ]
      );

    } catch (err) {
      console.error('❌ Error al unirse al curso:', err);
      setError('Ocurrió un error al intentar unirse al curso');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCourseCode('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Unirse a un curso</Text>
          <Text style={styles.subtitle}>
            Ingresa el código del curso proporcionado por tu profesor
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Código del curso</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Ej: MAT2024"
              value={courseCode}
              onChangeText={(text) => {
                setCourseCode(text);
                setError('');
              }}
              autoCapitalize="characters"
              editable={!loading}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              El código es único para cada curso y lo proporciona tu profesor
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.joinButton, loading && styles.buttonDisabled]}
              onPress={handleJoin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.joinButtonText}>Unirse</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
});

export default JoinCourseModal;