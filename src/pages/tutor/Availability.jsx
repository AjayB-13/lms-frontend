import React, { useEffect, useState } from 'react'
import { api } from '../../api'
import { useAuth } from '../../context/AuthContext'

export default function TutorAvailability() {
  const { token } = useAuth()
  const [slots, setSlots] = useState([])
  const [date, setDate] = useState('')
  const [time, setTime] = useState('17:00')

  useEffect(() => { api('/api/tutor/availability', { token }).then(setSlots) }, [])

  function addSlot() {
    if (!date) return
    const iso = new Date(`${date}T${time}:00`).toISOString()
    setSlots([...slots, iso])
  }

  async function save() {
    const res = await api('/api/tutor/availability', { method: 'PUT', token, body: { slots } })
    setSlots(res)
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Availability</h1>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <input className="border p-2 rounded" type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <input className="border p-2 rounded" type="time" value={time} onChange={e=>setTime(e.target.value)} />
      </div>
      <button className="bg-gray-200 px-3 py-1 rounded mr-2" onClick={addSlot}>Add</button>
      <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={save}>Save</button>
      <ul className="list-disc ml-6 mt-4">
        {slots.map((s,i)=>(<li key={i}>{new Date(s).toLocaleString()}</li>))}
      </ul>
    </div>
  )
}