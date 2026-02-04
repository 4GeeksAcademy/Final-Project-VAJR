export const initialStore = () => {
  const getDoctor = () => {
    try {
      const doctorString = localStorage.getItem("doctor");
      if (doctorString !== undefined || doctorString !== null) {
        return JSON.parse(doctorString);
      }
      return null;
    } catch (error) {
      console.error("Error parsing  doctor from localStorage", error);
      return null;
    }
  };

  return {
    message: null,
    appointments: [],
    doctor: getDoctor(),
    token: localStorage.getItem("token") || null,
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
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
      };

    case "logout":
      return {
        ...store,
        doctor: null,
        token: null,
        appointments: [],
      };

    default:
      throw Error("Unknown action.");
  }
}
