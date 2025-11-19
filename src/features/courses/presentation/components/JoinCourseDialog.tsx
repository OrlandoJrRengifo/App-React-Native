import React, { useState } from 'react';
import { Button, Dialog, HelperText, Portal, TextInput } from 'react-native-paper';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { useUserCourse } from '../../../user_courses/presentation/context/UserCourseContext';
import { useCourses } from '../context/CourseContext';

interface JoinCourseDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onJoinSuccess: () => void;
}

export const JoinCourseDialog = ({ visible, onDismiss, onJoinSuccess }: JoinCourseDialogProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { getCourseIdByCode, isOwnerOfCourse } = useCourses();

  const { enrollUser, isUserInCourse } = useUserCourse();

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Debes ingresar un código de curso");
      return;
    }
    if (!user || !user.id) {
      setError("Sesión no válida o ID de usuario faltante");
      return;
    }

    setLoading(true);
    setError(null);
    const userId = user.id;

    try {
      // 1. Verificar existencia del curso y obtener ID
      const courseId = await getCourseIdByCode(code.trim());
      if (!courseId) {
        throw new Error("Código inválido o curso no encontrado");
      }

      // 2. Verificar si es dueño
      const isOwner = await isOwnerOfCourse(courseId);
      if (isOwner) {
        throw new Error("No puedes inscribirte a tu propio curso");
      }
      
      // 3. Usar la lógica del Contexto: Verificar inscripción previa
      const alreadyEnrolled = await isUserInCourse(userId, courseId);
      if (alreadyEnrolled) {
        throw new Error("Ya estás inscrito en este curso");
      }
      
      // 4. Usar la lógica del Contexto: Ejecutar inscripción
      const success = await enrollUser(userId, courseId);

      if (success) {
        onJoinSuccess(); 
        onDismiss(); 
      } else {
        throw new Error("Fallo al inscribirse. Verifica si hay cupos disponibles.");
      }
      
    } catch (e: any) {
      setError(e.message || "Error al unirse al curso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Unirse al Curso</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Código del curso"
            value={code}
            onChangeText={setCode}
            mode="outlined"
            autoCapitalize="none"
          />
          {error && <HelperText type="error" visible={true}>{error}</HelperText>}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={loading}>Cancelar</Button>
          <Button onPress={handleSubmit} mode="contained" loading={loading} disabled={loading}>Unirse</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};