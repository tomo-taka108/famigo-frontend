import type { Spot } from "./types";

// ---------------------------------------------
// 開発用モックデータ（※現在は未使用）
// バックエンドが起動していない時のUI確認などに使う想定。
// ※Spot（= SpotListItemDto）と一致する形にしておく
// ---------------------------------------------
export const MOCK_SPOTS: Spot[] = [
  {
    id: 1,
    name: "陽だまりわんぱく公園",
    address: "東京都練馬区光が丘",
    area: "東京都",
    priceType: "無料",
    categoryName: "公園",
    targetAge: "小学校低学年まで",
    googleMapUrl: null,
    diaperChanging: true,
    strollerOk: true,
    playground: true,
    athletics: false,
    waterPlay: true,
    indoor: false,
  },
];
