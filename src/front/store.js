export const initialStore = () => {
  const token = localStorage.getItem("token");

  return {
    message: null,
    doctors: [],
    appointments: [],
    doctor: token ? JSON.parse(localStorage.getItem("doctor")) : null,
    token: token || null,

    selectedAppointment: { doctor: null, hour: null, day: null },
    pacient: null,
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
      };

    case "set_appointments":
      return {
        ...store,
        appointments: action.payload,
      };

    case "login_doctor":
      return {
        ...store,
        doctor: action.payload.doctor,
        token: action.payload.token,
        userType: "doctor",
      };

    case "logout":
      return {
        ...store,
        doctor: null,
        token: null,
        appointments: [],
        pacient: null,
        userType: null,
      };

    default:
      return store;
  }
}

// userType: null,
