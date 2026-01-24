export const initialStore=()=>{
  return{
    doctors:[]
  }
}

export default function storeReducer(store, action = {}) {
  switch(action.type){
    
    case 'set_doctor':

      const { doctores } = action.payload

      return {
        ...store,
        doctor: doctores
      };
    default:
      throw Error('Unknown action.');
  }    
}
