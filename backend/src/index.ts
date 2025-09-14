import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import * as dotenv from 'dotenv';

// load backend/database.env
dotenv.config({ path: path.resolve(__dirname, '..', 'database.env') });


/*console.log('Resolved env path:', path.resolve(__dirname, '..', 'database.env'));
console.log('MONGO_URI present:', !!process.env.MONGO_URI);
console.log('MONGO_URI (truncated):', process.env.MONGO_URI ? `${process.env.MONGO_URI!.slice(0,80)}...` : '(none)');
*/
const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airbnb_clone';



// track DB connection 
let dbConnected = false;
let memoryListings: any[] = [];

function seedMemory(){
  memoryListings = [
    { _id: 'm1', title:'Apartment in Kuala Lumpur', city:'Kuala Lumpur', price:67, rating:4.91, image:'/images/kl1.jpg', maxGuests:4, bookings:[]},
    { _id: 'm2', title:'Place to stay in Cheras', city:'Kuala Lumpur', price:43, rating:4.94, image:'/images/kl2.jpg', maxGuests:2, bookings:[]},
    { _id: 'm3', title:'Condo in PULAPOL', city:'Kuala Lumpur', price:75, rating:4.92, image:'/images/kl3.jpg', maxGuests:3, bookings:[]},
    { _id: 'm4', title:'Apartment in Bangkok', city:'Bangkok', price:61, rating:4.8, image:'/images/bkk1.jpg', maxGuests:3, bookings:[]},
    { _id: 'm5', title:'Room in Phra Nakhon', city:'Bangkok', price:37, rating:5.0, image:'/images/bkk2.jpg', maxGuests:1, bookings:[]},
    { _id: 'm6', title:'Room in Dallas', city:'Dallas', price:40, rating:4.96, image:'/images/dallas1.jpg', maxGuests:1, bookings:[]},
    { _id: 'm7', title:'Room in Melbourne', city:'Melbourne', price:91, rating:4.93, image:'/images/mel1.jpg', maxGuests:2, bookings:[]},
    { _id: 'm8', title:'Room in Southbank', city:'Melbourne', price:141, rating:4.98, image:'/images/mel2.jpg', maxGuests:3, bookings:[]}
  ];
  console.log('Seeded in-memory listings');
}

// connect with a short server selection timeout and handle events
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    dbConnected = true;
    console.log('Mongo connected');
    seedIfEmpty().catch(err => console.error('Seed error', err));
  })
  .catch(e => {
    dbConnected = false;
    console.error('Mongo connection error', e);
    // fallback to in-memory data
    seedMemory();
  });

mongoose.connection.on('error', (err) => {
  dbConnected = false;
  console.error('Mongo connection error:', err);
});

mongoose.connection.on('connected', () => {
  dbConnected = true;
});

const listingSchema = new mongoose.Schema({
  title: String,
  city: String,
  price: Number,
  rating: Number,
  image: String,
  maxGuests: Number,
  bookings: [{checkIn: String, checkOut: String}]
});
const Listing = mongoose.model('Listing', listingSchema);

async function seedIfEmpty(){
  try{
    const count = await Listing.countDocuments();
    if(count>0) return;
    const seed = [
      {title:'Apartment in Kuala Lumpur', city:'Kuala Lumpur', price:67, rating:4.91, image:'/images/kl1.jpg', maxGuests:4, bookings:[]},
      {title:'Place to stay in Cheras', city:'Kuala Lumpur', price:43, rating:4.94, image:'/images/kl2.jpg', maxGuests:2, bookings:[]},
      {title:'Condo in PULAPOL', city:'Kuala Lumpur', price:75, rating:4.92, image:'/images/kl3.jpg', maxGuests:3, bookings:[]},
      {title:'Apartment in Bangkok', city:'Bangkok', price:61, rating:4.8, image:'/images/bkk1.jpg', maxGuests:3, bookings:[]},
      {title:'Room in Phra Nakhon', city:'Bangkok', price:37, rating:5.0, image:'/images/bkk2.jpg', maxGuests:1, bookings:[]},
      {title:'Room in Dallas', city:'Dallas', price:40, rating:4.96, image:'/images/dallas1.jpg', maxGuests:1, bookings:[]},
      {title:'Room in Melbourne', city:'Melbourne', price:91, rating:4.93, image:'/images/mel1.jpg', maxGuests:2, bookings:[]},
      {title:'Room in Southbank', city:'Melbourne', price:141, rating:4.98, image:'/images/mel2.jpg', maxGuests:3, bookings:[]}
    ];
    await Listing.insertMany(seed);
    console.log('Seeded listings');
  }catch(err){
    console.error('Error in seedIfEmpty:', err);
    // if seeding to DB fails
    if(!memoryListings || memoryListings.length===0) seedMemory();
  }
}

// API for listings
app.get('/api/listings', async (req: Request, res: Response) => {
  const { location, checkIn, checkOut, guests } = req.query as any;
  const q: any = {};
  if(location){
    q.city = { $regex: new RegExp(location, 'i') };
  }
  if(guests){
    q.maxGuests = { $gte: Number(guests) };
  }

  let listings: any[] = [];
  try{
    if(dbConnected){
      listings = await Listing.find(q).lean();
    }else{
      // filter memoryListings
      listings = memoryListings.filter(l => {
        if(q.city && q.city.$regex){
          const re = q.city.$regex as RegExp;
          if(!re.test(l.city)) return false;
        }
        if(q.maxGuests){
          if(!(l.maxGuests >= q.maxGuests.$gte)) return false;
        }
        return true;
      });
    }

    // naive date availability check
    if(checkIn && checkOut){
      const inDate = new Date(String(checkIn));
      const outDate = new Date(String(checkOut));
      listings = listings.filter((l:any) => {
        if(!l.bookings || l.bookings.length===0) return true;
        for(const b of l.bookings){
          const bIn = new Date(b.checkIn);
          const bOut = new Date(b.checkOut);
          if(!(outDate <= bIn || inDate >= bOut)){
            return false;
          }
        }
        return true;
      });
    }

    res.json(listings);
  }catch(err){
    console.error('Error fetching listings:', err);
    res.status(500).json({error:'Failed to fetch listings'});
  }
});

// expanded translations endpoint
app.get('/api/translations/:locale', (req: Request, res: Response) => {
  const { locale } = req.params;
  const translations: any = {
    en: {
      popular_homes: 'Popular homes',
      available_next_month: 'Available next month',
      guest_favorite: 'Guest favorite',
      search: 'Search',
      support: 'Support',
      help_center: 'Help Center',
      hosting: 'Hosting',
      airbnb_your_home: 'Airbnb your home'
    },
    bn: {
      popular_homes: 'জনপ্রিয় বাড়ি',
      available_next_month: 'পরের মাসে উপলব্ধ',
      guest_favorite: 'অতিথি প্রিয়',
      search: 'অনুসন্ধান',
      support: 'সাপোর্ট',
      help_center: 'হেল্প সেন্টার',
      hosting: 'হোস্টিং',
      airbnb_your_home: 'আপনার বাড়ি তালিকাভুক্ত করুন'
    }
  };
  res.json(translations[locale] || translations.en);
});

app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

const port = process.env.PORT || 4000;
app.listen(port, ()=>console.log('Server running on', port));
