import React, { useState } from 'react';
import axios from '../axiosConfig';

export default function OnboardingRequest(){
  const [form, setForm] = useState({name:'', email:'', phone:'', message:''});
  const [status, setStatus] = useState(null);

  const handleChange = (e)=> setForm({...form, [e.target.name]: e.target.value});

  const submit = async (e)=>{
    e.preventDefault();
    setStatus('sending');
    try{
      await axios.post('/billing/onboarding/', form);
      setStatus('sent');
    }catch(err){
      console.error(err);
      setStatus('error');
    }
  }

  return (
    <div style={{maxWidth:600, margin:'16px auto', padding:16, background:'#fff', borderRadius:8}}>
      <h3>Request Onboarding</h3>
      <form onSubmit={submit}>
        <div style={{marginBottom:8}}>
          <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
        </div>
        <div style={{marginBottom:8}}>
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        </div>
        <div style={{marginBottom:8}}>
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
        </div>
        <div style={{marginBottom:8}}>
          <textarea name="message" placeholder="Message (optional)" value={form.message} onChange={handleChange} />
        </div>
        <button type="submit">Request Onboarding</button>
      </form>

      {status === 'sending' && <p>Sending...</p>}
      {status === 'sent' && <p style={{color:'green'}}>Request sent. We'll contact you.</p>}
      {status === 'error' && <p style={{color:'red'}}>Error sending request.</p>}
    </div>
  )
}
