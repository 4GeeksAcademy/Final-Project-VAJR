import { useEffect, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import './calendar-style.css'


export const DocttoCalendar = ( {doctorId} ) => {

    const [event, setEvents] = useState([])
    const [cita, setcita] = useState([])
  
    
    const getAvailabitity = async () => {

        try {
             const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}availability/${doctorId}`)
             const data = await response.json()
             
             const calendarEvent = data.map(slot=>({
                id:slot.id,
                title: `${slot.availableSlots} slots`,
                start: slot.date,
                allDay: true
             }))
             setEvents(calendarEvent)

        } catch(error){
           console.error('Error fetching doctor availability:', error )
        }
    }

    const handleClick = async (info)=> {
        try{
            const date = info.dateStr

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}appointments/${doctorId}?date=${date}`)
            const data = await response.json()
            alert(`appointment on ${date}:\n` + data.map(a => `${a.time} - ${a.patientName}`).join("\n"))

        } catch(error){
            console.error('Error fetching apointment:', error);
            
        }
    } 

    useEffect(()=>{
        if(doctorId) getAvailabitity()
    }, [doctorId])


    return(
      <FullCalendar 
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={event}
      dateClick={handleClick}
      height="auto"
      />
    )
}