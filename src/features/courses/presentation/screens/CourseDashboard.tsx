import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Dialog, Portal, Snackbar, Text } from 'react-native-paper';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useAuth } from '../../../auth/presentation/context/authContext';
import { useUserCourse } from '../../../user_courses/presentation/context/UserCourseContext';
import { Course } from '../../domain/entities/Course';
import { CourseCard } from '../components/CourseCard';
import { CourseFormDialog } from '../components/CourseFormDialog';
import { EmptyStudentState } from '../components/EmptyStudentState';
import { EmptyTeachingState } from '../components/EmptyTeachingState';
import { ErrorState } from '../components/ErrorState';
import { JoinCourseDialog } from '../components/JoinCourseDialog';
import { useCourses } from '../context/CourseContext';

export interface CourseFormData {
  id?: string; 
  name: string;
  code: string;
  maxStudents: number;
}

const TeachingTab = () => {
  const { teacherCourses, loading, error, loadTeacherCourses, addCourse, updateCourseInList, deleteCourseFromList, canCreateMore } = useCourses();
  const { user } = useAuth(); 
  const [formVisible, setFormVisible] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | undefined>(undefined);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | undefined>(undefined);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const openCreateForm = async () => {
    const canCreate = await canCreateMore();
    if (!canCreate) {
      setSnackbarMessage("Límite alcanzado: No puedes crear más de 3 cursos");
      return;
    }
    setCourseToEdit(undefined);
    setFormVisible(true);
  };

  const openEditForm = (course: Course) => {
    setCourseToEdit(course);
    setFormVisible(true);
  };

  const openDeleteDialog = (course: Course) => {
    setCourseToDelete(course);
    setDeleteVisible(true);
  };

  const handleFormSubmit = async (data: CourseFormData) => { 
    if (!user?.id) {
      setSnackbarMessage("Error: Usuario no autenticado.");
      setFormVisible(false);
      return;
    }
    
    try {
      if (data.id) { 
        if (!courseToEdit) return; 

        const updatedCourse = courseToEdit.copyWith({
          name: data.name,
          code: data.code,
          maxStudents: data.maxStudents,
        });

        await updateCourseInList(updatedCourse);
        setSnackbarMessage("Curso actualizado correctamente");
      } else {
        const newCourse = new Course({
          name: data.name,
          code: data.code,
          maxStudents: data.maxStudents,
          teacherId: user.id, 
          createdAt: new Date(),
        });
        
        await addCourse(newCourse); 
        setSnackbarMessage("Curso creado correctamente");
      }
    } catch (e: any) {
      setSnackbarMessage(e.message || "Error al guardar el curso");
    }
    setFormVisible(false);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete?.id) return;
    try {
      await deleteCourseFromList(courseToDelete.id);
      setSnackbarMessage(`Curso '${courseToDelete.name}' eliminado`);
    } catch (e: any) {
      setSnackbarMessage(e.message || "Error al eliminar");
    }
    setDeleteVisible(false);
  };

  if (loading && teacherCourses.length === 0) {
    return <ActivityIndicator style={styles.centered} />;
  }
  if (error) {
    return <ErrorState onRetry={loadTeacherCourses} error={error} />;
  }
  if (teacherCourses.length === 0) {
    return <EmptyTeachingState onCreateCourse={openCreateForm} />;
  }

  return (
    <View style={styles.tabContainer}>
      <Button icon="plus" mode="contained" onPress={openCreateForm} style={styles.createButton}>
        Crear Curso
      </Button>
      <FlatList
        data={teacherCourses}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onEdit={openEditForm}
            onDelete={openDeleteDialog}
          />
        )}
      />

      <CourseFormDialog
        visible={formVisible}
        onDismiss={() => setFormVisible(false)}
        onSubmit={handleFormSubmit} 
        course={courseToEdit}
      />

      <Portal>
        <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)}>
          <Dialog.Title>Eliminar curso</Dialog.Title>
          <Dialog.Content>
            <Text>¿Seguro que deseas eliminar '{courseToDelete?.name}'?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteVisible(false)}>Cancelar</Button>
            <Button onPress={handleDeleteConfirm} textColor="red">Eliminar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!snackbarMessage}
        onDismiss={() => setSnackbarMessage(null)}
        duration={3000}>
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

// --- Pestaña "Cursos Inscritos" (Estudiante) ---
const EnrolledTab = () => {
  const { user } = useAuth();
  const { loadCoursesByIds } = useCourses();
  const { state, fetchUserCourses } = useUserCourse();
  
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [joinVisible, setJoinVisible] = useState(false);

  useEffect(() => {
    if (user?.id) {
      console.log("EnrolledTab: Cargando cursos para usuario:", user.id);
      fetchUserCourses(user.id);
    }
  }, [user?.id, fetchUserCourses]);

  // Cargar los detalles completos de los cursos cuando los IDs cambian
  useEffect(() => {
    const loadCourseDetails = async () => {
      if (state.enrolledCourses.length > 0) {
        try {
          const courseIds = state.enrolledCourses.map(uc => uc.courseId);
          const courses = await loadCoursesByIds(courseIds);
          
          // Filtrar cursos donde el usuario NO es el profesor
          const studentCourses = courses.filter(course => course.teacherId !== user?.id);
          setEnrolledCourses(studentCourses);
        } catch (error) {
          console.error("Error cargando detalles de cursos:", error);
        }
      } else {
        setEnrolledCourses([]);
      }
    };
    
    loadCourseDetails();
  }, [state.enrolledCourses, loadCoursesByIds, user?.id]);

  const handleJoinSuccess = () => {
    console.log("Join exitoso, recargando cursos del usuario");
    if (user?.id) {
      fetchUserCourses(user.id);
    }
  };

  if (state.isLoading) {
    return <ActivityIndicator style={styles.centered} />;
  }

  if (state.error) {
    return (
      <View style={styles.centered}>
        <Text>Error: {state.error}</Text>
        <Button onPress={() => user?.id && fetchUserCourses(user.id)}>
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.tabContainer}>
      <Button 
        icon="account-plus-outline" 
        mode="outlined" 
        onPress={() => setJoinVisible(true)} 
        style={styles.createButton}
      >
        Unirse al Curso
      </Button>
      
      {enrolledCourses.length === 0 ? (
        <EmptyStudentState />
      ) : (
        <FlatList
          data={enrolledCourses}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => <CourseCard course={item} />}
        />
      )}
      
      <JoinCourseDialog
        visible={joinVisible}
        onDismiss={() => setJoinVisible(false)}
        onJoinSuccess={handleJoinSuccess}
      />
    </View>
  );
};

// --- Componente Principal (Dashboard) ---
export const CourseDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'teaching', title: 'Mis Cursos' },
    { key: 'enrolled', title: 'Cursos Inscritos' },
  ]);

  const renderScene = SceneMap({
    teaching: TeachingTab,
    enrolled: EnrolledTab,
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="JC Academy" />
        <Button mode="text" onPress={handleLogout} color="red">Salir</Button>
      </Appbar.Header>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={props => <TabBar {...props} />}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
});