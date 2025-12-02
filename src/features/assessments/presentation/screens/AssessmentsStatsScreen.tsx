// src/features/assessments/presentation/screens/AssessmentsStatsScreen.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useAssessment } from "../context/assessment_context";

/*
  Para resolver nombres de usuarios necesitamos getUsersByIds.
  Reutilizamos el mismo approach que en la lista:
*/
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";

// Crear instancia que requiere tu fuente de datos
const localPreferences = LocalPreferencesAsyncStorage.getInstance();

// Pasar prefs al constructor, como tu clase lo pide
const dataSource = new FakeUserRobleSource(localPreferences);

// Crear usecase
const fakeUserUseCase = new FakeUserUseCase(dataSource);

// Usar hook
const { getUsersByIds } = useFakeUsers(fakeUserUseCase);

import { FakeUserRobleSource } from "../../../fake_users/data/datasources/FakeUserRobleSource";
import { FakeUserUseCase } from "../../../fake_users/domain/usecases/FakeUserUseCase";
import { useFakeUsers } from "../../../fake_users/presentation/context/useFakeUsers";

type UserStats = {
  userId: string;
  userName: string;
  punctuality: number;
  contributions: number;
  commitment: number;
  attitude: number;
  general: number;
};

export default function AssessmentsStatsScreen({ route }: any) {
  const { activityId } = route.params;
  const { getAssessmentsByActivity, getAverageRatings } = useAssessment();

  const dataSource = new FakeUserRobleSource(localPreferences); // ajustar
  const fakeUserUseCase = new FakeUserUseCase(dataSource);
  const { getUsersByIds } = useFakeUsers(fakeUserUseCase);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats[]>([]);
  const [overall, setOverall] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const assessments = await getAssessmentsByActivity(activityId);

        // Agrupar por toRate
        const grouped: Record<string, string[]> = {};
        assessments.forEach((a: any) => {
          grouped[a.toRate] = grouped[a.toRate] ?? [];
          grouped[a.toRate].push(a.id!);
        });

        const userIds = Object.keys(grouped);
        const users = userIds.length > 0 ? await getUsersByIds(userIds) : [];

        const results: UserStats[] = [];
        for (const u of users) {
          const avg = await getAverageRatings(activityId, u.authId);
          results.push({
            userId: u.authId,
            userName: u.name,
            punctuality: avg.punctuality,
            contributions: avg.contributions,
            commitment: avg.commitment,
            attitude: avg.attitude,
            general: avg.general,
          });
        }

        if (!mounted) return;
        setStats(results);
        const overallAvg = results.length > 0 ? results.map((r) => r.general).reduce((a, b) => a + b, 0) / results.length : 0;
        setOverall(overallAvg);
      } catch (e) {
        console.warn("Error loading stats", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No stats available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={stats}
        keyExtractor={(i) => i.userId}
        ListHeaderComponent={() => (
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>Promedio</Text>
            <Text style={styles.headerSubtitle}>Promedio general de todos los estudiantes</Text>
            <Text style={styles.headerValue}>{overall.toFixed(2)}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.userName}</Text>
            <Text>Punctuality: {item.punctuality.toFixed(2)}</Text>
            <Text>Contributions: {item.contributions.toFixed(2)}</Text>
            <Text>Commitment: {item.commitment.toFixed(2)}</Text>
            <Text>Attitude: {item.attitude.toFixed(2)}</Text>
            <View style={{ height: 8 }} />
            <Text style={{ fontWeight: "bold" }}>Promedio general: {item.general.toFixed(2)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerCard: { padding: 16, margin: 12, borderRadius: 12, backgroundColor: "#fff", elevation: 2 },
  headerTitle: { fontSize: 16, fontWeight: "bold" },
  headerSubtitle: { fontSize: 14, color: "#666", marginTop: 8 },
  headerValue: { fontSize: 22, fontWeight: "bold", marginTop: 8, textAlign: "right" },
  card: { padding: 12, marginHorizontal: 8, marginVertical: 6, backgroundColor: "#fff", borderRadius: 8, elevation: 1 },
  name: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
});
