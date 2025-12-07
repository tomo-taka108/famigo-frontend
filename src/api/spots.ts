import type { Spot,SpotDetail } from "../types";

// ---------------------------------------------
// 共通の API ベースURL
// ---------------------------------------------
const BASE_URL = "http://localhost:8080";

// ---------------------------------------------
// Spot 一覧用 DTO（バックエンド → フロント）
// ---------------------------------------------
export interface BackendSpotDto {
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

// Spot 一覧：BackendSpotDto → Spot 変換
export const mapBackendSpotToSpot = (dto: BackendSpotDto): Spot => {
  return {
    id: dto.id,
    name: dto.name,
    address: dto.address,
    area: dto.area,
    priceType: dto.priceType,
    categoryName: dto.categoryName,
    googleMapUrl: dto.googleMapUrl,

    diaperChanging: dto.diaperChanging,
    strollerOk: dto.strollerOk,
    playground: dto.playground,
    athletics: dto.athletics,
    waterPlay: dto.waterPlay,
    indoor: dto.indoor,
  };
};

// ---------------------------------------------
// Spot詳細用 DTO（バックエンド → フロント）
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

  diaperChanging: boolean;
  strollerOk: boolean;
  playground: boolean;
  athletics: boolean;
  waterPlay: boolean;
  indoor: boolean;
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

    diaperChanging: dto.diaperChanging,
    strollerOk: dto.strollerOk,
    playground: dto.playground,
    athletics: dto.athletics,
    waterPlay: dto.waterPlay,
    indoor: dto.indoor,
  };
};

// ---------------------------------------------
// 一覧API：GET /spots
// ---------------------------------------------
export const fetchSpots = async (): Promise<Spot[]> => {
  const res = await fetch(`${BASE_URL}/spots`);

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
