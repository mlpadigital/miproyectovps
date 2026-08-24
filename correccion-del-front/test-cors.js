const url = 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200&h=450';
fetch(url).then(r => console.log(r.status, r.headers.get('access-control-allow-origin'))).catch(e => console.error(e));
