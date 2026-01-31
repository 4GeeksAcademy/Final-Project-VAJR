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
      }
    ],

    doctors: []

  }

}

export default function storeReducer(store, action = {}) {
  switch (action.type) {

    case 'set_doctor':
      return {
        ...store,
        doctors: action.payload.doctor
      };

    default:
      throw Error('Unknown action.');
  };

}