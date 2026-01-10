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

export type FieldErrorItem = {
  field: string;
  message: string;
};

export interface ApiErrorResponse {
  errorCode: ErrorCode;
  message: string;
  fieldErrors?: FieldErrorItem[];
}

// fetch側でthrowする用途（UIで判定できるように）
export class ApiError extends Error {
  public readonly status: number;
  public readonly errorCode: ErrorCode;
  public readonly fieldErrors?: FieldErrorItem[];

  constructor(params: {
    status: number;
    errorCode: ErrorCode;
    message: string;
    fieldErrors?: FieldErrorItem[];
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.errorCode = params.errorCode;
    this.fieldErrors = params.fieldErrors;
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
  targetAge: string;
  shortDescription: string;
  imageUrl?: string | null;
  isFavorite?: boolean;
  categoryName?: string;
}

// ----------------------------
// Spot（詳細）
// ----------------------------
export interface SpotDetail {
  id: number;
  name: string;
  address: string;
  area: string;
  priceType: string;
  targetAge: string;
  shortDescription: string;
  description: string;
  imageUrl?: string | null;
  access?: string | null;
  parking?: string | null;
  openingHours?: string | null;
  holiday?: string | null;
  fee?: string | null;
  recommendedSeason?: string | null;
  notes?: string | null;
  officialUrl?: string | null;
  googleMapUrl?: string | null;

  categoryId: number;
  categoryName: string;

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
  | "BABY"
  | "TODDLER"
  | "PRESCHOOL"
  | "ELEMENTARY"
  | "JUNIOR_HIGH"
  | "HIGH_SCHOOL"
  | "ADULT";

export interface SpotSearchParams {
  keyword?: string;
  address?: string;
  categoryIds?: number[];
  priceType?: PriceType;
  ageGroup?: AgeGroup;
  diaperChanging?: boolean;
  strollerOk?: boolean;
  playground?: boolean;
  athletics?: boolean;
  waterPlay?: boolean;
  indoor?: boolean;
}

// ----------------------------
// Review
// ----------------------------
export interface ReviewListItem {
  id: number;
  spotId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  visitedAt?: string | null;
  createdAt: string;
}

export interface ReviewCreateRequest {
  rating: number;
  comment: string;
  visitedAt?: string | null;
}
