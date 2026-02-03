export const initialStore = () => {
  return {
    message: null,

    appointments: [],
    doctor: JSON.parse(localStorage.getItem("doctor")) || null,
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
