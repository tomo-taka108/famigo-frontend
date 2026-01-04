import type { Spot, SpotDetail, FilterState } from "../types";
import { apiFetch } from "./client";

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
// バックエンドDTO（一覧）
// ---------------------------------------------
export type BackendSpotDto = {
  id: number;
  name: string;
  address: string;
  priceType: string; // "FREE" | "LOW" | "MID" | "HIGH"
  ratingAvg: number | null;
  reviewCount: number;
  isFavorite?: boolean; // ログイン時だけ true/false、未ログイン時は無い可能性
  categoryNames?: string[];
  facilities?: Record<string, unknown>;
};

// ---------------------------------------------
// バックエンドDTO（詳細）
// ---------------------------------------------
export type BackendSpotDetailDto = {
  id: number;
  name: string;
  address: string;
  description: string | null;
  officialUrl: string | null;
  googleMapUrl: string | null;
  priceType: string; // "FREE" | "LOW" | "MID" | "HIGH"
  ratingAvg: number | null;
  reviewCount: number;
  isFavorite?: boolean;
  categoryNames?: string[];
  facilities?: Record<string, unknown>;
};

// ---------------------------------------------
// priceType をフロントの priceCategory に変換
// ---------------------------------------------
const mapPriceTypeToPriceCategory = (priceType: string): Spot["priceCategory"] => {
  switch (priceType) {
    case "FREE":
      return "free";
    case "LOW":
      return "1000";
    case "MID":
      return "2000";
    case "HIGH":
      return "paid";
    default:
      return "paid";
  }
};

// ---------------------------------------------
// facilities を Spot.facilities に変換
// （バックエンドは map 形式になってる想定）
// ---------------------------------------------
const mapFacilities = (facilities?: Record<string, unknown>): Spot["facilities"] => {
  return {
    toilet: toBool(facilities?.toilet),
    parking: toBool(facilities?.parking),
    diaper: toBool(facilities?.diaper),
    indoor: toBool(facilities?.indoor),
    water: toBool(facilities?.water),
    largePlayground: toBool(facilities?.largePlayground),
    stroller: toBool(facilities?.stroller),
  };
};

// ---------------------------------------------
// BackendSpotDto → Spot
// ---------------------------------------------
export const mapBackendSpotToSpot = (dto: BackendSpotDto): Spot => {
  return {
    id: String(dto.id),
    name: dto.name,
    address: dto.address,
    rating: dto.ratingAvg ?? 0,
    reviewCount: dto.reviewCount,
    image: "", // 画像は現状未実装
    tags: dto.categoryNames ?? [],
    priceCategory: mapPriceTypeToPriceCategory(dto.priceType),
    facilities: mapFacilities(dto.facilities),
    isFavorite: dto.isFavorite ?? false,
  };
};

// ---------------------------------------------
// BackendSpotDetailDto → SpotDetail
// ---------------------------------------------
export const mapBackendSpotDetailToSpotDetail = (dto: BackendSpotDetailDto): SpotDetail => {
  return {
    id: String(dto.id),
    name: dto.name,
    address: dto.address,
    rating: dto.ratingAvg ?? 0,
    reviewCount: dto.reviewCount,
    image: "",
    tags: dto.categoryNames ?? [],
    priceCategory: mapPriceTypeToPriceCategory(dto.priceType),
    facilities: mapFacilities(dto.facilities),
    isFavorite: dto.isFavorite ?? false,

    // detail fields
    description: dto.description ?? "",
    officialUrl: dto.officialUrl ?? "",
    googleMapUrl: dto.googleMapUrl ?? "",
  };
};

// ---------------------------------------------
// 一覧API：GET /spots（検索条件あり：GET /spots?keyword=...&categoryIds=...&price=...&age=...&facilities=...）
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

  // クエリがある時だけ /spots?...
  const path = qs.toString() ? `/spots?${qs.toString()}` : `/spots`;

  // ✅ apiFetch を使う（tokenがある時は Authorization が付く → isFavorite 等が返せる）
  const data: BackendSpotDto[] = await apiFetch<BackendSpotDto[]>(path, {
    method: "GET",
  });

  return data.map(mapBackendSpotToSpot);
};

// ---------------------------------------------
// 詳細API：GET /spots/{id}
// ---------------------------------------------
export const fetchSpotDetail = async (id: number): Promise<SpotDetail> => {
  // ✅ apiFetch を使う（tokenがある時は Authorization が付く → isFavorite 等が返せる）
  const data: BackendSpotDetailDto = await apiFetch<BackendSpotDetailDto>(`/spots/${id}`, {
    method: "GET",
  });

  return mapBackendSpotDetailToSpotDetail(data);
};
