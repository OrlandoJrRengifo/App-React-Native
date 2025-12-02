// src/features/assessments/presentation/screens/AssessmentListScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Assessment } from "../../domain/entities/Assessment";
import { useAssessment } from "../context/assessment_context";

/*
  IMPORTS RELACIONADOS CON FAKE USERS
  Ajusta las rutas según tu repo:
  - FakeUserRobleSource: data source class (export class FakeUserRobleSource ...)
  - FakeUserUseCase: usecase class
  - useFakeUsers: hook file que expone useFakeUsers(fakeUserUseCase)
*/
import { FakeUserRobleSource } from "../../../fake_users/data/datasources/FakeUserRobleSource";
import { FakeUserUseCase } from "../../../fake_users/domain/usecases/FakeUserUseCase";
import { useFakeUsers } from "../../../fake_users/presentation/context/useFakeUsers"; // ajusta ruta

// Si tienes un módulo de preferencias (local storage) inyectable, ajústalo:
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";

// Crear instancia que requiere tu fuente de datos
const localPreferences = LocalPreferencesAsyncStorage.getInstance();

// Pasar prefs al constructor, como tu clase lo pide
const dataSource = new FakeUserRobleSource(localPreferences);

// Crear usecase
const fakeUserUseCase = new FakeUserUseCase(dataSource);

// Usar hook
const { getUsersByIds } = useFakeUsers(fakeUserUseCase);



import AssessmentRatingModal from "./AssessmentRatingModal";

type Props = {
  route: { params: { activityId: string; currentUserId: string } };
  navigation?: any;
};

export default function AssessmentListScreen({ route, navigation }: Props) {
  const { activityId, currentUserId } = route.params;
  const { loadAssessmentsByActivityAndRater, assessments, getAverageRatings, gradeAssessment } =
    useAssessment();

  // fake users controller instanciado localmente (usa tu useFakeUsers hook)
  const dataSource = new FakeUserRobleSource(localPreferences); // ajustar
  const fakeUserUseCase = new FakeUserUseCase(dataSource);
  const { getUsersByIds } = useFakeUsers(fakeUserUseCase);

  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Assessment | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        // 1) cargar y actualizar context (assessment_context mantiene la lista)
        await loadAssessmentsByActivityAndRater(activityId, currentUserId);

        // 2) resolver nombres de usuarios (toRate)
        const ids = Array.from(new Set((assessments || []).map((a) => a.toRate))).filter(Boolean);
        if (ids.length > 0 && getUsersByIds) {
          try {
            const users = await getUsersByIds(ids);
            if (!mounted) return;
            const map: Record<string, string> = {};
            users.forEach((u: any) => {
              const id = u.authId ?? u.id ?? u.userId;
              map[id] = u.name ?? u.displayName ?? u.email ?? id;
            });
            setUserNames(map);
          } catch (e) {
            console.warn("getUsersByIds failed", e);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId, currentUserId]);

  const list = useMemo(() => assessments ?? [], [assessments]);

  function openRating(assessment: Assessment) {
    setSelected(assessment);
  }

  function closeRating() {
    setSelected(null);
  }

  async function onSaveRating(
    assessmentId: string,
    punctuality: number,
    contributions: number,
    commitment: number,
    attitude: number
  ) {
    setSaving(true);
    try {
      const ok = await gradeAssessment(assessmentId, punctuality, contributions, commitment, attitude);
      if (ok) {
        closeRating();
        // recargar lista desde el context
        await loadAssessmentsByActivityAndRater(activityId, currentUserId);
      } else {
        console.warn("gradeAssessment returned false");
      }
    } catch (e) {
      console.warn("Error grading assessment", e);
    } finally {
      setSaving(false);
    }
  }

  function renderItem({ item }: { item: Assessment }) {
    const name = userNames[item.toRate] ?? item.toRate;
    const timeText = item.timeWin ?? "-";
    return (
      <TouchableOpacity style={styles.item} onPress={() => openRating(item)}>
        <View>
          <Text style={styles.title}>To rate: {name}</Text>
          <Text style={styles.subtitle}>Time: {timeText}</Text>
        </View>
        <Text style={styles.edit}>✎</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Assessments</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : list.length === 0 ? (
        <View style={styles.center}>
          <Text>No assessments found</Text>
        </View>
      ) : (
        <FlatList data={list} keyExtractor={(i) => i.id ?? `${i.activityId}-${i.toRate}`} renderItem={renderItem} />
      )}

      {/* Floating action button: muestra estadisticas si la visibilidad es public */}
      {list.length > 0 && list[0].visibility === "public" && (
        <Pressable
          style={styles.fab}
          onPress={async () => {
            // abrir bottom sheet con promedios (te dejo navegación o modal)
            const avg = await getAverageRatings(activityId, currentUserId);
            // mostramos modal simple con resultados:
            navigation?.navigate?.("AssessmentsStatsScreen", { activityId });
          }}
        >
          <Text style={styles.fabText}>📊</Text>
        </Pressable>
      )}

      {/* Rating modal */}
      <Modal visible={selected !== null} animationType="slide" transparent onRequestClose={closeRating}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <AssessmentRatingModal
              assessment={selected}
              onClose={closeRating}
              onSave={onSaveRating}
              saving={saving}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { fontSize: 18, fontWeight: "bold", padding: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  item: { padding: 12, borderBottomWidth: 1, borderColor: "#eee", flexDirection: "row", justifyContent: "space-between" },
  title: { fontWeight: "bold", fontSize: 16 },
  subtitle: { color: "#666", marginTop: 4 },
  edit: { fontSize: 18, color: "#666" },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  fabText: { color: "#fff", fontSize: 24 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modal: { backgroundColor: "#fff", borderTopLeftRadius: 12, borderTopRightRadius: 12 },
});
