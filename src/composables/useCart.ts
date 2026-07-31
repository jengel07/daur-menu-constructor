import { ref, computed } from 'vue'
import type { MenuItem } from '../types/menu'

// Интерфейс для товара в корзине, добавляющий поле количества
export interface CartItem extends MenuItem {
  quantity: number
}

// Храним корзину глобально (вне функции), чтобы состояние сохранялось между компонентами
const cartItems = ref<CartItem[]>([])

export function useCart() {
  // Добавить товар или увеличить количество
  const addToCart = (dish: MenuItem) => {
    const existing = cartItems.value.find(item => item.id === dish.id)
    if (existing) {
      existing.quantity++
    } else {
      cartItems.value.push({ ...dish, quantity: 1 } as CartItem)
    }
  }

  // Увеличить количество
  const increaseQuantity = (dishId: string | number) => {
    const item = cartItems.value.find(item => item.id === dishId)
    if (item) item.quantity++
  }

  // Уменьшить количество (или удалить, если стало 0)
  const decreaseQuantity = (dishId: string | number) => {
    const index = cartItems.value.findIndex(item => item.id === dishId)
    if (index !== -1) {
      cartItems.value[index].quantity--
      if (cartItems.value[index].quantity <= 0) {
        cartItems.value.splice(index, 1)
      }
    }
  }

  // Общая сумма заказа
  const totalPrice = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  })

  return {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    totalPrice
  }
}