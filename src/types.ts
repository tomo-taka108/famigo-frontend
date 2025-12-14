// Spot（フロントが扱うスポット情報）
// バックエンドの SpotListItemDto と完全一致

export interface Spot {
  id: number;
  name: string;
  address: string;
  area: string;
  priceType: string;
  categoryName: string;
  targetAge: string;
  googleMapUrl: string | null;

  diaperChanging: boolean;
  strollerOk: boolean;
  playground: boolean;
  athletics: boolean;
  waterPlay: boolean;
  indoor: boolean;
}

// フィルター用
// SpotController の @RequestParam と対応（Enumは「Enum名」で送る）
export type PriceType = "FREE" | "UNDER_1000" | "UNDER_2000" | "OVER_2000";
export type AgeGroup =
  | "ALL"
  | "PRESCHOOL"
  | "ELE_LOW"
  | "ELE_HIGH"
  | "JUNIOR_HIGH";
export type FacilityKey =
  | "diaper"
  | "stroller"
  | "playground"
  | "athletics"
  | "water"
  | "indoor";


// カテゴリ（フロントが扱うカテゴリ情報）
// バックエンドの CategoryDto と完全一致
export interface Category {
  id: number;
  name: string;
}


// 検索条件（フロントが保持する状態）
// バックエンドの検索条件（SpotSearchCondition / RequestParam）と対応
export interface FilterState {
  keyword: string;
  categoryIds: number[]; // 例）categoryIds=1&categoryIds=3
  price: PriceType[]; // 例）price=FREE&price=UNDER_1000
  age: AgeGroup[]; // 例）age=PRESCHOOL&age=ELE_LOW
  facilities: FacilityKey[]; // 例）facilities=diaper&facilities=indoor
}


// SpotDetail（フロントが扱うスポット詳細）
// バックエンドの SpotDetailDto と完全一致

export interface SpotDetail {
  id: number;
  name: string;
  address: string;
  area: string;
  priceType: string;
  categoryName: string;

  parkingInfo: string | null;
  toiletInfo: string | null;
  targetAge: string | null;
  stayingTime: string | null;
  convenienceStore: string | null;
  restaurantInfo: string | null;
  googleMapUrl: string | null;
  closedDays: string | null;
  officialUrl: string | null;
  notes: string | null;

  diaperChanging: boolean;
  strollerOk: boolean;
  playground: boolean;
  athletics: boolean;
  waterPlay: boolean;
  indoor: boolean;
}
