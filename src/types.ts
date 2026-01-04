// src/types.ts

// ----------------------------
// 共通：APIエラー型（フロント用）
// ----------------------------
export type ErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "ACCESS_DENIED"
  | "VALIDATION_ERROR"
  | "RESOURCE_NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | string;

export interface ApiErrorResponse {
  errorCode: ErrorCode;
  message: string;
}

// fetch側でthrowする用途（UIで判定できるように）
export class ApiError extends Error {
  public readonly status: number;
  public readonly errorCode: ErrorCode;

  constructor(params: { status: number; errorCode: ErrorCode; message: string }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.errorCode = params.errorCode;
  }
}

// ----------------------------
// 認証（フロント用）
// ----------------------------
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "GUEST" | "USER" | "ADMIN" | string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

// ----------------------------
// Spot（一覧）
// ----------------------------
export interface Spot {
  id: number;
  name: string;
  address: string;
  area: string;
  priceType: string;
  categoryName: string;
  targetAge: string;
  googleMapUrl: string | null;

  isFavorite: boolean;

  diaperChanging: boolean;
  strollerOk: boolean;
  playground: boolean;
  athletics: boolean;
  waterPlay: boolean;
  indoor: boolean;
}

// ----------------------------
// 検索条件（フィルタ）
// ----------------------------
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

export interface FilterState {
  keyword: string;
  categoryIds: number[];
  price: PriceType[];
  age: AgeGroup[];
  facilities: FacilityKey[];
}

// ----------------------------
// Category（一覧）
// ----------------------------
export interface Category {
  id: number;
  name: string;
}

// ----------------------------
// SpotDetail（詳細）
// ----------------------------
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

  isFavorite: boolean;

  diaperChanging: boolean;
  strollerOk: boolean;
  playground: boolean;
  athletics: boolean;
  waterPlay: boolean;
  indoor: boolean;
}

// ----------------------------
// Review（子どもの年齢帯）
// ----------------------------
export type ChildAgeGroup =
  | "PRESCHOOL"
  | "ELE_LOW"
  | "ELE_HIGH"
  | "JUNIOR_HIGH_PLUS";

// ----------------------------
// Review Create（投稿）
// ----------------------------
export interface ReviewCreateRequest {
  childAgeGroup: ChildAgeGroup;
  rating: number;
  ratingCost?: number | null;
  crowdLevel?: number | null;
  toiletCleanliness?: number | null;
  strollerEase?: number | null;
  reviewText: string;
  costTotal?: number | null;
}

// ✅ 追加：Review Upsert（投稿/更新 共通）
// reviews.ts がこれを import しているため必須
export interface ReviewUpsertRequest {
  childAgeGroup: ChildAgeGroup;
  rating: number;
  ratingCost?: number | null;
  crowdLevel?: number | null;
  toiletCleanliness?: number | null;
  strollerEase?: number | null;
  reviewText: string;
  costTotal?: number | null;
}

// ----------------------------
// Review Update（更新）
// ----------------------------
export interface ReviewUpdateRequest {
  childAgeGroup: ChildAgeGroup;
  rating: number;
  ratingCost?: number | null;
  crowdLevel?: number | null;
  toiletCleanliness?: number | null;
  strollerEase?: number | null;
  reviewText: string;
  costTotal?: number | null;
}

// ----------------------------
// ReviewListItem（一覧1件）
// ----------------------------
export interface ReviewListItem {
  id: number;
  spotId: number;
  userId: number;
  userName: string;

  rating: number;
  reviewText: string;
  createdAt: string;

  childAgeGroup?: ChildAgeGroup | null;
  ratingCost?: number | null;
  crowdLevel?: number | null;
  toiletCleanliness?: number | null;
  strollerEase?: number | null;
  costTotal?: number | null;

  isMine?: boolean;
}
