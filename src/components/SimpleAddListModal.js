import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SimpleAddListModal({ visible, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate?.({ name: name.trim(), priority });
    setName('');
    setPriority('medium');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Nova Lista de Compras</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome da Lista</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Compras da Semana"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Prioridade</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={priority} onValueChange={setPriority} style={{ height: 50 }}>
                <Picker.Item label="Baixa" value="low" />
                <Picker.Item label="Média" value="medium" />
                <Picker.Item label="Alta" value="high" />
              </Picker>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.btn, styles.btnGray]} onPress={onClose}>
              <Text style={styles.btnGrayText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, !name.trim() && styles.btnDisabled]}
              onPress={handleCreate}
              disabled={!name.trim()}
            >
              <Text style={styles.btnPrimaryText}>Criar Lista</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: { backgroundColor: 'white', borderRadius: 16, padding: 20, width: '100%', maxWidth: 420 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 22,
  },
  formGroup: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    lineHeight: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
  },
  footer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  btnGray: { backgroundColor: '#E5E7EB' },
  btnPrimary: { backgroundColor: '#2563EB' },
  btnDisabled: { opacity: 0.6 },
  btnGrayText: { color: '#374151', fontWeight: '600', fontSize: 16 },
  btnPrimaryText: { color: 'white', fontWeight: '600', fontSize: 16 },
});
