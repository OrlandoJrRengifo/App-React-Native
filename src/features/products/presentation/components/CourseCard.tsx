import React, { useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CourseCardProps {
  course: any;
  onEdit: (course: any) => void;
  onDelete: (course: any) => void;
}

export default function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleCopyCode = () => {
    Alert.alert('Código copiado', `Código: ${course.code}`);
  };

  const handleMenuOption = (action: 'edit' | 'delete') => {
    setMenuVisible(false);
    setTimeout(() => {
      if (action === 'edit') {
        onEdit(course);
      } else if (action === 'delete') {
        onDelete(course);
      }
    }, 100);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <Text style={styles.courseName}>{course.name}</Text>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={styles.menuButton}>
            <Text style={styles.menuIcon}>⋮</Text>
          </TouchableOpacity>

          <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}>
            <TouchableOpacity
              style={styles.menuModalOverlay}
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}>
              <View style={styles.menuContainer}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuOption('edit')}>
                  <Text style={styles.menuText}>Editar</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleMenuOption('delete')}>
                  <Text style={[styles.menuText, styles.deleteText]}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>Código: {course.code}</Text>
          <TouchableOpacity onPress={handleCopyCode} style={styles.copyButton}>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoText}>Cupos: {course.max_students}</Text>
        <Text style={styles.dateText}>{course.created_at}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: '#666',
  },
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    minWidth: 150,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    padding: 16,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  deleteText: {
    color: '#FF3B30',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  copyButton: {
    padding: 4,
  },
  copyIcon: {
    fontSize: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
});