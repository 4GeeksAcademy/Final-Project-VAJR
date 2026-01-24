// src/store.js
export const initialStore = () => {
  return {
    message: null,
    doctors: [], 
    selectedAppointment: { doctor: null, hour: null, day: null }
  }
}

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case 'set_doctors':
      return {
        ...store,
        doctors: action.payload 
      };
    case 'select_slot':
      return {
        ...store,
        selectedAppointment: action.payload
      };
    default:
      return store;
  }
}