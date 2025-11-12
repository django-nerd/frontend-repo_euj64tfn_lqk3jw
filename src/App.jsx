import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Sun, Moon, Menu, Search } from 'lucide-react';
import Spline from '@splinetool/react-spline';
import { CartProvider, useCart } from './components/CartContext.jsx';

const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

function useTheme() {
  const [theme, setTheme] = React.useState(() => localStorage.getItem('theme') || 'light');
  React.useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);
  return { theme, setTheme };
}

function Navbar() {
  const { items } = useCart();
  const [open, setOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Etalase' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-neutral-900/70 border-b border-white/20 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="md:hidden" onClick={() => setOpen(!open)}><Menu className="w-6 h-6"/></button>
          <Link to="/" className="font-bold text-lg">BlueMart</Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`hover:text-blue-600 transition ${location.pathname===l.to?'text-blue-600':''}`}>{l.label}</Link>
          ))}
          <Link to="/login" className="hover:text-blue-600">Login/Register</Link>
          <Link to="/cart" className="relative"><ShoppingCart className="w-6 h-6"/>{items.length>0 && <span className="absolute -top-2 -right-2 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">{items.length}</span>}</Link>
          <button aria-label="theme" onClick={()=> setTheme(theme==='light'?'dark':'light')} className="p-2 rounded hover:bg-black/5 dark:hover:bg-white/5">
            {theme==='light'?<Moon className="w-5 h-5"/>:<Sun className="w-5 h-5"/>}
          </button>
        </nav>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-3 space-y-2">
          {links.map(l => (<Link key={l.to} to={l.to} className="block py-2 border-b" onClick={()=>setOpen(false)}>{l.label}</Link>))}
          <Link to="/login" className="block py-2" onClick={()=>setOpen(false)}>Login/Register</Link>
          <Link to="/cart" className="block py-2" onClick={()=>setOpen(false)}>Cart</Link>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative h-[70vh] md:h-[80vh]">
      <Spline scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/20 to-white dark:from-neutral-900/0 dark:via-neutral-900/40 dark:to-neutral-900 pointer-events-none" />
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Modern payments, beautiful cards.</h1>
          <p className="mt-4 text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-xl">Experience a futuristic store built with glass morphism and smooth 3D. Browse, add to cart, and checkout seamlessly.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/shop" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700">Shop now</Link>
            <a href="#featured" className="px-5 py-2.5 rounded-lg border shadow-sm hover:bg-black/5 dark:hover:bg-white/5">Explore</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({p, onAdd}) {
  return (
    <Link to={`/product/${p.id}`} className="group block bg-white dark:bg-neutral-900 rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
      <div className="aspect-square overflow-hidden">
        <img src={p.thumbnail || p.images?.[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
      </div>
      <div className="p-4">
        <h3 className="font-medium line-clamp-1">{p.title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{p.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold">${p.price.toFixed(2)}</span>
          <button onClick={(e)=>{e.preventDefault(); onAdd(p);}} className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Add to Cart</button>
        </div>
      </div>
    </Link>
  );
}

function Home() {
  const [featured, setFeatured] = React.useState([]);
  const { add } = useCart();
  React.useEffect(()=>{
    fetch(`${API_BASE}/api/products?featured=true&limit=8`).then(r=>r.json()).then(setFeatured).catch(()=>setFeatured([]));
  },[]);
  return (
    <div>
      <Hero />
      <section id="featured" className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured</h2>
          <Link to="/shop" className="text-blue-600 hover:underline">Browse all</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featured.map(p => <ProductCard key={p.id} p={p} onAdd={add} />)}
        </div>
      </section>
    </div>
  );
}

function useProductsQuery() {
  const [state, setState] = React.useState({ items: [], loading: true });
  const [filters, setFilters] = React.useState({ q:'', category:'', min_price:'', max_price:'', min_rating:'' });
  const search = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k,v])=>{ if(v!=='' && v!=null) params.set(k, v); });
    fetch(`${API_BASE}/api/products?${params.toString()}`).then(r=>r.json()).then(items=>setState({items, loading:false}));
  };
  React.useEffect(()=>{ search(); }, []);
  return { ...state, filters, setFilters, search };
}

function Shop() {
  const { items, loading, filters, setFilters, search } = useProductsQuery();
  const { add } = useCart();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-neutral-900 rounded-lg ring-1 ring-black/5 dark:ring-white/10 px-3 py-2">
          <Search className="w-4 h-4"/>
          <input value={filters.q} onChange={e=>setFilters(f=>({...f,q:e.target.value}))} placeholder="Search products..." className="w-full bg-transparent outline-none"/>
        </div>
        <select value={filters.category} onChange={e=>setFilters(f=>({...f,category:e.target.value}))} className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
          <option value="">All Categories</option>
          <option value="Cards">Cards</option>
          <option value="Accessories">Accessories</option>
        </select>
        <input type="number" placeholder="Min price" value={filters.min_price} onChange={e=>setFilters(f=>({...f,min_price:e.target.value}))} className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10 w-32"/>
        <input type="number" placeholder="Max price" value={filters.max_price} onChange={e=>setFilters(f=>({...f,max_price:e.target.value}))} className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10 w-32"/>
        <select value={filters.min_rating} onChange={e=>setFilters(f=>({...f,min_rating:e.target.value}))} className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
          <option value="">Any rating</option>
          <option value="4">4+</option>
          <option value="4.5">4.5+</option>
        </select>
        <button onClick={search} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Filter</button>
      </div>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? Array.from({length:8}).map((_,i)=> <div key={i} className="animate-pulse h-64 bg-black/5 dark:bg-white/5 rounded-xl"/>) : items.map(p => <ProductCard key={p.id} p={p} onAdd={add} />)}
      </div>
    </div>
  );
}

function ProductDetail() {
  const { add } = useCart();
  const { pathname } = useLocation();
  const id = pathname.split('/').pop();
  const [p, setP] = React.useState(null);
  React.useEffect(()=>{
    fetch(`${API_BASE}/api/products/${id}`).then(r=>r.json()).then(setP);
  },[id]);
  if(!p) return <div className="max-w-5xl mx-auto px-4 py-10">Loading...</div>;
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      <div className="space-y-3">
        <img src={p.thumbnail || p.images?.[0]} className="w-full rounded-xl" />
        <div className="grid grid-cols-4 gap-2">
          {(p.images||[]).map((img,i)=> <img key={i} src={img} className="rounded-lg h-20 w-full object-cover"/>) }
        </div>
      </div>
      <div>
        <h1 className="text-3xl font-semibold">{p.title}</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">{p.description}</p>
        <div className="mt-4 text-2xl font-bold">${p.price.toFixed(2)}</div>
        <div className="mt-4 flex gap-3">
          <button onClick={()=>add(p)} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white">Add to Cart</button>
          <Link to="/checkout" className="px-5 py-2.5 rounded-lg border">Buy Now</Link>
        </div>
      </div>
    </div>
  );
}

function Cart() {
  const { items, updateQty, remove, subtotal } = useCart();
  const navigate = useNavigate();
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>
      {items.length===0 ? (
        <div className="text-neutral-600">Cart is empty.</div>
      ) : (
        <div className="space-y-4">
          {items.map(i => (
            <div key={i.id} className="flex items-center gap-4 bg-white dark:bg-neutral-900 rounded-xl p-4 ring-1 ring-black/5 dark:ring-white/10">
              <img src={i.thumbnail} className="w-20 h-20 rounded-lg object-cover"/>
              <div className="flex-1">
                <div className="font-medium">{i.title}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">${i.price.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={()=>updateQty(i.id, i.quantity-1)} className="px-2 py-1 rounded border">-</button>
                <input value={i.quantity} onChange={e=>updateQty(i.id, parseInt(e.target.value||'1',10))} className="w-12 text-center rounded border bg-transparent"/>
                <button onClick={()=>updateQty(i.id, i.quantity+1)} className="px-2 py-1 rounded border">+</button>
              </div>
              <button onClick={()=>remove(i.id)} className="px-3 py-1.5 rounded bg-red-500 text-white">Remove</button>
            </div>
          ))}
          <div className="flex items-center justify-between pt-4">
            <div className="text-lg">Subtotal: <span className="font-semibold">${subtotal.toFixed(2)}</span></div>
            <button onClick={()=>navigate('/checkout')} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white">Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = React.useState({ full_name:'', email:'', phone:'', address:'', city:'', postal_code:'', country:'', shipping_method:'standard', method:'cod' });
  const shipping_cost = subtotal > 200 ? 0 : 10;
  const total = subtotal + shipping_cost;
  const placeOrder = async () => {
    const payload = {
      items: items.map(i => ({ product_id: i.id, title: i.title, price: i.price, quantity: i.quantity, thumbnail: i.thumbnail })),
      subtotal,
      shipping_cost,
      total,
      shipping: { ...form },
      payment: { method: form.method, status: 'pending' }
    };
    const res = await fetch(`${API_BASE}/api/orders`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const data = await res.json();
    clear();
    navigate(`/payment?order=${data.order_id}`);
  };
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-4">
        <h2 className="text-2xl font-semibold">Checkout</h2>
        <div className="grid grid-cols-2 gap-4">
          {['full_name','email','phone','address','city','postal_code','country'].map(key => (
            <input key={key} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={key.replace('_',' ')} className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10 col-span-2 md:col-span-1"/>
          ))}
          <select value={form.shipping_method} onChange={e=>setForm(f=>({...f,shipping_method:e.target.value}))} className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10 col-span-2">
            <option value="standard">Standard Shipping</option>
            <option value="express">Express Shipping</option>
          </select>
          <select value={form.method} onChange={e=>setForm(f=>({...f,method:e.target.value}))} className="px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10 col-span-2">
            <option value="cod">Cash on Delivery</option>
            <option value="card">Card (Dummy)</option>
            <option value="transfer">Bank Transfer</option>
          </select>
        </div>
      </div>
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 ring-1 ring-black/5 dark:ring-white/10 h-fit">
        <h3 className="font-medium">Order Summary</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>${shipping_cost.toFixed(2)}</span></div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>
        <button onClick={placeOrder} className="w-full mt-4 px-4 py-2.5 rounded-lg bg-blue-600 text-white">Place Order</button>
      </div>
    </div>
  );
}

function Payment() {
  const params = new URLSearchParams(location.search);
  const order = params.get('order');
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-3xl font-semibold">Payment Simulation</div>
      <p className="mt-2 text-neutral-600 dark:text-neutral-300">Order ID: {order}</p>
      <p className="mt-4">Use this page as a dummy gateway. Your order has been created; payment is mocked.</p>
      <Link to="/" className="mt-6 inline-block px-5 py-2.5 rounded-lg bg-blue-600 text-white">Back to Home</Link>
    </div>
  );
}

function Blog() {
  const [posts, setPosts] = React.useState([]);
  React.useEffect(()=>{ fetch(`${API_BASE}/api/blogs`).then(r=>r.json()).then(setPosts).catch(()=>setPosts([])); },[]);
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-6">
      {posts.map(p => (
        <Link key={p.id} to={`/blog/${p.id}`} className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
          <img src={p.thumbnail} className="w-full h-48 object-cover" />
          <div className="p-4">
            <h3 className="font-medium">{p.title}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">{p.excerpt}</p>
            <div className="mt-3 text-blue-600">Read more</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function BlogDetail() {
  const id = location.pathname.split('/').pop();
  const [post, setPost] = React.useState(null);
  React.useEffect(()=>{ fetch(`${API_BASE}/api/blogs/${id}`).then(r=>r.json()).then(setPost); },[id]);
  if(!post) return <div className="max-w-3xl mx-auto px-4 py-10">Loading...</div>;
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <img src={post.thumbnail} className="w-full rounded-xl"/>
      <h1 className="mt-6 text-3xl font-semibold">{post.title}</h1>
      <div className="mt-4 whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{post.content}</div>
    </div>
  );
}

function Contact() {
  const [form, setForm] = React.useState({ name:'', email:'', message:'' });
  const [sent, setSent] = React.useState(false);
  const submit = async () => {
    await fetch(`${API_BASE}/api/contact`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    setSent(true);
  };
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-semibold">Contact Us</h2>
        {!sent ? (
          <div className="mt-4 space-y-3">
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Name" className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10"/>
            <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="Email" className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring_white/10"/>
            <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} placeholder="Message" rows="5" className="w-full px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10"></textarea>
            <button onClick={submit} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Send</button>
          </div>
        ) : (
          <div className="mt-4">Thanks! We received your message.</div>
        )}
      </div>
      <div className="rounded-xl overflow-hidden h-80 bg-black/5 dark:bg-white/5">
        <iframe title="map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019953879233!2d-122.40136332443744!3d37.79084131229161!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858064f2f6d0e5%3A0x4d9a9d4b7c9b8a3!2sSalesforce%20Tower!5e0!3m2!1sen!2sus!4v1600000000000!5m2!1sen!2sus" width="100%" height="100%" style={{border:0}} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
      </div>
    </div>
  );
}

function Auth() {
  const [mode, setMode] = React.useState('login');
  const [form, setForm] = React.useState({ name:'', email:'', password:'' });
  const submit = async () => {
    const url = mode==='login'? '/api/auth/login' : '/api/auth/register';
    await fetch(`${API_BASE}${url}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    alert('Success (demo)');
  };
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex gap-2 mb-4">
          <button onClick={()=>setMode('login')} className={`px-3 py-1.5 rounded ${mode==='login'?'bg-blue-600 text-white':'border'}`}>Login</button>
          <button onClick={()=>setMode('register')} className={`px-3 py-1.5 rounded ${mode==='register'?'bg-blue-600 text-white':'border'}`}>Register</button>
          <button onClick={()=>setMode('forgot')} className={`px-3 py-1.5 rounded ${mode==='forgot'?'bg-blue-600 text-white':'border'}`}>Forgot</button>
        </div>
        {mode!=='forgot' ? (
          <>
            {mode==='register' && <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Name" className="w-full mb-3 px-3 py-2 rounded bg-transparent border"/>}
            <input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="Email" className="w-full mb-3 px-3 py-2 rounded bg-transparent border"/>
            <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Password" className="w-full mb-3 px-3 py-2 rounded bg-transparent border"/>
            <button onClick={submit} className="w-full px-4 py-2 rounded bg-blue-600 text-white">{mode==='login'? 'Login':'Create account'}</button>
          </>
        ) : (
          <div>
            <input placeholder="Email" className="w-full mb-3 px-3 py-2 rounded bg-transparent border"/>
            <button className="w-full px-4 py-2 rounded bg-blue-600 text-white">Send reset link</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-semibold">BlueMart</div>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">A modern demo shop with a 3D glass card aesthetic.</p>
        </div>
        <div>
          <div className="font-medium">Company</div>
          <ul className="mt-2 space-y-1">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/shop" className="hover:underline">Etalase</Link></li>
            <li><Link to="/blog" className="hover:underline">Blog</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium">Follow</div>
          <ul className="mt-2 space-y-1">
            <li><a href="#" className="hover:underline">Twitter</a></li>
            <li><a href="#" className="hover:underline">Instagram</a></li>
            <li><a href="#" className="hover:underline">LinkedIn</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium">Updates</div>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">Join our newsletter for product drops.</p>
          <div className="mt-3 flex gap-2">
            <input placeholder="Email" className="flex-1 px-3 py-2 rounded bg-transparent border"/>
            <button className="px-3 py-2 rounded bg-blue-600 text-white">Join</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/shop" element={<Shop/>} />
      <Route path="/product/:id" element={<ProductDetail/>} />
      <Route path="/cart" element={<Cart/>} />
      <Route path="/checkout" element={<Checkout/>} />
      <Route path="/payment" element={<Payment/>} />
      <Route path="/blog" element={<Blog/>} />
      <Route path="/blog/:id" element={<BlogDetail/>} />
      <Route path="/contact" element={<Contact/>} />
      <Route path="/login" element={<Auth/>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </CartProvider>
    </BrowserRouter>
  );
}
