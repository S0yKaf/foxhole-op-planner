import{F as o,r as c,c as f,G as d,w as v,l,H as i,I as h,J as m}from"./entry.196be917.js";function w(t,a={}){const e=a.head||o();if(e)return e.ssr?e.push(t,a):p(e,t,a)}function p(t,a,e={}){const s=c(!1),n=c({});f(()=>{n.value=s.value?{}:d(a)});const r=t.push(n.value,e);return v(n,u=>{r.patch(u)}),m()&&(l(()=>{r.dispose()}),i(()=>{s.value=!0}),h(()=>{s.value=!1})),r}export{w as u};
