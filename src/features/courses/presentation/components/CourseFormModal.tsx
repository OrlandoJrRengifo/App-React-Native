// src/features/courses/presentation/components/CourseFormModal.tsx

import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Course } from '../../domain/entities/Course';

interface CourseFormModalProps {
  visible: boolean;
  course?: Course | null;
  onClose: () => void;
  onSubmit: (course: Partial<Course>) => void;
}

const CourseFormModal = ({
  visible,
  course,
  onClose,
  onSubmit,
}: CourseFormModalProps) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [maxStudents, setMaxStudents] = useState('1');
  const [errors, setErrors] = useState({
    name: '',
    code: '',
    maxStudents: '',
  });

  useEffect(() => {
    if (course) {
      setName(course.name);
      setCode(course.code);
      setMaxStudents(course.max_students.toString());
    } else {
      setName('');
      setCode('');
      setMaxStudents('1');
    }
    setErrors({ name: '', code: '', maxStudents: '' });
  }, [course, visible]);

  const validate = (): boolean => {
    const newErrors = {
      name: '',
      code: '',
      maxStudents: '',
    };

    if (!name.trim()) {
      newErrors.name = 'Nombre obligatorio';
    }
    if (!code.trim()) {
      newErrors.code = 'Código obligatorio';
    }
    const studentsNum = parseInt(maxStudents);
    if (isNaN(studentsNum) || studentsNum < 1) {
      newErrors.maxStudents = 'Mínimo 1 cupo';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.code && !newErrors.maxStudents;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const courseData: Partial<Course> = {
      name: name.trim(),
      code: code.trim(),
      max_students: parseInt(maxStudents),
    };

    if (course?._id) {
      courseData._id = course._id;
      courseData.teacher_id = course.teacher_id;
      courseData.created_at = course.created_at;
    }

    onSubmit(courseData);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>
              {course ? 'Editar curso' : 'Crear curso'}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre del curso</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Ej: Matemáticas Aplicadas"
                value={name}
                onChangeText={setName}
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Código del curso</Text>
              <TextInput
                style={[styles.input, errors.code && styles.inputError]}
                placeholder="Ej: MAT2024"
                value={code}
                onChangeText={setCode}
              />
              {errors.code ? (
                <Text style={styles.errorText}>{errors.code}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cupos máximos</Text>
              <TextInput
                style={[styles.input, errors.maxStudents && styles.inputError]}
                placeholder="Mínimo 1 estudiante"
                keyboardType="numeric"
                value={maxStudents}
                onChangeText={setMaxStudents}
              />
              {errors.maxStudents ? (
                <Text style={styles.errorText}>{errors.maxStudents}</Text>
              ) : null}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>
                  {course ? 'Actualizar' : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
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
  submitButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CourseFormModal;