import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Text } from 'react-native-paper';

export const ErrorState = ({ onRetry, error }: { onRetry: () => void, error?: string | null }) => (
  <View style={styles.container}>
    <Icon source="alert-circle-outline" size={48} color="#B00020" />
    <Text style={styles.text}>Ocurrió un error</Text>
    {error && <Text style={styles.errorMsg}>{error}</Text>}
    <Button mode="outlined" onPress={onRetry} style={styles.button}>
      Reintentar
    </Button>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 8, fontSize: 16 },
  errorMsg: { color: '#666', paddingHorizontal: 20, textAlign: 'center' },
  button: { marginTop: 16 },
});