import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchSpotDetail } from "../api/spots";
import { fetchReviewsBySpotId } from "../api/reviews";
import type { SpotDetail, ReviewListItem } from "../types";

export default function SpotDetailPage() {
  const { id } = useParams();
  
  const [spot, setSpot] = useState<SpotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const spotId = Number(id);

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

  useEffect(() => {
    if (!id) return;

    const spotId = Number(id);

    const loadReviews = async () => {
      try {
        const data = await fetchReviewsBySpotId(spotId);
        setReviews(data);
      } catch (e: any) {
        console.error(e);
        setReviewsError(e.message ?? "レビュー一覧の取得に失敗しました。");
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [id]);

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;
    return d.toLocaleString();
  };  

  // ★表示を星アイコンにする（1〜5）
  const renderStars = (rating: number) => {
    const max = 5;
    const full = Math.max(0, Math.min(max, rating));

    return (
      <div className="flex items-center gap-1" aria-label={`評価 ${full} / 5`}>
        {Array.from({ length: max }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className="h-4 w-4"
            fill={i < full ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M10 1.5l2.6 5.7 6.2.5-4.7 4 1.4 6-5.5-3.2-5.5 3.2 1.4-6-4.7-4 6.2-.5L10 1.5z" />
          </svg>
        ))}
      </div>
    );
  };

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
            <li>アスレチックコース：{spot.athletics ? "あり" : "なし"}</li>
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

        {/* レビュー一覧 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            レビュー
            {!reviewsLoading && !reviewsError && `（${reviews.length}件）`}
          </h2>

          {reviewsLoading && (
            <div className="text-sm text-gray-600">読み込み中...</div>
          )}

          {reviewsError && (
            <div className="text-sm text-red-600">エラー: {reviewsError}</div>
          )}

          {!reviewsLoading && !reviewsError && reviews.length === 0 && (
            <div className="text-sm text-gray-600">レビューはまだありません。</div>
          )}

          {!reviewsLoading && !reviewsError && reviews.length > 0 && (
            <ul className="space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-gray-900">
                      {r.userName}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-yellow-500">
                        {renderStars(r.rating)}
                      </span>
                      <span>{r.rating}/5</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                    {r.reviewText}
                  </div>

                  <div className="text-xs text-gray-500 mt-2">
                    {formatDateTime(r.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

      </main>
    </div>
  );
}
