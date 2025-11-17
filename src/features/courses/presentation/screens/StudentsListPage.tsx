import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, List, Text } from 'react-native-paper';

type FakeUser = { id?: string, authId: string, email: string, name: string };
const useUserCourses = () => ({
  courseUsers: [] as string[],
  fetchCourseUsers: (courseId: string) => console.log('fetchCourseUsers(id) (pendiente)'),
});
const useFakeUsers = () => ({
  getUsersByIds: (ids: string[]) => Promise.resolve([] as FakeUser[]),
});

interface StudentsListPageProps {
  courseId: string;
}

interface MappedStudent {
  id: string;
  name: string;
  email: string;
}

export const StudentsListPage = ({ courseId }: StudentsListPageProps) => {
  const { courseUsers: studentIds, fetchCourseUsers } = useUserCourses();
  const { getUsersByIds } = useFakeUsers();

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<MappedStudent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Traemos los IDs de los estudiantes inscritos
        await fetchCourseUsers(courseId);
        
        if (studentIds.length === 0) {
          console.log(`⚠️ No hay estudiantes inscritos en el curso ${courseId}`);
          setStudents([]);
          setLoading(false);
          return;
        }

        // 2. Obtenemos los usuarios (FakeUser)
        const fetchedUsers = await getUsersByIds(studentIds);
        
        // 3. Mapearlos para la UI
        const mapped = fetchedUsers.map((u) => ({
          id: u.authId,
          name: u.name || "Sin nombre",
          email: u.email || "Sin correo",
        }));

        setStudents(mapped);
      } catch (e: any) {
        console.error("❌ Error en _loadStudents:", e);
        setError(e.message || "Error cargando estudiantes");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [courseId, fetchCourseUsers, getUsersByIds, studentIds]);

  if (loading) {
    return <ActivityIndicator style={styles.centered} />;
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
        <Text>No hay estudiantes inscritos</Text>
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