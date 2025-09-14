"use client";
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import './globals.css';

type Listing = {
  _id: string;
  title: string;
  city: string;
  price: number;
  rating: number;
  image: string;
  maxGuests?: number;
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Home(){
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [locale, setLocale] = useState<'en'|'bn'>('en');
  const [trans, setTrans] = useState<any>({});
  const [tab, setTab] = useState<'tips'|'apartments'>('tips');

  useEffect(()=>{
    fetch(`/api/translations/${locale}`).then(r=>r.json()).then(t=>setTrans(t)).catch(()=>{});
  },[locale]);

  const params = new URLSearchParams();
  if(location) params.set('location', location);
  if(checkIn) params.set('checkIn', checkIn);
  if(checkOut) params.set('checkOut', checkOut);
  if(guests) params.set('guests', String(guests));

  const { data, error } = useSWR<Listing[]>(`/api/listings?${params.toString()}`, fetcher);

  return (
    <div style={{width: '100%', minHeight: '100vh', background: '#fafafa'}}>
      <header className="header-wrap">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/logo.png" alt="logo" style={{width:100}} />
        </div>

        <div style={{flex:1,display:'flex',justifyContent:'center'}}>
          <div className="search-pill" role="search">
            <div className="search-part"><input className="search-input" aria-label="where" placeholder={locale==='en' ? 'Where' : 'কোথায়'} value={location} onChange={(e)=>setLocation((e.target as HTMLInputElement).value)} /></div>
            <div className="search-divider" />
            <div className="search-part"><input type="date" aria-label="check-in" value={checkIn} onChange={(e)=>setCheckIn((e.target as HTMLInputElement).value)} /></div>
            <div className="search-part"><input type="date" aria-label="check-out" value={checkOut} onChange={(e)=>setCheckOut((e.target as HTMLInputElement).value)} /></div>
            <div className="search-part"><input type="number" aria-label="guests" min={1} value={guests} onChange={(e)=>setGuests(Number((e.target as HTMLInputElement).value))} style={{width:70}} /></div>
            <div><button className="search-btn">{locale==='en' ? 'Search' : 'অনুসন্ধান'}</button></div>
          </div>
        </div>

        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <select value={locale} onChange={(e)=>setLocale(e.target.value as 'en'|'bn')}>
            <option value="en">EN</option>
            <option value="bn">BN</option>
          </select>
        </div>
      </header>

      <main style={{padding: '0 32px', width: '100%'}}>
        <section>
          <h3 className="section-title">{locale==='en' ? 'Popular homes in Kuala Lumpur' : 'কুয়ালা লামপুরে জনপ্রিয় বাড়ি'}</h3>
          <div className="cards-row" aria-label="popular">
            {error && <div>{locale==='en' ? 'Failed to load' : 'লোড করতে ব্যর্থ'}</div>}
            {data?.map(l => (
              <div key={l._id} className="listing-card">
                <div className="badge">{locale==='en' ? 'Guest favorite' : 'অতিথি প্রিয়'}</div>
                <div className="heart">♡</div>
                <img src={l.image} alt={l.title} className="card-media" />
                <div className="card-body">
                  <div className="card-title">{l.title}</div>
                  <div className="card-sub">${l.price} for 2 nights · ★ {l.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{marginTop:32}}>
          <h3 className="section-title">{locale==='en' ? 'Available next month in Bangkok' : 'ব্যাংককে পরের মাসে উপলব্ধ'}</h3>
          <div className="cards-row" aria-label="available">
            {data?.slice(0,8).map(l => (
              <div key={l._id} className="listing-card">
                <div className="badge">{locale==='en' ? 'Guest favorite' : 'অতিথি প্রিয়'}</div>
                <div className="heart">♡</div>
                <img src={l.image} alt={l.title} className="card-media" />
                <div className="card-body">
                  <div className="card-title">{l.title}</div>
                  <div className="card-sub">${l.price} for 2 nights · ★ {l.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        
        {/* Inspiration for future getaways */}
        <section
  style={{
    marginTop: 40,
    marginBottom: 40,
    background: "#fafafa",
    padding: "32px 0", // Only vertical padding
    borderRadius: 12,
    boxSizing: "border-box"
  }}
>
  <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 16 }}>Inspiration for future getaways</h2>
  <div
    style={{
      display: 'flex',
      gap: 32,
      borderBottom: '1px solid #eee',
      marginBottom: 24,
      flexWrap: 'wrap'
    }}
  >
    <div
      style={{
        paddingBottom: 8,
        borderBottom: tab === 'tips' ? '2px solid #111' : 'none',
        fontWeight: tab === 'tips' ? 600 : 400,
        color: tab === 'tips' ? '#111' : '#888',
        cursor: 'pointer'
      }}
      onClick={() => setTab('tips')}
    >
      Travel tips & inspiration
    </div>
    <div
      style={{
        paddingBottom: 8,
        borderBottom: tab === 'apartments' ? '2px solid #111' : 'none',
        fontWeight: tab === 'apartments' ? 600 : 400,
        color: tab === 'apartments' ? '#111' : '#888',
        cursor: 'pointer'
      }}
      onClick={() => setTab('apartments')}
    >
      Airbnb-friendly apartments
    </div>
  </div>
  <div>
    {tab === 'tips' ? (
      <>
        <div style={{
          display: 'flex',
          gap: 48,
          marginBottom: 32,
          flexWrap: 'wrap',
          width: '100%'
        }}>
          <div>
            <div style={{ fontWeight: 600 }}>Family travel hub</div>
            <div style={{ color: '#666' }}>Tips and inspiration</div>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Family budget travel</div>
            <div style={{ color: '#666' }}>Get there for less</div>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Vacation ideas for any budget</div>
            <div style={{ color: '#666' }}>Make it special without making it spendy</div>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Travel Europe on a budget</div>
            <div style={{ color: '#666' }}>How to take the kids to Europe for less</div>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Outdoor adventure</div>
            <div style={{ color: '#666' }}>Explore nature with the family</div>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Bucket list national parks</div>
            <div style={{ color: '#666' }}>Must-see parks for family travel</div>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>Kid-friendly state parks</div>
          <div style={{ color: '#666' }}>Check out these family-friendly hikes</div>
        </div>
      </>
    ) : (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 24,
          width: '100%',
          marginTop: 16
        }}
      >
        {data?.map(l => (
          <div key={l._id} className="listing-card">
            <div className="badge">{locale==='en' ? 'Guest favorite' : 'অতিথি প্রিয়'}</div>
            <div className="heart">♡</div>
            <img src={l.image} alt={l.title} className="card-media" />
            <div className="card-body">
              <div className="card-title">{l.title}</div>
              <div className="card-sub">${l.price} for 2 nights · ★ {l.rating}</div>
            </div>
          </div>
        ))}
        <div>
          <div style={{ fontWeight: 600, color: '#007bff', cursor: 'pointer' }}>Show more <span style={{ fontSize: 18 }}>▼</span></div>
        </div>
      </div>
    )}
  </div>
</section>

        {/* Footer */}
        <footer style={{marginTop:40, borderTop:'1px solid #eee', paddingTop:32, display:'flex', justifyContent:'space-between'}}>
          <div>
            <div style={{fontWeight:600}}>Support</div>
            <div style={{color:'#666'}}>Help Center</div>
            <div style={{color:'#666'}}>Get help with a safety issue</div>
            <div style={{color:'#666'}}>AirCover</div>
            <div style={{color:'#666'}}>Anti-discrimination</div>
            <div style={{color:'#666'}}>Disability support</div>
          </div>
          <div>
            <div style={{fontWeight:600}}>Hosting</div>
            <div style={{color:'#666'}}>Airbnb your home</div>
            <div style={{color:'#666'}}>Airbnb your experience</div>
            <div style={{color:'#666'}}>Airbnb your service</div>
            <div style={{color:'#666'}}>AirCover for Hosts</div>
            <div style={{color:'#666'}}>Hosting resources</div>
          </div>
          <div>
            <div style={{fontWeight:600}}>Airbnb</div>
            <div style={{color:'#666'}}>2025 Summer Release</div>
            <div style={{color:'#666'}}>Newsroom</div>
            <div style={{color:'#666'}}>Careers</div>
            <div style={{color:'#666'}}>Investors</div>
            <div style={{color:'#666'}}>Gift cards</div>
          </div>
        </footer>
      </main>
    </div>
  );
}