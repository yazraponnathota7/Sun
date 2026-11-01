import {createClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured=Boolean(url&&key&&!url.includes('YOUR_PROJECT_REF')&&!key.includes('your_supabase'));
export const supabase=createClient(configured?url:'https://placeholder.supabase.co',configured?key:'placeholder-key');
const API=(import.meta.env.VITE_API_URL||'http://localhost:8080/api').replace(/\/+$/,'');
export async function api(path,options={}) {
 const {data:{session}}=await supabase.auth.getSession();
 const headers={'Content-Type':'application/json',...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{ }),...(options.headers||{})};
 let res;
 try{res=await fetch(`${API}${path}`,{...options,headers});}catch{throw new Error('Cannot reach the canteen server. Check your internet connection and try again.');}
 const text=await res.text(); let body={}; try{body=text?JSON.parse(text):{};}catch{body={message:text};}
 if(res.status===401) throw new Error('Your session is invalid or has expired. Please sign out and sign in again.');
 if(!res.ok) throw new Error(body.message||body.error||`Request failed (${res.status})`);
 return body;
}
export const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(Number(n||0));
export const statusClass=s=>String(s||'pending').toLowerCase().replaceAll(' ','-');
export const localInput=d=>{const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;};
export const NOIMG="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23eef2f8'/%3E%3C/svg%3E";
export function friendly(m){m=String(m||'');if(/Invalid login credentials/i.test(m))return 'Incorrect email or password.';if(/Database error saving new user/i.test(m))return 'We could not create your account. That Student ID may already be registered.';if(/already registered/i.test(m))return 'An account with this email already exists. Try signing in.';if(/Failed to fetch|NetworkError/i.test(m))return 'Cannot reach the server. Check your internet connection and try again.';return m||'Something went wrong. Please try again.';}
