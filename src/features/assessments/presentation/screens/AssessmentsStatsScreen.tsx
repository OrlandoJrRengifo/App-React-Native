import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import { FakeUserUseCase } from '@/src/features/fake_users/domain/usecases/FakeUserUseCase';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, DataTable, Text, useTheme } from 'react-native-paper';
import { useAssessments } from '../context/AssessmentContext';

type AssessmentStatsRouteParams = {
  AssessmentStats: {
    activityId: string;
    activityName: string;
    courseId: string;
  };
};

type AssessmentStatsScreenRouteProp = RouteProp<AssessmentStatsRouteParams, 'AssessmentStats'>;

interface StudentStats {
  userId: string;
  userName: string;
  punctuality: number;
  contributions: number;
  commitment: number;
  attitude: number;
  overall: number;
}

export const AssessmentsStatsScreen = () => {
  const route = useRoute<AssessmentStatsScreenRouteProp>();
  const { activityId, activityName } = route.params;
  const theme = useTheme();
  const container = useDI();
  const fakeUserUseCases = container.resolve(TOKENS.FakeUserUseCases) as FakeUserUseCase;

  const { assessments, loading, loadAssessmentsByActivity, getAverageRatings } = useAssessments();
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadAssessmentsByActivity(activityId);
  }, [activityId]);

  useEffect(() => {
    if (assessments.length > 0) {
      calculateStats();
    }
  }, [assessments]);

  const calculateStats = async () => {
    setLoadingStats(true);
    try {
      // Get unique students being rated
      const uniqueStudents = [...new Set(assessments.map(a => a.toRate))];

      const stats: StudentStats[] = [];
      for (const studentId of uniqueStudents) {
        const avgRatings = await getAverageRatings(activityId, studentId);
        
        // Get student name
        let userName = `Usuario ${studentId.substring(0, 8)}`;
        try {
          const fakeUser = await fakeUserUseCases.getUserByAuthId(studentId);
          if (fakeUser) {
            userName = fakeUser.name;
          }
        } catch (error) {
          console.error('Error getting user name:', error);
        }
        
        if (avgRatings) {
          stats.push({
            userId: studentId,
            userName,
            punctuality: avgRatings.punctuality,
            contributions: avgRatings.contributions,
            commitment: avgRatings.commitment,
            attitude: avgRatings.attitude,
            overall: avgRatings.general,
          });
        }
      }

      // Sort by overall rating descending
      stats.sort((a, b) => b.overall - a.overall);
      setStudentStats(stats);
    } catch (error) {
      console.error('Error calculating stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Calculate course averages
  const courseAverages = studentStats.length > 0 ? {
    punctuality: studentStats.reduce((sum, s) => sum + s.punctuality, 0) / studentStats.length,
    contributions: studentStats.reduce((sum, s) => sum + s.contributions, 0) / studentStats.length,
    commitment: studentStats.reduce((sum, s) => sum + s.commitment, 0) / studentStats.length,
    attitude: studentStats.reduce((sum, s) => sum + s.attitude, 0) / studentStats.length,
    overall: studentStats.reduce((sum, s) => sum + s.overall, 0) / studentStats.length,
  } : null;

  if (loading || loadingStats) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Estadísticas - {activityName}
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Promedios de evaluación por estudiante
        </Text>
      </View>

      {courseAverages && (
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.summaryTitle}>
              Promedios del Curso
            </Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text variant="bodySmall">Puntualidad</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {courseAverages.punctuality.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="bodySmall">Aportes</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {courseAverages.contributions.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="bodySmall">Compromiso</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {courseAverages.commitment.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="bodySmall">Actitud</Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {courseAverages.attitude.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="bodySmall">Promedio General</Text>
                <Text variant="titleLarge" style={[styles.summaryValue, styles.overallValue]}>
                  {courseAverages.overall.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {studentStats.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="titleMedium">No hay evaluaciones disponibles</Text>
          <Text variant="bodySmall" style={{ marginTop: 8, textAlign: 'center' }}>
            Las estadísticas aparecerán cuando los estudiantes califiquen
          </Text>
        </View>
      ) : (
        <Card style={styles.tableCard}>
          <Card.Content>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Estudiante</DataTable.Title>
                <DataTable.Title numeric>Puntual.</DataTable.Title>
                <DataTable.Title numeric>Aportes</DataTable.Title>
                <DataTable.Title numeric>Comprom.</DataTable.Title>
                <DataTable.Title numeric>Actitud</DataTable.Title>
                <DataTable.Title numeric>General</DataTable.Title>
              </DataTable.Header>

              <FlatList
                data={studentStats}
                keyExtractor={(item) => item.userId}
                renderItem={({ item }) => (
                  <DataTable.Row>
                    <DataTable.Cell>{item.userName}</DataTable.Cell>
                    <DataTable.Cell numeric>{item.punctuality.toFixed(1)}</DataTable.Cell>
                    <DataTable.Cell numeric>{item.contributions.toFixed(1)}</DataTable.Cell>
                    <DataTable.Cell numeric>{item.commitment.toFixed(1)}</DataTable.Cell>
                    <DataTable.Cell numeric>{item.attitude.toFixed(1)}</DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Text style={[styles.overallCell, getOverallColor(item.overall)]}>
                        {item.overall.toFixed(1)}
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                )}
              />
            </DataTable>
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

const getOverallColor = (value: number) => {
  if (value >= 4.5) return { color: '#4caf50', fontWeight: 'bold' as const };
  if (value >= 3.5) return { color: '#ff9800', fontWeight: 'bold' as const };
  return { color: '#f44336', fontWeight: 'bold' as const };
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
  summaryCard: {
    margin: 16,
    elevation: 4,
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    marginVertical: 8,
    minWidth: '30%',
  },
  summaryValue: {
    marginTop: 4,
    fontWeight: 'bold',
  },
  overallValue: {
    color: '#1976d2',
  },
  tableCard: {
    margin: 16,
    flex: 1,
  },
  overallCell: {
    fontSize: 16,
  },
});
