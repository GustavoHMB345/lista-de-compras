import React, { memo } from 'react';
import { View } from 'react-native';
import Button from '../../components/Button';

function HeaderActions({
  styles,
  isEditing,
  onShare,
  onSave,
  onEdit,
  onMarkAll,
  onClearCompleted,
}) {
  return (
    <View style={styles.actionsRow}>
      <Button variant="light" title="Compartilhar" onPress={onShare} />
      {isEditing ? (
        <Button variant="success" title="Salvar" onPress={onSave} />
      ) : (
        <Button variant="gray" title="Editar" onPress={onEdit} />
      )}
      <Button variant="gray" title="Marcar todos" onPress={onMarkAll} />
      <Button variant="gray" title="Limpar concluídos" onPress={onClearCompleted} />
    </View>
  );
}

export default memo(HeaderActions);
