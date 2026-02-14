// src/pages/LandingPage/index.tsx
import { Link, useNavigate } from "react-router-dom";
import { HeartIcon, MapIcon, SearchIcon, StarIcon } from "../../components/Icons";
import parkHero from "../../assets/park-hero.jpg";

import type { ReactNode } from "react";

type FeatureCardProps = {
  title: string;
  description: ReactNode;
  icon: ReactNode;
  iconClassName: string;
};

function FeatureCard({ title, description, icon, iconClassName }: FeatureCardProps) {
  return (
    // ✅ 添付2枚目寄せ：縦積み＋中央（アイコン＋タイトル上段、説明文下段）
    <div className="rounded-2xl border border-white/70 bg-white/82 p-5 shadow-sm backdrop-blur text-center">
      <div className="flex items-center justify-center gap-2">
        <span
          className={[
            "inline-flex h-9 w-9 items-center justify-center rounded-xl",
            "shadow-sm ring-1 ring-white/60",
            iconClassName,
          ].join(" ")}
        >
          {icon}
        </span>

        <div className="font-extrabold text-slate-900 text-xl">{title}</div>
      </div>

      {/* ✅ 2行で見せる：省略なし / 文言変更なし（brで固定） */}
      <div className="mt-3 text-sm text-slate-600 leading-relaxed">{description}</div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="py-10 md:py-14">
      <div className="mx-auto max-w-5xl px-4">
        {/* ✅ 背景写真：横長のまま全体表示（contain）＋上寄せ */}
        <div
          className="relative overflow-hidden rounded-3xl border border-white/60 shadow-sm"
          style={{
            backgroundImage: `url(${parkHero})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain", // ✅ 左右を切らずに全体表示
            backgroundPosition: "top center", // ✅ 上寄せ
          }}
        >
          {/* ✅ 写真を隠さない“最小限”の薄いフィルター */}
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-b from-white/10 via-white/08 to-white/16"
          />

          {/* ✅ ① 文字群を下へ（枠1個分くらい） */}
          <div className="relative px-6 pb-10 pt-52 md:px-10 md:pb-12 md:pt-72">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/78 px-4 py-1.5 text-base md:text-lg font-extrabold text-emerald-900 shadow-sm">
                <span aria-hidden>✨</span>
                家族みんなで楽しくお出かけ！
              </div>

              <h1 className="famigo-title mt-5 text-4xl md:text-6xl font-extrabold tracking-tight text-emerald-700">
                Famigo（ファミゴー）
              </h1>

              <p className="mt-5 text-slate-800 leading-relaxed md:text-lg">
                お金をかけずに、子どもとたっぷり遊べる場所が見つかるサービスです。
                <br />
                公園・アスレチック・水遊びなど、家族で行けるスポットをサクッと検索！
              </p>

              {/* 検索バー風 */}
              <button
                type="button"
                onClick={() => navigate("/spots")}
                className="mt-7 w-full max-w-xl mx-auto rounded-2xl border border-white/70 bg-white/78 px-4 py-3 text-left shadow-sm transition hover:bg-white/90"
              >
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <SearchIcon className="h-5 w-5" />
                  </span>
                  <span className="text-sm md:text-base">エリア・カテゴリで探す</span>
                </div>
              </button>
            </div>

            {/* ✅ ② 4機能：添付2枚目のレイアウトを忠実に再現（md以上で横一列） */}
            <div className="mt-10 mx-auto max-w-5xl grid grid-cols-2 gap-5 md:grid-cols-4">
              <FeatureCard
                title="一覧検索"
                icon={<SearchIcon className="h-5 w-5" />}
                iconClassName="bg-emerald-50 text-emerald-700"
                description={
                  <>
                    エリア/カテゴリ/予算など
                    <br />
                    でお出かけスポットを検索
                  </>
                }
              />

              <FeatureCard
                title="詳細"
                icon={<MapIcon className="h-5 w-5" />}
                iconClassName="bg-amber-50 text-amber-800"
                description={
                  <>
                    設備・特徴・マップなどで
                    <br />
                    しっかり確認
                  </>
                }
              />

              <FeatureCard
                title="レビュー"
                icon={<StarIcon className="h-5 w-5" />}
                iconClassName="bg-yellow-50 text-yellow-700"
                description={
                  <>
                    みんなの口コミを確認
                    <br />
                    自分の口コミを投稿
                  </>
                }
              />

              <FeatureCard
                title="お気に入り"
                icon={<HeartIcon className="h-5 w-5" />}
                iconClassName="bg-rose-50 text-rose-600"
                description={
                  <>
                    気になるスポットを
                    <br />
                    保存して管理
                  </>
                }
              />
            </div>

            {/* CTA */}
            <div className="mt-10 mx-auto w-full max-w-xl text-center">
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:opacity-95"
              >
                無料で始める（新規登録）
              </Link>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/78 px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-white/90"
                >
                  ログイン
                </Link>

                <Link
                  to="/spots"
                  className="inline-flex items-center justify-center rounded-2xl border border-emerald-200/80 bg-white/78 px-6 py-3.5 text-sm font-bold text-emerald-900 shadow-sm transition hover:bg-emerald-50/70"
                >
                  ゲストで見る（スポット一覧へ）
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-base text-slate-700 text-center">
          ※ ゲスト（未ログイン）でもスポット一覧・詳細・レビュー閲覧は可能です。
        </div>
      </div>
    </div>
  );
}
