/**
 * @fileoverview Diálogo para crear/editar categorías.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, RadioButton, Text, TextInput } from 'react-native-paper';
import { Category, GroupingMethod } from '../../domain/entities/Category';

interface CategoryFormDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  category?: Category;
}

export interface CategoryFormData {
  id?: string;
  name: string;
  groupingMethod: GroupingMethod;
  maxGroupSize: number;
}

export const CategoryFormDialog = ({
  visible,
  onDismiss,
  onSubmit,
  category,
}: CategoryFormDialogProps) => {
  const [name, setName] = useState('');
  const [groupingMethod, setGroupingMethod] = useState<GroupingMethod>('random');
  const [maxGroupSize, setMaxGroupSize] = useState('4');
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!category;

  useEffect(() => {
    if (category) {
      setName(category.name);
      setGroupingMethod(category.groupingMethod);
      setMaxGroupSize(category.maxGroupSize.toString());
    } else {
      setName('');
      setGroupingMethod('random');
      setMaxGroupSize('4');
    }
  }, [category, visible]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Por favor ingresa un nombre para la categoría');
      return;
    }

    const maxSize = parseInt(maxGroupSize);
    if (isNaN(maxSize) || maxSize < 1) {
      alert('El tamaño máximo del grupo debe ser al menos 1');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        id: category?.id,
        name: name.trim(),
        groupingMethod,
        maxGroupSize: maxSize,
      });
      onDismiss();
    } catch (e: any) {
      console.error('Error al guardar categoría:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{category ? 'Editar Categoría' : 'Nueva Categoría'}</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TextInput
              label="Nombre de la categoría"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              disabled={submitting}
            />

            {!isEditing && (
              <>
                <Text style={styles.sectionTitle}>Método de Agrupación</Text>
                <RadioButton.Group
                  onValueChange={(value) => setGroupingMethod(value as GroupingMethod)}
                  value={groupingMethod}
                >
                  <View style={styles.radioItem}>
                    <RadioButton value="random" disabled={submitting} />
                    <Text style={styles.radioLabel}>Aleatorio (Random)</Text>
                  </View>
                  <View style={styles.radioItem}>
                    <RadioButton value="self-signed" disabled={submitting} />
                    <Text style={styles.radioLabel}>Auto-inscripción (Self-signed)</Text>
                  </View>
                </RadioButton.Group>

                <TextInput
                  label="Tamaño máximo del grupo"
                  value={maxGroupSize}
                  onChangeText={setMaxGroupSize}
                  mode="outlined"
                  keyboardType="number-pad"
                  style={styles.input}
                  disabled={submitting}
                />
              </>
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={submitting}>
            Cancelar
          </Button>
          <Button onPress={handleSubmit} mode="contained" loading={submitting} disabled={submitting}>
            {category ? 'Guardar' : 'Crear'}
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
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 16,
  },
});
