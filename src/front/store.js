export const initialStore = () => {
  return {
    message: null,
    doctors: [],
    selectedAppointment: { doctor: null, hour: null, day: null },
    pacient: null,
    doctor: null,
    appointments: [],
    token: null,
    userType: null,
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_doctors":
      return {
        ...store,
        doctors: action.payload,
      };
    case "set_doctors":
      return {
        ...store,
        doctors: action.payload,
      };

    case "select_slot":
      return {
        ...store,
        selectedAppointment: action.payload,
      };

    case "login_pacient":
      return {
        ...store,
        pacient: action.payload.pacient,
        token: action.payload.token,
        userType: 'pacient'
      };

    case "login_doctor":
      return {
        ...store,
        doctor: action.payload.doctor,
        token: action.payload.token,
        userType: 'doctor'
      };

    case "logout":
      return {
        ...store,
        token: null,
        pacient: null,
        doctor: null,
        userType: null,
      };

    default:
      return store;
  }
}
