import type { Spot } from "../types";

// バックエンドから返ってくる DTO
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

// BackendSpotDto → Spot への変換
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

// /spots API を叩いて Spot[] を返す
export const fetchSpots = async (): Promise<Spot[]> => {
  const res = await fetch("http://localhost:8080/spots");

  if (!res.ok) {
    throw new Error(`Failed to fetch spots: ${res.status}`);
  }

  const data: BackendSpotDto[] = await res.json();

  return data.map(mapBackendSpotToSpot);
};
