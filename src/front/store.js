export const initialStore = () => {
  return {
    message: null,
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      },
    ],

    appointments: [],
    doctor: null,
    token: null,
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

    default:
      throw Error("Unknown action.");
  }
}
