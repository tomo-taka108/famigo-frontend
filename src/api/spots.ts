import type { Spot, SpotDetail, FilterState } from "../types";

// ---------------------------------------------
// 共通の API ベースURL
// ---------------------------------------------
const BASE_URL = "http://localhost:8080";

// ---------------------------------------------
// Spot 一覧用 DTO（バックエンド → フロント）
// ※バックエンド：SpotListItemDto と対応
// ---------------------------------------------
export interface BackendSpotDto {
  id: number;
  name: string;
  address: string;
  area: string;
  priceType: string;
  categoryName: string;
  targetAge: string;
  googleMapUrl: string | null;

  // 注意：LEFT JOIN のため null の可能性あり（Boolean → null）
  diaperChanging: boolean | null;
  strollerOk: boolean | null;
  playground: boolean | null;
  athletics: boolean | null;
  waterPlay: boolean | null;
  indoor: boolean | null;
}

// Spot 一覧：BackendSpotDto → Spot 変換
// null の設備フラグは false に補正して扱う
export const mapBackendSpotToSpot = (dto: BackendSpotDto): Spot => {
  return {
    id: dto.id,
    name: dto.name,
    address: dto.address,
    area: dto.area,
    priceType: dto.priceType,
    categoryName: dto.categoryName,
    targetAge: dto.targetAge,
    googleMapUrl: dto.googleMapUrl,

    diaperChanging: !!dto.diaperChanging,
    strollerOk: !!dto.strollerOk,
    playground: !!dto.playground,
    athletics: !!dto.athletics,
    waterPlay: !!dto.waterPlay,
    indoor: !!dto.indoor,
  };
};

// ---------------------------------------------
// Spot詳細用 DTO（バックエンド → フロント）
// ※バックエンド：SpotDetailDto と対応
// ---------------------------------------------
export interface BackendSpotDetailDto {
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

  // 注意：LEFT JOIN のため null の可能性あり（Boolean → null）
  diaperChanging: boolean | null;
  strollerOk: boolean | null;
  playground: boolean | null;
  athletics: boolean | null;
  waterPlay: boolean | null;
  indoor: boolean | null;
}

// Spot詳細：BackendSpotDetailDto → SpotDetail 変換
export const mapBackendSpotDetailToSpotDetail = (
  dto: BackendSpotDetailDto
): SpotDetail => {
  return {
    id: dto.id,
    name: dto.name,
    address: dto.address,
    area: dto.area,
    priceType: dto.priceType,
    categoryName: dto.categoryName,
    parkingInfo: dto.parkingInfo,
    toiletInfo: dto.toiletInfo,
    targetAge: dto.targetAge,
    stayingTime: dto.stayingTime,
    convenienceStore: dto.convenienceStore,
    restaurantInfo: dto.restaurantInfo,
    googleMapUrl: dto.googleMapUrl,
    closedDays: dto.closedDays,
    officialUrl: dto.officialUrl,
    notes: dto.notes,

    diaperChanging: !!dto.diaperChanging,
    strollerOk: !!dto.strollerOk,
    playground: !!dto.playground,
    athletics: !!dto.athletics,
    waterPlay: !!dto.waterPlay,
    indoor: !!dto.indoor,
  };
};

// ---------------------------------------------
// 一覧API：GET /spots
// 検索条件あり：GET /spots?keyword=...&categoryIds=...&price=...&age=...&facilities=...
// ---------------------------------------------
export const fetchSpots = async (filter?: Partial<FilterState>): Promise<Spot[]> => {
  const qs = new URLSearchParams();

  // keyword（未指定なら送らない）
  if (filter?.keyword && filter.keyword.trim() !== "") {
    qs.append("keyword", filter.keyword.trim());
  }

  // categoryIds（複数指定可）
  filter?.categoryIds?.forEach((id) => qs.append("categoryIds", String(id)));

  // price / age は Enum名を送る
  filter?.price?.forEach((p) => qs.append("price", p));
  filter?.age?.forEach((a) => qs.append("age", a));

  // facilities（複数指定可）
  filter?.facilities?.forEach((f) => qs.append("facilities", f));

  const url = qs.toString() ? `${BASE_URL}/spots?${qs.toString()}` : `${BASE_URL}/spots`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Failed to fetch spots: ${res.status}`);
  }

  const data: BackendSpotDto[] = await res.json();
  return data.map(mapBackendSpotToSpot);
};

// ---------------------------------------------
// 詳細API：GET /spots/{id}
// ---------------------------------------------
export const fetchSpotDetail = async (id: number): Promise<SpotDetail> => {
  const res = await fetch(`${BASE_URL}/spots/${id}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch spot detail: ${res.status}`);
  }

  const data: BackendSpotDetailDto = await res.json();
  return mapBackendSpotDetailToSpotDetail(data);
};
