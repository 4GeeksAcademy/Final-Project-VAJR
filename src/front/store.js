// src/store.js
export const initialStore = () => {
  return {
    message: null,
    todos: [],
    doctors: [{
        id: 1,
        name: "Ruben Yanes",
        specialties: "Cardiology",
        location: "Maracaibo, VZLA",
        picture: "https://randomuser.me/api/portraits/men/1.jpg"
      },
      {
        id: 2,
        name: "Jane Doe",
        specialties: "Pediatrics",
        location: "Tampa, FL",
        picture: "https://randomuser.me/api/portraits/women/2.jpg"
      },
      {
        id: 3,
        name: "Luis Mejia",
        specialties: "Cardiology",
        location: "Miami, FL",
        picture: "https://randomuser.me/api/portraits/men/3.jpg"
      },

      {
        id: 4,
        name: "Andrea Mujica",
        specialties: "Traumatology",
        location: "España, ESP",
        picture: "https://randomuser.me/api/portraits/men/3.jpg"
      }
    ], 
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type) {
    case 'set_hello':
      return { ...store, message: action.payload };
      
    case 'set_doctors': 
      return {
        ...store,
        doctors: action.payload
      };

    case 'add_task':
      const { id, color } = action.payload;
      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };

    default:
      return store; 
  }    
}
