import {
  MapPin,
  Baby,
  Droplets,
  Dumbbell,
  ExternalLink,
  Tag,
  Home,
  PersonStanding, // ← ベビーカーの代替（移動できるニュアンス）
  TreePine,       // ← 遊具の代替（公園感）
} from "lucide-react";
import type { Spot } from "../types";

type Props = {
  spot: Spot;
  onClickDetail?: (id: number) => void;
};

export default function SpotCard({ spot, onClickDetail }: Props) {
  const facilityItems = [
    { key: "diaperChanging", label: "おむつ台", icon: Baby, on: spot.diaperChanging },
    { key: "strollerOk", label: "ベビーカー", icon: PersonStanding, on: spot.strollerOk }, // ← 車いす感を回避
    { key: "playground", label: "遊具", icon: TreePine, on: spot.playground },             // ← 公園感で違和感減
    { key: "athletics", label: "アスレチック", icon: Dumbbell, on: spot.athletics },
    { key: "waterPlay", label: "水遊び", icon: Droplets, on: spot.waterPlay },
    { key: "indoor", label: "屋内", icon: Home, on: spot.indoor },
  ];

  const activeFacilities = facilityItems.filter((x) => x.on).slice(0, 6);

  const priceLabel =
    spot.priceType === "FREE"
      ? "無料"
      : spot.priceType === "UNDER_1000"
        ? "〜1,000円"
        : spot.priceType === "UNDER_2000"
          ? "〜2,000円"
          : spot.priceType === "OVER_2000"
            ? "2,000円〜"
            : spot.priceType;

  const targetAgeLabel =
    spot.targetAge === "ALL"
      ? "全年齢"
      : spot.targetAge === "PRESCHOOL"
        ? "未就学"
        : spot.targetAge === "ELE_LOW"
          ? "小学校低学年"
          : spot.targetAge === "ELE_HIGH"
            ? "小学校高学年"
            : spot.targetAge === "JUNIOR_HIGH"
              ? "中学生"
              : spot.targetAge;

  return (
    <div className="group rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            {spot.name}
          </h3>

          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
            {spot.categoryName}
          </span>
        </div>

        <div className="mt-2 flex items-start gap-2 text-slate-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p className="text-sm leading-relaxed line-clamp-2">{spot.address}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
            <Tag className="h-4 w-4 text-slate-400" />
            {spot.area}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
            {priceLabel}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
            {targetAgeLabel}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-500">設備</p>

          {activeFacilities.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {activeFacilities.map((f) => {
                const Icon = f.icon;
                return (
                  <span
                    key={f.key}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                  >
                    <Icon className="h-4 w-4 text-emerald-700" />
                    {f.label}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">設備情報なし</p>
          )}
        </div>

        {spot.googleMapUrl && (
          <a
            href={spot.googleMapUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-4 w-4" />
            Googleマップで開く
          </a>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-emerald-50 px-5 py-4">
        <span className="text-xs text-slate-500">行く前にサクッとチェック</span>

        {/* ✅ 詳細へ：オレンジに変更 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClickDetail?.(spot.id);
          }}
          className="
            rounded-xl
            bg-orange-500
            px-3.5 py-2
            text-sm font-semibold text-white
            shadow-sm
            transition
            hover:bg-orange-600
            focus:outline-none focus:ring-2 focus:ring-orange-200
          "
        >
          詳細へ
        </button>
      </div>
    </div>
  );
}
