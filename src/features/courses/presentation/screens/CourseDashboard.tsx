import { useAuth } from '@/src/features/auth/presentation/context/authContext';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Course } from '../../domain/entities/Course';
import CourseCard from '.././components/CourseCard';
import CourseFormModal from '.././components/CourseFormModal';
import { EmptyStudentState, EmptyTeachingState, ErrorState } from '.././components/EmptyState';
import JoinCourseModal from '.././components/JoinCourseModal';
import { useCourses } from '../context/CourseContext';

interface CourseDashboardProps {
  navigation: any;
}

const CourseDashboard = ({ navigation }: CourseDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'teaching' | 'enrolled'>('teaching');
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const {
    courses,
    isLoading,
    error,
    loadTeacherCourses,
    loadCoursesByIds,
    addCourse,
    updateCourseInList,
    deleteCourseFromList,
    canCreateMore,
  } = useCourses();

  const { user, logout } = useAuth();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await loadTeacherCourses();
    
    // Aquí deberías cargar los cursos inscritos del usuario
    // usando tu módulo de user_courses cuando lo tengas listo
    // const userId = user?.id;
    // if (userId) {
    //   const userCourseIds = await getUserCourseIds(userId);
    //   const enrolled = await loadCoursesByIds(userCourseIds);
    //   setEnrolledCourses(enrolled);
    // }
  };

  const handleCreateCourse = async () => {
    const canCreate = await canCreateMore();
    if (!canCreate) {
      Alert.alert('Límite alcanzado', 'No puedes crear más de 3 cursos');
      return;
    }
    setSelectedCourse(null);
    setFormModalVisible(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormModalVisible(true);
  };

  const handleSubmitCourse = async (courseData: any) => {
    try {
      if (courseData._id) {
        await updateCourseInList(courseData as Course);
        Alert.alert('¡Éxito!', `Curso '${courseData.name}' actualizado`);
      } else {
        await addCourse({
          name: courseData.name,
          code: courseData.code,
          max_students: courseData.max_students,
        });
        Alert.alert('¡Éxito!', `Curso '${courseData.name}' creado correctamente`);
      }
      setFormModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el curso');
    }
  };

  const handleDeleteCourse = (course: Course) => {
    Alert.alert(
      'Eliminar curso',
      `¿Seguro que deseas eliminar '${course.name}'?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteCourseFromList(course._id);
            Alert.alert('Curso eliminado', `Se eliminó '${course.name}'`);
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const handleCoursePress = (course: Course) => {
    navigation.navigate('CourseDetail', {
      courseId: course._id,
      courseName: course.name,
    });
  };

  const renderTeachingTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Cursos</Text>
        <TouchableOpacity
          style={[
            styles.createButton,
            courses.length >= 3 && styles.buttonDisabled,
          ]}
          onPress={handleCreateCourse}
          disabled={courses.length >= 3}>
          <Text style={styles.buttonText}>+ Crear Curso</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error ? (
        <ErrorState onRetry={loadTeacherCourses} />
      ) : courses.length === 0 ? (
        <EmptyTeachingState onCreateCourse={handleCreateCourse} />
      ) : (
        <ScrollView style={styles.courseList}>
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
              onPress={handleCoursePress}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderEnrolledTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Cursos Inscritos ({enrolledCourses.length})
        </Text>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => setJoinModalVisible(true)}>
          <Text style={styles.joinButtonText}>Unirse al Curso</Text>
        </TouchableOpacity>
      </View>

      {enrolledCourses.length === 0 ? (
        <EmptyStudentState />
      ) : (
        <ScrollView style={styles.courseList}>
          {enrolledCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onPress={handleCoursePress}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>JC academy</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'teaching' && styles.activeTab]}
          onPress={() => setActiveTab('teaching')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'teaching' && styles.activeTabText,
            ]}>
            Mis Cursos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'enrolled' && styles.activeTab]}
          onPress={() => setActiveTab('enrolled')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'enrolled' && styles.activeTabText,
            ]}>
            Cursos Inscritos ({enrolledCourses.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'teaching' ? renderTeachingTab() : renderEnrolledTab()}

      {/* Modals */}
      <CourseFormModal
        visible={formModalVisible}
        course={selectedCourse}
        onClose={() => setFormModalVisible(false)}
        onSubmit={handleSubmitCourse}
      />

      <JoinCourseModal
        visible={joinModalVisible}
        onClose={() => setJoinModalVisible(false)}
        onJoinSuccess={(courses: React.SetStateAction<Course[]>) => setEnrolledCourses(courses)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  logoutText: {
    color: '#FFF',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  joinButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  joinButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseList: {
    flex: 1,
  },
});

export default CourseDashboard;