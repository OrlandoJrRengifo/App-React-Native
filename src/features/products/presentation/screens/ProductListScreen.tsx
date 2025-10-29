import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import CourseCard from '.././components/CourseCard';
import CourseFormModal from '.././components/CourseFormModal';
import { EmptyStudentState, EmptyTeachingState } from '.././components/EmptyStates';

export default function CourseDashboard({ navigation }: { navigation: any }) {
  const [activeTab, setActiveTab] = useState<'teaching' | 'enrolled'>('teaching');
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const { logout } = useAuth();

  const handleCreateCourse = () => {
    setFormModalVisible(true);
  };

  const handleSubmitCourse = (courseData: any) => {
    const newCourse = {
      id: Date.now().toString(),
      name: courseData.name,
      code: courseData.code,
      max_students: courseData.max_students,
      created_at: new Date().toLocaleDateString('es-ES'),
    };
    
    setCourses([...courses, newCourse]);
    setFormModalVisible(false);
  };

  const handleEditCourse = (course: any) => {
    console.log('Editar curso:', course);
    // TODO: Implementar edición
  };

  const handleDeleteCourse = (course: any) => {
    setCourses(courses.filter(c => c.id !== course.id));
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const renderTeachingTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Mis Cursos</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateCourse}>
          <Text style={styles.buttonText}>+ Crear Curso</Text>
        </TouchableOpacity>
      </View>
      
      {courses.length === 0 ? (
        <EmptyTeachingState onCreateCourse={handleCreateCourse} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderEnrolledTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Cursos Inscritos (0)</Text>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => console.log('Unirse - por implementar')}>
          <Text style={styles.joinButtonText}>Unirse al Curso</Text>
        </TouchableOpacity>
      </View>
      <EmptyStudentState />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>JC Academy</Text>
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
            Cursos Inscritos (0)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'teaching' ? renderTeachingTab() : renderEnrolledTab()}

      {/* Modal */}
      <CourseFormModal
        visible={formModalVisible}
        onClose={() => setFormModalVisible(false)}
        onSubmit={handleSubmitCourse}
      />
    </View>
  );
}

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
    paddingVertical: 16,
    paddingTop: 40,
    backgroundColor: '#673AB7',
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
    borderBottomColor: '#673AB7',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#673AB7',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#673AB7',
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
    borderColor: '#673AB7',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  joinButtonText: {
    color: '#673AB7',
    fontWeight: '600',
  },
});