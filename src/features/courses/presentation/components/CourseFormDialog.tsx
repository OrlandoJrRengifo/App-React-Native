
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Dialog, HelperText, Portal, TextInput } from 'react-native-paper';
import { Course } from '../../domain/entities/Course';

export interface CourseFormData {
  id?: string;
  name: string;
  code: string;
  maxStudents: number;
  createdAt?: Date;
}

interface CourseFormDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (result: CourseFormData) => void;
  course?: Course; 
}

export const CourseFormDialog = ({ visible, onDismiss, onSubmit, course }: CourseFormDialogProps) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [maxStudents, setMaxStudents] = useState('1');
  const [errors, setErrors] = useState({ name: '', code: '', maxStudents: '' });

  useEffect(() => {
    if (visible) {
      setName(course?.name ?? '');
      setCode(course?.code ?? '');
      setMaxStudents(course?.maxStudents?.toString() ?? '1');
      setErrors({ name: '', code: '', maxStudents: '' });
    }
  }, [course, visible]);

  const validate = (): boolean => {
    let isValid = true;
    const newErrors = { name: '', code: '', maxStudents: '' };

    if (!name.trim()) {
      newErrors.name = 'Nombre obligatorio';
      isValid = false;
    }
    if (!code.trim()) {
      newErrors.code = 'Código obligatorio';
      isValid = false;
    }
    const max = parseInt(maxStudents, 10);
    if (isNaN(max) || max < 1) {
      newErrors.maxStudents = 'Mínimo 1 cupo';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        id: course?.id, // ID si estamos editando
        name: name.trim(),
        code: code.trim(),
        maxStudents: parseInt(maxStudents, 10),
        createdAt: course?.createdAt,
      });
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{course ? 'Editar curso' : 'Crear curso'}</Dialog.Title>
        <Dialog.Content>
          <View>
            <TextInput
              label="Nombre del curso"
              value={name}
              onChangeText={setName}
              mode="outlined"
              error={!!errors.name}
            />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>

            <TextInput
              label="Código del curso"
              value={code}
              onChangeText={setCode}
              mode="outlined"
              error={!!errors.code}
            />
            <HelperText type="error" visible={!!errors.code}>
              {errors.code}
            </HelperText>

            <TextInput
              label="Cupos máximos"
              value={maxStudents}
              onChangeText={setMaxStudents}
              keyboardType="number-pad"
              mode="outlined"
              error={!!errors.maxStudents}
            />
            <HelperText type="error" visible={!!errors.maxStudents}>
              {errors.maxStudents}
            </HelperText>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancelar</Button>
          <Button onPress={handleSubmit} mode="contained">
            {course ? 'Actualizar' : 'Crear'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};