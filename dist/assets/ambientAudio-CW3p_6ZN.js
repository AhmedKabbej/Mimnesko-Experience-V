let e=null;function u(n,t=!1){l(),e=new Audio(n),e.loop=t,e.currentTime=0,e.play().catch(()=>{})}function l(){e&&(e.pause(),e.currentTime=0,e=null)}export{u as p,l as s};
