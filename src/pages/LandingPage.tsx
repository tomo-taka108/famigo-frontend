// src/pages/LandingPage.tsx
import { Link } from "react-router-dom";

const FeatureCard = ({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-base font-extrabold text-slate-900">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-slate-600">{desc}</div>
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="py-8 md:py-12">
      {/* Hero */}
      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 md:p-10 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700">
            Famigo（ファミゴー）
            <span className="text-slate-500 font-semibold">家族のおでかけを、もっと気軽に</span>
          </div>

          <h1 className="mt-4 text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            低コストで楽しめる
            <span className="text-emerald-700"> おでかけスポット</span>を、
            さくっと見つけよう
          </h1>

          <p className="mt-4 text-sm md:text-base leading-relaxed text-slate-600">
            Famigoは、家族向けのスポット（公園・動物園・水遊び・屋内施設など）を
            目的や条件で探せるサービスです。レビューやお気に入りで「次の休日」が決まります。
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-emerald-700"
            >
              新規登録
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-bold text-emerald-800 hover:bg-emerald-100"
            >
              ログイン
            </Link>
            <Link
              to="/spots"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              ゲストで見る（スポット一覧へ）
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureCard
          title="検索"
          desc="エリアやカテゴリ、キーワードで絞り込み。家族の条件に合う場所だけを表示。"
          icon={<span className="text-emerald-700 font-extrabold">🔍</span>}
        />
        <FeatureCard
          title="詳細"
          desc="設備情報やGoogleマップ、公式サイトリンクなど、行く前に知りたい情報を整理。"
          icon={<span className="text-emerald-700 font-extrabold">📍</span>}
        />
        <FeatureCard
          title="レビュー / お気に入り"
          desc="レビューで体験を共有。気になるスポットはお気に入りに保存して後から見返せる。"
          icon={<span className="text-emerald-700 font-extrabold">❤️</span>}
        />
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-lg font-extrabold text-slate-900">次のお休み、どこ行く？</div>
            <div className="mt-1 text-sm text-slate-600">
              まずはゲストで一覧を見るだけでもOK。お気に入りやレビューはログイン後に使えます。
            </div>
          </div>
          <Link
            to="/spots"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-extrabold text-white hover:bg-slate-800"
          >
            スポット一覧を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
