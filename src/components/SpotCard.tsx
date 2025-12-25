import {
  MapPin,
  Baby,
  Droplets,
  Dumbbell,
  ExternalLink,
  Tag,
  Home,
  PersonStanding,
  TreePine,
  Heart,
} from "lucide-react";
import type { Spot } from "../types";

type Props = {
  spot: Spot;
  onClickDetail?: (id: number) => void;
  onToggleFavorite?: (id: number, next: boolean) => void;
};

export default function SpotCard({ spot, onClickDetail, onToggleFavorite }: Props) {
  const facilityItems = [
    { key: "diaperChanging", label: "おむつ台", icon: Baby, on: spot.diaperChanging },
    { key: "strollerOk", label: "ベビーカー", icon: PersonStanding, on: spot.strollerOk },
    { key: "playground", label: "遊具", icon: TreePine, on: spot.playground },
    { key: "athletics", label: "アスレチックコース", icon: Dumbbell, on: spot.athletics },
    { key: "waterPlay", label: "水遊び", icon: Droplets, on: spot.waterPlay },
    { key: "indoor", label: "屋内", icon: Home, on: spot.indoor },
  ];

  const activeFacilities = facilityItems.filter((x) => x.on).slice(0, 6);

  const priceLabel =
    spot.priceType === "FREE"
      ? "無料"
      : spot.priceType === "UNDER_1000"
        ? "1000円以内"
        : spot.priceType === "UNDER_2000"
          ? "2000円以内"
          : spot.priceType === "OVER_2000"
            ? "2000円超"
            : spot.priceType;

  const targetAgeLabel =
    spot.targetAge === "ALL"
      ? "全年齢"
      : spot.targetAge === "PRESCHOOL"
        ? "未就学児まで"
        : spot.targetAge === "ELE_LOW"
          ? "小学校低学年まで"
          : spot.targetAge === "ELE_HIGH"
            ? "小学校高学年まで"
            : spot.targetAge === "JUNIOR_HIGH"
              ? "中学生まで"
              : spot.targetAge;

  return (
    <div className="group rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {spot.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
              {spot.categoryName}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const next = !spot.isFavorite;
                onToggleFavorite?.(spot.id, next);
              }}
              className={`
                inline-flex items-center justify-center
                h-9 w-9 rounded-xl border
                transition
                ${spot.isFavorite
                  ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}
              `}
              aria-label={spot.isFavorite ? "お気に入り解除" : "お気に入り登録"}
              title={spot.isFavorite ? "お気に入り解除" : "お気に入り登録"}
            >
              <Heart className="h-5 w-5" fill={spot.isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
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