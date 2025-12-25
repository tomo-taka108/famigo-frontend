import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { fetchSpotDetail } from "../api/spots";
import { createReview, fetchReviewsBySpotId } from "../api/reviews";
import { addFavorite, removeFavorite } from "../api/favorites";
import type {
  ChildAgeGroup,
  ReviewCreateRequest,
  ReviewListItem,
  SpotDetail,
} from "../types";

function getErrorMessage(e: unknown, fallback: string) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return fallback;
}

export default function SpotDetailPage() {
  const { id } = useParams();

  const [spot, setSpot] = useState<SpotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [showAllReviews, setShowAllReviews] = useState(false);
  const INITIAL_REVIEW_COUNT = 3;

  // レビュー投稿フォーム（モーダル）
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [formRating, setFormRating] = useState<number>(0);
  const [formChildAgeGroup, setFormChildAgeGroup] = useState<
    ChildAgeGroup | ""
  >("");
  const [formReviewText, setFormReviewText] = useState<string>("");

  const [formRatingCost, setFormRatingCost] = useState<string>("");
  const [formCrowdLevel, setFormCrowdLevel] = useState<string>("");
  const [formToiletCleanliness, setFormToiletCleanliness] = useState<string>(
    ""
  );
  const [formStrollerEase, setFormStrollerEase] = useState<string>("");
  const [formCostTotal, setFormCostTotal] = useState<string>("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // お気に入り更新用
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  const childAgeGroupOptions = useMemo(
    () => [
      { value: "PRESCHOOL" as const, label: "未就学児" },
      { value: "ELE_LOW" as const, label: "小学校低学年" },
      { value: "ELE_HIGH" as const, label: "小学校高学年" },
      { value: "JUNIOR_HIGH_PLUS" as const, label: "中学生以上" },
    ],
    []
  );

  const ratingOptions = useMemo(() => [1, 2, 3, 4, 5], []);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await fetchSpotDetail(Number(id));
        setSpot(data);
      } catch (e: unknown) {
        console.error(e);
        setError(getErrorMessage(e, "スポット詳細の取得に失敗しました。"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const reloadReviews = async (spotId: number) => {
    try {
      const data = await fetchReviewsBySpotId(spotId);
      setReviews(data);
      setReviewsError(null);
    } catch (e: unknown) {
      console.error(e);
      setReviewsError(getErrorMessage(e, "レビュー一覧の取得に失敗しました。"));
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const spotId = Number(id);

    const loadReviews = async () => {
      setReviewsLoading(true);
      await reloadReviews(spotId);
    };

    loadReviews();
  }, [id]);

  // モーダル表示中：Escキーで閉じる
  useEffect(() => {
    if (!isReviewModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsReviewModalOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isReviewModalOpen]);

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;
    return d.toLocaleString();
  };

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

  const renderClickableStars = (value: number, onChange: (v: number) => void) => {
    const max = 5;
    const full = Math.max(0, Math.min(max, value));

    return (
      <div className="flex items-center gap-1" aria-label={`評価 ${full} / 5`}>
        {Array.from({ length: max }).map((_, i) => {
          const starValue = i + 1;
          const filled = i < full;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(starValue)}
              className="p-0.5"
              aria-label={`${starValue}点`}
            >
              <svg
                viewBox="0 0 20 20"
                className="h-6 w-6"
                fill={filled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M10 1.5l2.6 5.7 6.2.5-4.7 4 1.4 6-5.5-3.2-5.5 3.2 1.4-6-4.7-4 6.2-.5L10 1.5z" />
              </svg>
            </button>
          );
        })}
      </div>
    );
  };

  const hasMoreReviews = reviews.length > INITIAL_REVIEW_COUNT;
  const visibleReviews = showAllReviews
    ? reviews
    : reviews.slice(0, INITIAL_REVIEW_COUNT);

  const toNullableNumber = (v: string): number | null => {
    const trimmed = v.trim();
    if (trimmed === "") return null;
    const n = Number(trimmed);
    if (Number.isNaN(n)) return null;
    return n;
  };

  const resetReviewForm = () => {
    setFormRating(0);
    setFormChildAgeGroup("");
    setFormReviewText("");
    setFormRatingCost("");
    setFormCrowdLevel("");
    setFormToiletCleanliness("");
    setFormStrollerEase("");
    setFormCostTotal("");
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const openReviewModal = () => {
    resetReviewForm();
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!id) return;

    const spotId = Number(id);

    if (formRating < 1 || formRating > 5) {
      setSubmitError("総合評価（★）は1〜5で選択してください。");
      setSubmitSuccess(null);
      return;
    }

    if (formChildAgeGroup === "") {
      setSubmitError("子どもの年齢帯は必須です。選択してください。");
      setSubmitSuccess(null);
      return;
    }

    if (formReviewText.trim() === "") {
      setSubmitError("レビュー本文は必須です。");
      setSubmitSuccess(null);
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const body: ReviewCreateRequest = {
        childAgeGroup: formChildAgeGroup,
        rating: formRating,
        ratingCost: toNullableNumber(formRatingCost),
        crowdLevel: toNullableNumber(formCrowdLevel),
        toiletCleanliness: toNullableNumber(formToiletCleanliness),
        strollerEase: toNullableNumber(formStrollerEase),
        reviewText: formReviewText.trim(),
        costTotal: toNullableNumber(formCostTotal),
      };

      await createReview(spotId, body);

      setSubmitSuccess("レビューを投稿しました。");
      setShowAllReviews(true);

      setIsReviewModalOpen(false);
      setReviewsLoading(true);
      await reloadReviews(spotId);
    } catch (e: unknown) {
      console.error(e);
      setSubmitError(getErrorMessage(e, "レビュー投稿に失敗しました。"));
    } finally {
      setSubmitLoading(false);
    }
  };

  // 詳細ページのお気に入り切替
  const toggleFavorite = async () => {
    if (!spot) return;

    const spotId = spot.id;
    const next = !spot.isFavorite;

    // 楽観更新
    setSpot({ ...spot, isFavorite: next });
    setFavoriteError(null);

    try {
      if (next) {
        await addFavorite(spotId);
      } else {
        await removeFavorite(spotId);
      }
    } catch (e: unknown) {
      // ロールバック
      setSpot({ ...spot, isFavorite: !next });
      setFavoriteError(getErrorMessage(e, "お気に入り更新に失敗しました。"));
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-slate-600">読み込み中...</div>;
  }

  if (error) {
    return <div className="py-10 text-center text-red-600">エラー: {error}</div>;
  }

  if (!spot) {
    return (
      <div className="py-10 text-center text-slate-600">
        スポット情報が見つかりませんでした。
      </div>
    );
  }

  const cardBase = "bg-white rounded-2xl border border-emerald-100 shadow-sm";
  const cardHeader =
    "px-6 py-5 border-b border-emerald-50 flex items-center justify-between";
  const cardBody = "px-6 py-5";

  const labelClass = "text-[11px] tracking-wide text-slate-500";
  const valueClass = "mt-1 text-[15px] font-semibold text-slate-900";

  const itemCard =
    "rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-white transition-colors";

  const IconMap = (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={props.className}>
      <path
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );

  const IconTag = (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={props.className}>
      <path
        d="M20 13l-7 7a2 2 0 0 1-2.8 0L3 12V4h8l9 9Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7.5 7.5h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );

  const IconWallet = (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={props.className}>
      <path d="M3 7h18v14H3V7Z" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 9V6a2 2 0 0 1 2-2h14"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M17 14h4v4h-4a2 2 0 0 1 0-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );

  const IconUsers = (props: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={props.className}>
      <path
        d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );

  const badgeBase =
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border";

  const favoriteBtnBase =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2";

  return (
    <div className="py-6">
      <div className="mx-auto w-full max-w-5xl">
        {/* 戻る + お気に入り */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="
              inline-flex items-center gap-2
              rounded-xl
              border border-orange-200
              bg-orange-50
              px-4 py-2.5
              text-sm font-semibold text-orange-700
              shadow-sm
              hover:bg-orange-100
              transition
            "
          >
            ← 一覧に戻る
          </Link>

          <button
            type="button"
            onClick={toggleFavorite}
            className={
              spot.isFavorite
                ? `${favoriteBtnBase} border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 focus:ring-rose-200`
                : `${favoriteBtnBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200`
            }
            aria-label={spot.isFavorite ? "お気に入り解除" : "お気に入り登録"}
          >
            <span className="text-lg">{spot.isFavorite ? "❤️" : "🤍"}</span>
            {spot.isFavorite ? "お気に入り中" : "お気に入り"}
          </button>
        </div>

        {favoriteError && (
          <div className="mb-4 text-sm text-red-600">エラー: {favoriteError}</div>
        )}

        {/* タイトル */}
        <section className={`${cardBase} mb-4`}>
          <div className={cardBody}>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
              {spot.name}
            </h1>
            <p className="text-sm text-slate-600">{spot.address}</p>
          </div>
        </section>

        {/* 要点（アイコン＋色付きバッジ） */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className={`${cardBase} rounded-xl`}>
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-slate-900">エリア</div>
                <span className={`${badgeBase} border-sky-200 bg-sky-50 text-sky-800`}>
                  <IconMap className="h-4 w-4" />
                  地域
                </span>
              </div>
              <div className="mt-2 text-[15px] font-semibold text-slate-900">
                {spot.area}
              </div>
              <div className="mt-1 text-xs text-slate-500">場所の目安</div>
            </div>
          </div>

          <div className={`${cardBase} rounded-xl`}>
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-slate-900">カテゴリ</div>
                <span className={`${badgeBase} border-emerald-200 bg-emerald-50 text-emerald-800`}>
                  <IconTag className="h-4 w-4" />
                  種別
                </span>
              </div>
              <div className="mt-2 text-[15px] font-semibold text-slate-900">
                {spot.categoryName}
              </div>
              <div className="mt-1 text-xs text-slate-500">どんなスポット？</div>
            </div>
          </div>

          <div className={`${cardBase} rounded-xl`}>
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-slate-900">予算</div>
                <span className={`${badgeBase} border-orange-200 bg-orange-50 text-orange-800`}>
                  <IconWallet className="h-4 w-4" />
                  コスト
                </span>
              </div>
              <div className="mt-2 text-[15px] font-semibold text-slate-900">
                {spot.priceType}
              </div>
              <div className="mt-1 text-xs text-slate-500">お出かけ費用</div>
            </div>
          </div>

          <div className={`${cardBase} rounded-xl`}>
            <div className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-slate-900">対象年齢</div>
                <span className={`${badgeBase} border-violet-200 bg-violet-50 text-violet-800`}>
                  <IconUsers className="h-4 w-4" />
                  年齢
                </span>
              </div>
              <div className="mt-2 text-[15px] font-semibold text-slate-900">
                {spot.targetAge ?? "情報なし"}
              </div>
              <div className="mt-1 text-xs text-slate-500">子ども向け目安</div>
            </div>
          </div>
        </section>

        {/* 詳細情報 */}
        <section className={`${cardBase} mb-6`}>
          <div className={cardHeader}>
            <h2 className="text-lg font-bold text-slate-900">詳細情報</h2>
            <span className="text-xs text-slate-500">行く前に確認</span>
          </div>

          <div className={cardBody}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className={itemCard}>
                <div className={labelClass}>滞在目安</div>
                <div className={valueClass}>{spot.stayingTime ?? "情報なし"}</div>
              </div>

              <div className={itemCard}>
                <div className={labelClass}>駐車場</div>
                <div className={valueClass}>{spot.parkingInfo ?? "情報なし"}</div>
              </div>

              <div className={itemCard}>
                <div className={labelClass}>トイレ</div>
                <div className={valueClass}>{spot.toiletInfo ?? "情報なし"}</div>
              </div>

              <div className={itemCard}>
                <div className={labelClass}>コンビニ</div>
                <div className={valueClass}>{spot.convenienceStore ?? "情報なし"}</div>
              </div>

              <div className={itemCard}>
                <div className={labelClass}>飲食店</div>
                <div className={valueClass}>{spot.restaurantInfo ?? "情報なし"}</div>
              </div>

              <div className={itemCard}>
                <div className={labelClass}>定休日</div>
                <div className={valueClass}>{spot.closedDays ?? "情報なし"}</div>
              </div>

              <div className={`${itemCard} md:col-span-2 lg:col-span-3`}>
                <div className={labelClass}>備考</div>
                <div className={`${valueClass} whitespace-pre-wrap`}>
                  {spot.notes ?? "特になし"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 設備情報 */}
        <section className={`${cardBase} mb-6`}>
          <div className={cardHeader}>
            <h2 className="text-lg font-bold text-slate-900">設備情報</h2>
            <span className="text-xs text-slate-500">子連れ視点</span>
          </div>

          <div className={cardBody}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={itemCard}>
                <div className={labelClass}>オムツ替え</div>
                <div className={valueClass}>{spot.diaperChanging ? "あり" : "なし"}</div>
              </div>

              <div className={itemCard}>
                <div className={labelClass}>ベビーカー</div>
                <div className={valueClass}>{spot.strollerOk ? "OK" : "NG"}</div>
              </div>

              <div className={itemCard}>
                <div className={labelClass}>遊具</div>
                <div className={valueClass}>{spot.playground ? "あり" : "なし"}</div>
              </div>

              <div className={itemCard}>
                <div className={labelClass}>アスレチックコース</div>
                <div className={valueClass}>{spot.athletics ? "あり" : "なし"}</div>
              </div>

              <div className={itemCard}>
                <div className={labelClass}>水遊び</div>
                <div className={valueClass}>{spot.waterPlay ? "あり" : "なし"}</div>
              </div>

              <div className={itemCard}>
                <div className={labelClass}>屋内施設</div>
                <div className={valueClass}>{spot.indoor ? "あり" : "なし"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* 外部リンク */}
        <section className={`${cardBase} mb-6`}>
          <div className={cardHeader}>
            <h2 className="text-lg font-bold text-slate-900">外部リンク</h2>
            <span className="text-xs text-slate-500">地図 / 公式</span>
          </div>

          <div className={cardBody}>
            <div className="flex flex-col sm:flex-row gap-3">
              {spot.googleMapUrl && (
                <a
                  href={spot.googleMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    inline-flex items-center justify-center gap-2
                    rounded-xl
                    border border-sky-200
                    bg-sky-50
                    px-4 py-3
                    text-sm font-semibold text-sky-800
                    hover:bg-sky-100
                    transition-colors
                  "
                >
                  📍 Googleマップで開く
                </a>
              )}

              {spot.officialUrl && (
                <a
                  href={spot.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    inline-flex items-center justify-center gap-2
                    rounded-xl
                    border border-slate-200
                    bg-white
                    px-4 py-3
                    text-sm font-semibold text-slate-700
                    hover:bg-slate-50
                    transition-colors
                  "
                >
                  🔗 公式サイトを見る
                </a>
              )}

              {!spot.googleMapUrl && !spot.officialUrl && (
                <p className="text-slate-600 text-sm">リンク情報は登録されていません。</p>
              )}
            </div>
          </div>
        </section>

        {/* レビュー */}
        <section className={`${cardBase}`}>
          <div className={cardHeader}>
            <h2 className="text-lg font-bold text-slate-900">
              レビュー
              {!reviewsLoading && !reviewsError && `（${reviews.length}件）`}
            </h2>

            <button
              type="button"
              onClick={openReviewModal}
              className="
                rounded-xl
                bg-orange-500
                px-4 py-2
                text-sm font-semibold text-white
                shadow-sm
                transition
                hover:bg-orange-600
                focus:outline-none focus:ring-2 focus:ring-orange-200
              "
            >
              レビューを投稿する
            </button>
          </div>

          <div className={cardBody}>
            {reviewsLoading && <div className="text-sm text-slate-600">読み込み中...</div>}
            {reviewsError && <div className="text-sm text-red-600">エラー: {reviewsError}</div>}

            {!reviewsLoading && !reviewsError && reviews.length === 0 && (
              <div className="text-sm text-slate-600">
                まだレビューがありません。最初のレビューを書いてみませんか？
              </div>
            )}

            {!reviewsLoading && !reviewsError && reviews.length > 0 && (
              <>
                <ul className="space-y-4">
                  {visibleReviews.map((r) => (
                    <li
                      key={r.id}
                      className="border border-slate-200 rounded-2xl p-4 bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900">{r.userName}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {formatDateTime(r.createdAt)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="text-yellow-500">{renderStars(r.rating)}</span>
                          <span className="font-semibold">{r.rating}/5</span>
                        </div>
                      </div>

                      <div className="text-sm text-slate-700 mt-3 whitespace-pre-wrap leading-relaxed">
                        {r.reviewText}
                      </div>
                    </li>
                  ))}
                </ul>

                {hasMoreReviews && !showAllReviews && (
                  <div className="mt-4">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setShowAllReviews(true)}
                    >
                      もっと見る
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {/* レビュー投稿モーダル */}
      {isReviewModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsReviewModalOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-orange-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-orange-100 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-slate-900">レビューを投稿する</div>
                <div className="text-xs text-slate-500 mt-1">
                  ※ 必須：総合評価・年齢帯・本文
                </div>
              </div>

              <button
                type="button"
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
                onClick={() => setIsReviewModalOpen(false)}
                aria-label="閉じる"
                disabled={submitLoading}
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5">
              {submitError && <div className="text-sm text-red-600 mb-3">エラー: {submitError}</div>}
              {submitSuccess && <div className="text-sm text-emerald-700 mb-3">{submitSuccess}</div>}

              <div className="mb-4">
                <div className="text-sm font-semibold text-slate-700 mb-1">
                  総合評価（必須）
                </div>
                <div className="flex items-center gap-3 text-yellow-500">
                  {renderClickableStars(formRating, setFormRating)}
                  <span className="text-sm text-slate-700">
                    {formRating > 0 ? `${formRating}/5` : "未選択"}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-semibold text-slate-700 mb-1">
                  子どもの年齢帯（必須）
                </div>
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  value={formChildAgeGroup}
                  onChange={(e) =>
                    setFormChildAgeGroup(e.target.value as ChildAgeGroup | "")
                  }
                >
                  <option value="">選択してください</option>
                  {childAgeGroupOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <div className="text-sm font-semibold text-slate-700 mb-1">
                  レビュー本文（必須）
                </div>
                <textarea
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm min-h-[120px] bg-white"
                  value={formReviewText}
                  onChange={(e) => setFormReviewText(e.target.value)}
                  placeholder="例：遊具が多くて子どもが楽しめました。トイレもきれいで助かりました。"
                />
              </div>

              <div className="mb-4">
                <div className="text-sm font-semibold text-slate-700 mb-2">詳細評価（任意）</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-slate-600 mb-1">コスパ（1〜5）</div>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                      value={formRatingCost}
                      onChange={(e) => setFormRatingCost(e.target.value)}
                    >
                      <option value="">未入力</option>
                      {ratingOptions.map((n) => (
                        <option key={n} value={String(n)}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="text-xs text-slate-600 mb-1">混雑度（1〜5）</div>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                      value={formCrowdLevel}
                      onChange={(e) => setFormCrowdLevel(e.target.value)}
                    >
                      <option value="">未入力</option>
                      {ratingOptions.map((n) => (
                        <option key={n} value={String(n)}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="text-xs text-slate-600 mb-1">トイレ清潔度（1〜5）</div>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                      value={formToiletCleanliness}
                      onChange={(e) => setFormToiletCleanliness(e.target.value)}
                    >
                      <option value="">未入力</option>
                      {ratingOptions.map((n) => (
                        <option key={n} value={String(n)}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="text-xs text-slate-600 mb-1">ベビーカー（1〜5）</div>
                    <select
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                      value={formStrollerEase}
                      onChange={(e) => setFormStrollerEase(e.target.value)}
                    >
                      <option value="">未入力</option>
                      {ratingOptions.map((n) => (
                        <option key={n} value={String(n)}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <div className="text-sm font-semibold text-slate-700 mb-1">合計金額（任意）</div>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  value={formCostTotal}
                  onChange={(e) => setFormCostTotal(e.target.value)}
                  placeholder="例：1500"
                  inputMode="numeric"
                />
                <div className="text-xs text-slate-600 mt-1">※ 数字のみ（未入力なら送信しません）</div>
              </div>

              {/* ✅ お気に入りエラーはモーダル外だが、ここにも出したいならここで表示OK */}
              {favoriteError && (
                <div className="text-sm text-red-600 mb-3">エラー: {favoriteError}</div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={() => setIsReviewModalOpen(false)}
                  disabled={submitLoading}
                >
                  キャンセル
                </button>

                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 transition-colors shadow-sm"
                  onClick={handleSubmitReview}
                  disabled={submitLoading}
                >
                  {submitLoading ? "送信中..." : "送信"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
