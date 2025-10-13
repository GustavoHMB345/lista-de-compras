import React, { memo } from 'react';
import { Animated, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { CheckIcon } from '../Icons';

function ItemRow({
  item,
  styles,
  canEdit,
  onEditPrice,
  onDelete,
  onToggle,
  editingPriceId,
  editingPriceText,
  setEditingPriceText,
  saveEditPrice,
  incQty,
  decQty,
  categoryName,
  savingInfo,
}) {
  const renderLeftActions = (progress, dragX) => {
    if (!canEdit) return <View />;
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0.6, 1],
      extrapolate: 'clamp',
    });
    const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
    return (
      <Animated.View style={[styles.swipeActionLeft, { transform: [{ scale }], opacity }]}>
        <Text style={styles.swipeActionText}>Editar</Text>
      </Animated.View>
    );
  };
  const renderRightActions = (progress, dragX) => {
    if (!canEdit) return <View />;
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.6],
      extrapolate: 'clamp',
    });
    const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] });
    return (
      <Animated.View style={[styles.swipeActionRight, { transform: [{ scale }], opacity }]}>
        <Text style={styles.swipeActionText}>Apagar</Text>
      </Animated.View>
    );
  };
  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      leftThreshold={28}
      rightThreshold={28}
      friction={1.2}
      overshootFriction={6}
      onSwipeableOpen={(dir) => {
        if (dir === 'left') onEditPrice(item.id, item.price);
        if (dir === 'right') onDelete(item.id);
      }}
    >
      <View style={[styles.itemCard, item.isPurchased && styles.itemCardPurchased]}>
        <TouchableOpacity
          style={styles.checkWrap}
          onPress={() => onToggle(item.id)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkCircle, item.isPurchased && styles.checkCircleOn]}>
            {item.isPurchased ? <CheckIcon /> : null}
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text
            style={[styles.itemName, item.isPurchased && styles.itemNamePurchased]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <Text style={styles.itemSubText}>{categoryName}</Text>
          <View style={styles.metaRow}>
            <View style={styles.qtyBox}>
              <TouchableOpacity
                disabled={!canEdit}
                onPress={() => decQty(item.id)}
                style={styles.qtyBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{parseInt(item.quantity) || 1}</Text>
              <TouchableOpacity
                disabled={!canEdit}
                onPress={() => incQty(item.id)}
                style={styles.qtyBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              disabled={!canEdit}
              onPress={() => onEditPrice(item.id, item.price)}
              activeOpacity={0.8}
              style={styles.pricePill}
            >
              {editingPriceId === item.id ? (
                <View style={styles.priceEditRow}>
                  <Text style={styles.pricePrefix}>R$</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={editingPriceText}
                    onChangeText={setEditingPriceText}
                    onBlur={() => saveEditPrice(item.id)}
                    keyboardType="numeric"
                    selectionColor={styles?.priceText?.color || '#2563EB'}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => saveEditPrice(item.id)} activeOpacity={0.7}>
                    <Text style={styles.priceSave}>OK</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.priceText}>
                  {item.price > 0 ? `R$ ${Number(item.price).toFixed(2)}` : 'Definir preço'}
                </Text>
              )}
            </TouchableOpacity>
            {item.price > 0 && (
              <View style={styles.itemTotal}>
                <Text style={styles.itemTotalText}>
                  R$ {(Number(item.price) * (parseInt(item.quantity) || 1)).toFixed(2)}
                </Text>
              </View>
            )}
            {savingInfo && (
              <View
                style={[
                  styles.savingBadge,
                  savingInfo.diff > 0 ? styles.savingPos : styles.savingNeg,
                ]}
              >
                <Text style={styles.savingBadgeText}>
                  {savingInfo.diff > 0
                    ? `↓ ${Math.abs(savingInfo.diff).toFixed(2)} (${Math.abs(savingInfo.pct).toFixed(1)}%)`
                    : `↑ ${Math.abs(savingInfo.diff).toFixed(2)} (${Math.abs(savingInfo.pct).toFixed(1)}%)`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Swipeable>
  );
}

export default memo(ItemRow);
