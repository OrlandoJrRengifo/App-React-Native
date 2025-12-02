// src/features/assessments/presentation/components/AssessmentRatingModal.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Assessment } from "../../domain/entities/Assessment";

type Props = {
  assessment: Assessment | null;
  onClose: () => void;
  onSave: (
    assessmentId: string,
    punctuality: number,
    contributions: number,
    commitment: number,
    attitude: number
  ) => Promise<void>;
  saving?: boolean;
};

const descriptions: Record<number, string> = {
  2: "Needs Improvement",
  3: "Adequate",
  4: "Good",
  5: "Excellent",
};

export default function AssessmentRatingModal({ assessment, onClose, onSave, saving = false }: Props) {
  const [ratings, setRatings] = useState<Record<string, number | null>>({
    punctuality: null,
    contributions: null,
    commitment: null,
    attitude: null,
  });

  useEffect(() => {
    if (!assessment) {
      setRatings({ punctuality: null, contributions: null, commitment: null, attitude: null });
    } else {
      setRatings({
        punctuality: assessment.punctuality ?? null,
        contributions: assessment.contributions ?? null,
        commitment: assessment.commitment ?? null,
        attitude: assessment.attitude ?? null,
      });
    }
  }, [assessment]);

  if (!assessment) return null;

  const setRating = (key: string, value: number) => setRatings((s) => ({ ...s, [key]: value }));

  const isValid = () => {
    return !Object.values(ratings).some((v) => v === null || v === undefined);
  };

  const handleSave = async () => {
    if (!isValid()) return;
    await onSave(
      assessment.id!,
      ratings.punctuality as number,
      ratings.contributions as number,
      ratings.commitment as number,
      ratings.attitude as number
    );
  };

  const buildRatingRow = (key: string, label: string) => {
    const val = ratings[key];
    return (
      <View key={key} style={{ marginBottom: 12 }}>
        <Text style={{ fontWeight: "bold" }}>{label}</Text>
        <View style={{ flexDirection: "row", marginTop: 6 }}>
          {[2, 3, 4, 5].map((v) => {
            const filled = val != null && v <= val;
            return (
              <TouchableOpacity key={v} onPress={() => setRating(key, v)} style={{ padding: 6 }}>
                <Text style={{ fontSize: 26 }}>{filled ? "★" : "☆"}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {val != null && <Text style={{ fontSize: 12 }}>{descriptions[val] ?? ""}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>Grade {assessment.toRate}</Text>
        <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
          {buildRatingRow("punctuality", "Punctuality")}
          {buildRatingRow("contributions", "Contributions")}
          {buildRatingRow("commitment", "Commitment")}
          {buildRatingRow("attitude", "Attitude")}
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onClose} style={styles.btnCancel}>
            <Text>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSave} style={styles.btnSave} disabled={!isValid() || saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff" }}>Save</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: "85%",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  actions: { flexDirection: "row", justifyContent: "flex-end", paddingTop: 8 },
  btnCancel: { padding: 10, marginRight: 8 },
  btnSave: { padding: 10, backgroundColor: "#1976D2", borderRadius: 6 },
});
