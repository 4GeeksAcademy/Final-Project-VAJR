export const initialStore=()=>{
  return{
    message: null,
    pacient:null, 
    doctor:null,

    appointments:[]
  }
}

  
export default function storeReducer(store, action = {}) {
  switch(action.type){
   case "login_pacient":
    return{
      ...store,
      pacient:action.payload.pacient,
      token:action.payload.token
    };
    case "login_doctor":
    return{
      ...store,
      doctor:action.payload.doctor,
      token:action.payload.token
    };
    default:
      throw Error('Unknown action.');
  }    
}
