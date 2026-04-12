import React, { useState } from 'react';
import axios from '../axiosConfig';

export default function Pricing(){
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // handle PayPal return: if ?paypal_order=ORDERID&sub=ID present, call capture
  React.useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const orderID = params.get('paypal_order');
    const sub = params.get('sub');
    if(orderID && sub){
      (async ()=>{
        setLoading(true);
        try{
          await axios.post('/billing/paypal/capture/', { order_id: orderID, subscription_id: sub });
          setMessage('Payment confirmed — subscription active.');
          // remove query params
          window.history.replaceState({}, document.title, window.location.pathname);
        }catch(err){
          console.error(err);
          setMessage('Payment capture failed.');
        }finally{ setLoading(false); }
      })();
    }
  },[]);

  const subscribe = async (tier, method) => {
    setLoading(true);
    setMessage(null);
    try{
      const res = await axios.post('/billing/subscribe/', { tier, payment_method: method });
      const data = res.data || {};
      if(data.approval_url){
        window.location.href = data.approval_url;
        return;
      }
      if(data.checkout_request_id){
        setMessage('M-Pesa STK Push initiated. Check your phone to complete payment.');
        return;
      }
      if(data.payment_url){
        window.location.href = data.payment_url;
        return;
      }
      if(data.message){
        setMessage(data.message);
      }
    }catch(err){
      console.error(err);
      setMessage('Failed to start subscription.');
    }finally{ setLoading(false); }
  }

  return (
    <div style={{maxWidth:800, margin:'24px auto', padding:24, background:'#fff', borderRadius:8}}>
      <h2>Pricing</h2>
      <p>Choose a plan and payment method (PayPal or M-Pesa).</p>

      <div style={{display:'flex', gap:16}}>
        <div style={{flex:1, padding:16, border:'1px solid #eee'}}>
          <h3>Basic</h3>
          <p>$10 / user / month</p>
          <button onClick={()=>subscribe('basic','paypal')} disabled={loading}>Buy with PayPal</button>
          <button onClick={()=>subscribe('basic','mpesa')} disabled={loading} style={{marginLeft:8}}>Pay with M-Pesa</button>
        </div>

        <div style={{flex:1, padding:16, border:'1px solid #eee'}}>
          <h3>Pro</h3>
          <p>$30 / user / month</p>
          <button onClick={()=>subscribe('pro','paypal')} disabled={loading}>Buy with PayPal</button>
          <button onClick={()=>subscribe('pro','mpesa')} disabled={loading} style={{marginLeft:8}}>Pay with M-Pesa</button>
        </div>
      </div>

      {message && <div style={{marginTop:16,color:'red'}}>{message}</div>}
    </div>
  )
}
