
export interface Movie {
  id: string;
  title: string;
  poster: string;
  rating: number;
  genre: string[];
  duration: string;
  description: string;
  releaseDate: string;
  languages: string[];
  formats: ('2D' | '3D' | 'IMAX' | '4DX')[];
  cast: { name: string; role: string; image: string }[];
}

export interface Cinema {
  id: string;
  name: string;
  location: string;
  distance: string;
  lat?: number;
  lng?: number;
  screens?: number;
}

export interface Show {
  id: string;
  movieId: string;
  cinemaId: string;
  time: string;
  date: string;
  screen: number;
  format: '2D' | '3D' | 'IMAX' | '4DX';
  price: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface Booking {
  id: string;
  movieId: string;
  cinemaId: string;
  seats: string[];
  time: string;
  date: string;
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  qrCode: string;
  foodItems: { id: string; quantity: number }[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export type ViewState = 'home' | 'details' | 'booking' | 'payment' | 'success' | 'profile' | 'admin';

export interface GroundingSource {
  title?: string;
  uri?: string;
}
