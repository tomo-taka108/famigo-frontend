// src/api/spots.ts
import { apiFetch } from "./client";
import type { Spot, SpotDetail, FilterState } from "../types";

// ---------------------------------------------
// 0/1/true/false/null を安全に boolean にする
// ---------------------------------------------
const toBool = (v: unknown): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v !== "0" && v.toLowerCase() !== "false" && v !== "";
  return false;
};

// ---------------------------------------------
// Spot 一覧用 DTO（バックエンド → フロント）
// SpotListItemDto と対応
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

  isFavorite: boolean | number | null;

  diaperChanging: boolean | null;
  strollerOk: boolean | null;
  playground: boolean | null;
  athletics: boolean | null;
  waterPlay: boolean | null;
  indoor: boolean | null;
}

export const mapBackendSpotToSpot = (dto: BackendSpotDto): Spot => ({
  id: dto.id,
  name: dto.name,
  address: dto.address,
  area: dto.area,
  priceType: dto.priceType,
  categoryName: dto.categoryName,
  targetAge: dto.targetAge,
  googleMapUrl: dto.googleMapUrl,

  isFavorite: toBool(dto.isFavorite),

  diaperChanging: !!dto.diaperChanging,
  strollerOk: !!dto.strollerOk,
  playground: !!dto.playground,
  athletics: !!dto.athletics,
  waterPlay: !!dto.waterPlay,
  indoor: !!dto.indoor,
});

// ---------------------------------------------
// Spot 詳細用 DTO（バックエンド → フロント）
// SpotDetailDto と対応
// ---------------------------------------------
export interface BackendSpotDetailDto {
  id: number;
  name: string;
  address: string;
  area: string;
  priceType: string;
  categoryName: string;

  isFavorite: boolean | number | null;

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

  diaperChanging: boolean | null;
  strollerOk: boolean | null;
  playground: boolean | null;
  athletics: boolean | null;
  waterPlay: boolean | null;
  indoor: boolean | null;
}

export const mapBackendSpotDetailToSpotDetail = (dto: BackendSpotDetailDto): SpotDetail => ({
  id: dto.id,
  name: dto.name,
  address: dto.address,
  area: dto.area,
  priceType: dto.priceType,
  categoryName: dto.categoryName,

  isFavorite: toBool(dto.isFavorite),

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
});

// ---------------------------------------------
// 一覧API：GET /api/spots
// ※ isFavorite を返したいなら auth:true が必要（バックが認証必須化している場合）
// ---------------------------------------------
export const fetchSpots = async (filter?: Partial<FilterState>): Promise<Spot[]> => {
  const qs = new URLSearchParams();

  if (filter?.keyword && filter.keyword.trim() !== "") {
    qs.append("keyword", filter.keyword.trim());
  }

  filter?.categoryIds?.forEach((id) => qs.append("categoryIds", String(id)));
  filter?.price?.forEach((p) => qs.append("price", p));
  filter?.age?.forEach((a) => qs.append("age", a));
  filter?.facilities?.forEach((f) => qs.append("facilities", f));

  const path = qs.toString() ? `/api/spots?${qs.toString()}` : `/api/spots`;

  // ✅ ここがポイント：
  // backendが「スポット一覧でも isFavorite を出すために認証必須」にしている場合、
  // auth:true を付けるとログイン時だけBearerが載る（未ログインでもtokenが無ければ付かない）
  const data = await apiFetch<BackendSpotDto[]>(path, { method: "GET", auth: true });

  return data.map(mapBackendSpotToSpot);
};

// ---------------------------------------------
// 詳細API：GET /api/spots/{id}
// ---------------------------------------------
export const fetchSpotDetail = async (id: number): Promise<SpotDetail> => {
  const data = await apiFetch<BackendSpotDetailDto>(`/api/spots/${id}`, { method: "GET", auth: true });
  return mapBackendSpotDetailToSpotDetail(data);
};
