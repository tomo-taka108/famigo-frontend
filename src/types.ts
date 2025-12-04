export interface Spot {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  image: string;
  tags: string[];
  priceCategory: 'free' | 'cheap' | 'paid';
  facilities: {
    toilet: boolean;
    parking: boolean;
    diaper: boolean;
    indoor: boolean;
    water: boolean;
    largePlayground: boolean;
    stroller: boolean;
  };
}

export interface FilterState {
  keyword: string;
  price: string[]; // 'free', 'cheap', 'paid'
  age: string[]; // 'toddler', 'elementary'
  facilities: string[];
}