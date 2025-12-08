// src/pages/SpotDetailPage.tsx

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchSpotDetail } from "../api/spots";
import type { SpotDetail } from "../types";

export default function SpotDetailPage() {
  const { id } = useParams();
  const [spot, setSpot] = useState<SpotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await fetchSpotDetail(Number(id));
        setSpot(data);
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? "スポット詳細の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">読み込み中...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">エラー: {error}</div>
    );
  }

  if (!spot) {
    return (
      <div className="p-6 text-center text-gray-600">
        スポット情報が見つかりませんでした。
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 戻るリンク */}
        <div className="mb-4">
          <Link to="/" className="text-sm text-primary hover:underline">
            ← 一覧に戻る
          </Link>
        </div>

        {/* タイトル & 基本情報 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {spot.name}
          </h1>
          <p className="text-sm text-gray-600 mb-1">{spot.address}</p>
          <p className="text-sm text-gray-600 mb-1">
            エリア：{spot.area}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            カテゴリ：{spot.categoryName}
          </p>
          <p className="text-sm text-gray-600">
            価格帯：{spot.priceType}
          </p>
        </section>

        {/* 詳細情報（メモ系） */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            詳細情報
          </h2>

          <dl className="space-y-2 text-sm text-gray-700">
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">
                対象年齢
              </dt>
              <dd>{spot.targetAge ?? "情報なし"}</dd>
            </div>
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">
                滞在目安
              </dt>
              <dd>{spot.stayingTime ?? "情報なし"}</dd>
            </div>
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">
                駐車場
              </dt>
              <dd>{spot.parkingInfo ?? "情報なし"}</dd>
            </div>
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">
                トイレ
              </dt>
              <dd>{spot.toiletInfo ?? "情報なし"}</dd>
            </div>
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">
                コンビニ
              </dt>
              <dd>{spot.convenienceStore ?? "情報なし"}</dd>
            </div>
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">
                飲食店
              </dt>
              <dd>{spot.restaurantInfo ?? "情報なし"}</dd>
            </div>
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">
                定休日
              </dt>
              <dd>{spot.closedDays ?? "情報なし"}</dd>
            </div>
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">
                備考
              </dt>
              <dd>{spot.notes ?? "特になし"}</dd>
            </div>
          </dl>
        </section>

        {/* 設備情報 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            設備情報
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
            <li>
              オムツ替え：{spot.diaperChanging ? "あり" : "なし"}
            </li>
            <li>ベビーカー：{spot.strollerOk ? "OK" : "NG"}</li>
            <li>遊具：{spot.playground ? "あり" : "なし"}</li>
            <li>アスレチック：{spot.athletics ? "あり" : "なし"}</li>
            <li>水遊び：{spot.waterPlay ? "あり" : "なし"}</li>
            <li>屋内施設：{spot.indoor ? "あり" : "なし"}</li>
          </ul>
        </section>

        {/* リンク系 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            外部リンク
          </h2>
          <div className="flex flex-col gap-2 text-sm">
            {spot.googleMapUrl && (
              <a
                href={spot.googleMapUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline">
                Googleマップで開く
              </a>
            )}
            {spot.officialUrl && (
              <a
                href={spot.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline">
                公式サイトを見る
              </a>
            )}
            {!spot.googleMapUrl && !spot.officialUrl && (
              <p className="text-gray-500">リンク情報は登録されていません。</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
