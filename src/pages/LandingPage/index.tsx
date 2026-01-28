// src/pages/LandingPage/index.tsx
import { Link, useNavigate } from "react-router-dom";
import { HeartIcon, MapIcon, SearchIcon, StarIcon } from "../../components/Icons";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-9 md:p-12 shadow-sm backdrop-blur">
          {/* 背景の“やわらかい雰囲気”だけ追加（やりすぎない） */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-28 -top-20 h-80 w-80 rounded-full bg-amber-200/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -bottom-28 h-72 w-72 rounded-full bg-emerald-200/20 blur-3xl"
          />

          <div className="relative">
            {/* ✅ 全体を中央寄せ（文字も中央） */}
            <div className="mx-auto max-w-2xl text-center">
              {/* ✅「家族みんなで楽しくお出かけ！」の文字サイズを少し大きく */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white px-3 py-1 text-sm font-semibold text-emerald-900 shadow-sm">
                <span aria-hidden>✨</span>
                家族みんなで楽しくお出かけ！
              </div>

              {/* ✅ Famigo（ファミゴー）の文字色を緑に */}
              <h1 className="mt-5 text-3xl md:text-5xl font-extrabold tracking-tight text-emerald-700">
                Famigo（ファミゴー）
              </h1>

              {/* ✅ 2文の間で改行 */}
              <p className="mt-5 text-slate-700 leading-relaxed md:text-lg">
                お金をかけずに、子どもとたっぷり遊べる場所が見つかるサービスです。
                <br />
                公園・アスレチック・水遊びなど、家族で行けるスポットをサクッと検索！
              </p>

              {/* “検索バー風”の導線（クリックで一覧へ） */}
              <button
                type="button"
                onClick={() => navigate("/spots")}
                className="mt-7 w-full max-w-xl mx-auto rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-left shadow-sm backdrop-blur transition hover:bg-white"
              >
                <div className="flex items-center gap-3 text-slate-500">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <SearchIcon className="h-5 w-5" />
                  </span>
                  <span className="text-sm md:text-base">エリア・カテゴリで探す</span>
                </div>
              </button>
            </div>

            {/* ✅ 全体的に縦スペースを増やす（検索バーとカードの間） */}
            <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-4">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <SearchIcon className="h-5 w-5" />
                  </span>
                  <div className="font-extrabold text-slate-900 text-xl">一覧検索</div>
                </div>
                {/* ✅ 文言差し替え */}
                <div className="mt-3 text-sm text-slate-600 leading-relaxed">
                  エリア/カテゴリ/予算などでお出かけスポットを検索
                </div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                    <MapIcon className="h-5 w-5" />
                  </span>
                  <div className="font-extrabold text-slate-900 text-xl">詳細</div>
                </div>
                {/* ✅ 文言差し替え */}
                <div className="mt-3 text-sm text-slate-600 leading-relaxed">
                  設備・特徴・マップなどで詳細を確認
                </div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700">
                    <StarIcon className="h-5 w-5" />
                  </span>
                  <div className="font-extrabold text-slate-900 text-xl">レビュー</div>
                </div>

                {/* ✅ 「みんなの口コミを確認」(改行して)「自分の口コミを投稿」 */}
                <div className="mt-3 text-sm text-slate-600 leading-relaxed">
                  みんなの口コミを確認
                  <br />
                  自分の口コミを投稿
                </div>
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <HeartIcon className="h-5 w-5" />
                  </span>
                  <div className="font-extrabold text-slate-900 text-xl">お気に入り</div>
                </div>
                <div className="mt-3 text-sm text-slate-600 leading-relaxed">
                  気になるスポットを
                  <br />
                  保存して管理
                </div>
              </div>
            </div>

            {/* ✅ CTA：2段構成＋中央配置（縦ゆったり） */}
            <div className="mt-10 mx-auto w-full max-w-xl text-center">
              {/* 1段目：無料で始める（新規登録） */}
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:opacity-95"
              >
                無料で始める（新規登録）
              </Link>

              {/* 2段目：ログイン / ゲスト */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  ログイン
                </Link>

                <Link
                  to="/spots"
                  className="inline-flex items-center justify-center rounded-2xl border border-emerald-200/80 bg-white px-6 py-3.5 text-sm font-bold text-emerald-900 shadow-sm transition hover:bg-emerald-50"
                >
                  ゲストで見る（スポット一覧へ）
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ 注意文：文字を少し大きく＋中央配置＋少し余白 */}
        <div className="mt-9 text-base text-slate-600 text-center">
          ※ ゲスト（未ログイン）でもスポット一覧・詳細・レビュー閲覧は可能です。
        </div>
      </div>
    </div>
  );
}
