import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, IconButton, Menu, Text } from 'react-native-paper';
import { Course } from '../../domain/entities/Course';

interface CourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onPress?: () => void; 
}

export const CourseCard = ({ course, onEdit, onDelete, onPress }: CourseCardProps) => {
  const navigation = useNavigation<any>();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const formattedDate = course.createdAt
    ? new Date(course.createdAt).toLocaleDateString()
    : "Sin fecha";

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('CourseDetail', {
        courseId: course.id,
        courseName: course.name,
        teacherId: course.teacherId, // Agregar teacherId para saber quién es el dueño
      });
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(course.code);
  };

  const handleEdit = () => {
    setMenuVisible(false);
    onEdit?.(course);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    onDelete?.(course);
  };

  const showMenu = onEdit != null && onDelete != null;

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.title}>{course.name}</Text>
          {showMenu && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton 
                  icon="dots-vertical" 
                  size={20} 
                  onPress={() => setMenuVisible(true)} 
                />
              }>
              <Menu.Item onPress={handleEdit} title="Editar" />
              <Menu.Item onPress={handleDelete} title="Eliminar" />
            </Menu>
          )}
        </View>
        <View style={styles.codeRow}>
          <Text style={styles.codeText}>Código: {course.code}</Text>
          <IconButton
            icon="content-copy"
            size={18}
            style={styles.copyIcon}
            onPress={copyToClipboard}
          />
        </View>
        <Text style={styles.details}>Cupos: {course.maxStudents}</Text>
        <Text style={styles.details}>{formattedDate}</Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontWeight: 'bold',
    flexShrink: 1, 
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  codeText: {
    color: '#555',
  },
  copyIcon: {
    margin: 0,
    height: 20,
    width: 20,
    marginLeft: 8,
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});