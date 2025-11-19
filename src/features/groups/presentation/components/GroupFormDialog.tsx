/**
 * @fileoverview Diálogo para crear/editar grupos.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput } from 'react-native-paper';
import { Group } from '../../domain/entities/Group';

interface GroupFormDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: GroupFormData) => Promise<void>;
  group?: Group;
  defaultCapacity?: number; // max_group_size de la categoría
}

export interface GroupFormData {
  id?: string;
  capacity: number;
}

export const GroupFormDialog = ({
  visible,
  onDismiss,
  onSubmit,
  group,
  defaultCapacity = 4,
}: GroupFormDialogProps) => {
  const [capacity, setCapacity] = useState(defaultCapacity.toString());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (group) {
      setCapacity(group.capacity.toString());
    } else {
      setCapacity(defaultCapacity.toString());
    }
  }, [group, visible, defaultCapacity]);

  const handleSubmit = async () => {
    const capacityNum = parseInt(capacity);
    if (isNaN(capacityNum) || capacityNum < 1) {
      alert('La capacidad debe ser al menos 1');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        id: group?.id,
        capacity: capacityNum,
      });
      onDismiss();
    } catch (e: any) {
      console.error('Error al guardar grupo:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{group ? 'Editar Grupo' : 'Nuevo Grupo'}</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.helperText}>
              {group
                ? 'Modifica la capacidad del grupo'
                : 'El grupo se creará con la siguiente numeración disponible'}
            </Text>

            <TextInput
              label="Capacidad del grupo"
              value={capacity}
              onChangeText={setCapacity}
              mode="outlined"
              keyboardType="number-pad"
              style={styles.input}
              disabled={submitting}
            />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={submitting}>
            Cancelar
          </Button>
          <Button onPress={handleSubmit} mode="contained" loading={submitting} disabled={submitting}>
            {group ? 'Guardar' : 'Crear'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
  },
  helperText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
});
