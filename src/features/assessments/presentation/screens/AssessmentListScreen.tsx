import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  Portal,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useAssessments } from '../context/AssessmentContext';
import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import { Assessment } from '../../domain/entities/Assessment';
import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import { FakeUserUseCase } from '@/src/features/fake_users/domain/usecases/FakeUserUseCase';
import { FakeUser } from '@/src/features/fake_users/domain/entities/FakeUser';

type AssessmentListRouteParams = {
  AssessmentList: {
    activityId: string;
    activityName: string;
  };
};

type AssessmentListScreenRouteProp = RouteProp<AssessmentListRouteParams, 'AssessmentList'>;

export const AssessmentListScreen = () => {
  const route = useRoute<AssessmentListScreenRouteProp>();
  const { activityId, activityName } = route.params;
  const theme = useTheme();
  const { user } = useAuth();
  const container = useDI();
  const fakeUserUseCases = container.resolve(TOKENS.FakeUserUseCases) as FakeUserUseCase;

  const { assessments, loading, loadAssessmentsByActivityAndRater, gradeAssessment } = useAssessments();

  const [gradeDialogVisible, setGradeDialogVisible] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [punctuality, setPunctuality] = useState('');
  const [contributions, setContributions] = useState('');
  const [commitment, setCommitment] = useState('');
  const [attitude, setAttitude] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (user?.id) {
      loadAssessmentsByActivityAndRater(activityId, user.id);
    }
  }, [activityId, user]);

  // Load user names when assessments change
  useEffect(() => {
    const loadUserNames = async () => {
      const userIds = [...new Set(assessments.map(a => a.toRate))];
      const names = new Map<string, string>();
      
      for (const userId of userIds) {
        try {
          const fakeUser = await fakeUserUseCases.getUserByAuthId(userId);
          if (fakeUser) {
            names.set(userId, fakeUser.name);
          } else {
            names.set(userId, `Usuario ${userId.substring(0, 8)}`);
          }
        } catch (error) {
          names.set(userId, `Usuario ${userId.substring(0, 8)}`);
        }
      }
      
      setUserNames(names);
    };

    if (assessments.length > 0) {
      loadUserNames();
    }
  }, [assessments]);

  const handleOpenGradeDialog = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setPunctuality(assessment.punctuality?.toString() || '');
    setContributions(assessment.contributions?.toString() || '');
    setCommitment(assessment.commitment?.toString() || '');
    setAttitude(assessment.attitude?.toString() || '');
    setGradeDialogVisible(true);
  };

  const handleSubmitGrade = async () => {
    if (!selectedAssessment?.id) return;

    const punc = parseInt(punctuality);
    const cont = parseInt(contributions);
    const comm = parseInt(commitment);
    const att = parseInt(attitude);

    if (isNaN(punc) || isNaN(cont) || isNaN(comm) || isNaN(att)) {
      setSnackbarMessage('Por favor ingresa valores numéricos válidos');
      return;
    }

    if (punc < 0 || punc > 5 || cont < 0 || cont > 5 || comm < 0 || comm > 5 || att < 0 || att > 5) {
      setSnackbarMessage('Los valores deben estar entre 0 y 5');
      return;
    }

    try {
      await gradeAssessment(selectedAssessment.id, {
        punctuality: punc,
        contributions: cont,
        commitment: comm,
        attitude: att,
      });
      setSnackbarMessage('Calificación guardada exitosamente');
      setGradeDialogVisible(false);
      if (user?.id) {
        loadAssessmentsByActivityAndRater(activityId, user.id);
      }
    } catch (error) {
      setSnackbarMessage('Error al guardar la calificación');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando evaluaciones...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Evaluaciones - {activityName}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Califica a tus compañeros de grupo
        </Text>
      </View>

      {assessments.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="titleMedium">No hay compañeros para evaluar</Text>
          <Text variant="bodySmall" style={{ marginTop: 8, textAlign: 'center' }}>
            Las evaluaciones aparecerán cuando la actividad esté activa
          </Text>
        </View>
      ) : (
        <FlatList
          data={assessments}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardInfo}>
                    <Text variant="titleMedium" style={styles.cardTitle}>
                      {userNames.get(item.toRate) || 'Cargando...'}
                    </Text>
                    <Text variant="bodySmall" style={styles.cardSubtitle}>
                      {item.punctuality !== null
                        ? `Calificado: Puntualidad ${item.punctuality}, Aportes ${item.contributions}, Compromiso ${item.commitment}, Actitud ${item.attitude}`
                        : 'Sin calificar'}
                    </Text>
                  </View>
                </View>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleOpenGradeDialog(item)}>
                  {item.punctuality !== null ? 'Editar' : 'Calificar'}
                </Button>
              </Card.Actions>
            </Card>
          )}
        />
      )}

      <Portal>
        <Dialog visible={gradeDialogVisible} onDismiss={() => setGradeDialogVisible(false)}>
          <Dialog.Title>Calificar estudiante</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodySmall" style={{ marginBottom: 16 }}>
              Califica cada aspecto de 0 a 5
            </Text>
            <TextInput
              label="Puntualidad (0-5)"
              value={punctuality}
              onChangeText={setPunctuality}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Aportes (0-5)"
              value={contributions}
              onChangeText={setContributions}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Compromiso (0-5)"
              value={commitment}
              onChangeText={setCommitment}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Actitud (0-5)"
              value={attitude}
              onChangeText={setAttitude}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setGradeDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleSubmitGrade}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!snackbarMessage}
        onDismiss={() => setSnackbarMessage(null)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  cardSubtitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  input: {
    marginBottom: 12,
  },
});
