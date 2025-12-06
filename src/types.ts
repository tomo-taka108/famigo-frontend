// Spot（フロントが扱うスポット情報）
// バックエンドの SpotListItemDto と完全一致

export interface Spot {
  id: number;
  name: string;
  address: string;
  area: string;
  priceType: string;
  categoryName: string;
  googleMapUrl: string | null;

  diaperChanging: boolean;
  strollerOk: boolean;
  playground: boolean;
  athletics: boolean;
  waterPlay: boolean;
  indoor: boolean;
}

// フィルター用
export interface FilterState {
  keyword: string;
  price: string[];       // 'free', '1000', '2000', 'paid'
  age: string[];
  facilities: string[];
}
