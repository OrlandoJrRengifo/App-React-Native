import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import { CourseStudent, GetCourseStudentsUseCase } from '@/src/features/user_courses/domain/usecases/GetCourseStudentsUseCase';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, List, Text } from 'react-native-paper';

interface StudentsListPageProps {
  courseId: string;
}

export const StudentsListPage = ({ courseId }: StudentsListPageProps) => {
  const container = useDI();
  const getCourseStudentsUC = container.resolve(TOKENS.GetCourseStudentsUC) as GetCourseStudentsUseCase;

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`📚 Cargando estudiantes del curso: ${courseId}`);
        const fetchedStudents = await getCourseStudentsUC.execute(courseId);
        
        console.log(`✅ Se encontraron ${fetchedStudents.length} estudiantes`);
        setStudents(fetchedStudents);
      } catch (e: any) {
        console.error("❌ Error al cargar estudiantes:", e);
        setError(e.message || "Error cargando estudiantes");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [courseId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando estudiantes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  if (students.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No hay estudiantes inscritos en este curso</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={students}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <List.Item
          title={item.name}
          description={item.email}
          left={() => (
            <Avatar.Text 
              size={40} 
              label={item.name.length > 0 ? item.name[0].toUpperCase() : '?'} 
              style={styles.avatar}
            />
          )}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 8,
  },
});