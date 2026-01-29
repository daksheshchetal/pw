import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const CartScreen = () => {
  const { cartItems, cartTotal, removeFromCart, clearCart, currentVendorId } = useCart();
  const { currentUser } = useAuth();
  const [isPlacing, setIsPlacing] = useState(false);
  const navigation = useNavigation();

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setIsPlacing(true);

    try {
      // 1. Create the Order Object
      const orderData = {
        customerId: currentUser.uid,
        customerName: currentUser.email || "Customer", // Ideally fetch from profile
        vendorId: currentVendorId,
        items: cartItems,
        total: cartTotal,
        status: 'placed', // Initial status
        timestamp: serverTimestamp(),
        paymentMethod: 'cash' // Default for MVP
      };

      // 2. Push to Firestore
      await addDoc(collection(db, 'orders'), orderData);

      // 3. Cleanup & Redirect
      Alert.alert("Success", "Your order has been placed!");
      clearCart();
      setIsPlacing(false);
      navigation.navigate('My Orders'); // Navigate to tracking
    } catch (error) {
      console.error("Order Error:", error);
      Alert.alert("Error", "Could not place order. Please try again.");
      setIsPlacing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Cart</Text>
      
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Go add some tasty food!</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price} x {item.quantity}</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total to Pay:</Text>
              <Text style={styles.totalAmount}>₹{cartTotal}</Text>
            </View>
            <TouchableOpacity 
              style={styles.placeButton} 
              onPress={handlePlaceOrder}
              disabled={isPlacing}
            >
              {isPlacing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Place Order (Cash)</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#eee' },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemPrice: { color: '#666', marginTop: 4 },
  rowRight: { alignItems: 'flex-end' },
  itemTotal: { fontWeight: 'bold', fontSize: 16 },
  removeText: { color: 'red', fontSize: 12, marginTop: 5 },
  footer: { marginTop: 20, borderTopWidth: 2, borderColor: '#eee', paddingTop: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  totalLabel: { fontSize: 18 },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  placeButton: { backgroundColor: '#27ae60', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#999', marginBottom: 10 },
  linkText: { color: '#007AFF', fontSize: 16 }
});
