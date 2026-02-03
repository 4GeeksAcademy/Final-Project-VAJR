export const initialStore = () => {
  return {
    message: null,
    doctors: [],
    selectedAppointment: { doctor: null, hour: null, day: null },
    pacient: null, 
    doctor: null,
    appointments: [],
    token: null 
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

    case "login_pacient":
      return {
        ...store,
        pacient: action.payload.pacient,
        token: action.payload.token
      };

    case "login_doctor":
      return {
        ...store,
        doctor: action.payload.doctor,
        token: action.payload.token
      };

    default:
      return store;
  }
}