// src/pages/SpotDetailPage.tsx
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

// ✅ ここがポイント：fetchSpotDetailApi ではなく fetchSpotDetail
import { fetchSpotDetail } from "../api/spots";

import {
  createReview,
  deleteReview,
  fetchReviewsBySpotId,
  updateReview,
} from "../api/reviews";
import { addFavorite, removeFavorite } from "../api/favorites";
import type {
  ChildAgeGroup,
  ReviewCreateRequest,
  ReviewListItem,
  SpotDetail,
} from "../types";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api/client";

// -------------------------
// エラーメッセージ（日本語化）
// -------------------------
function getErrorMessage(e: unknown, fallback: string) {
  if (e instanceof ApiError) {
    const msg = e.message ?? "";

    if (e.errorCode === "AUTHENTICATION_REQUIRED") return "ログインが必要です。";
    if (e.errorCode === "ACCESS_DENIED") return "権限がありません。";
    if (e.errorCode === "VALIDATION_ERROR") return "入力内容を確認してください。";

    // Internal server error をUI用に丸める
    if (e.errorCode === "INTERNAL_ERROR") {
      return "処理に失敗しました。入力内容を確認してください。";
    }
    if (/internal server error/i.test(msg)) {
      return "処理に失敗しました。入力内容を確認してください。";
    }

    return msg || fallback;
  }

  if (e instanceof Error) {
    if (/internal server error/i.test(e.message ?? "")) {
      return "処理に失敗しました。入力内容を確認してください。";
    }
    return e.message || fallback;
  }

  return fallback;
}

// ✅ any を使わずに childAgeGroup を取り出す（ReviewListItem に含まれない場合も考慮）
function getChildAgeGroupFromReview(review: ReviewListItem): unknown {
  return (review as ReviewListItem & { childAgeGroup?: unknown }).childAgeGroup;
}

// ✅ 値揺れ吸収（JUNIOR_HIGH を受けても崩れない + 日本語ラベルも吸収）
function normalizeChildAgeGroup(v: unknown): ChildAgeGroup | "" {
  if (!v) return "";
  const s = String(v).trim();

  // enum
  if (s === "PRESCHOOL") return "PRESCHOOL";
  if (s === "ELE_LOW") return "ELE_LOW";
  if (s === "ELE_HIGH") return "ELE_HIGH";
  if (s === "JUNIOR_HIGH_PLUS") return "JUNIOR_HIGH_PLUS";
  if (s === "JUNIOR_HIGH") return "JUNIOR_HIGH_PLUS"; // 値揺れ

  // 日本語ラベル（過去実装差の吸収）
  if (s === "未就学児") return "PRESCHOOL";
  if (s === "小学校低学年") return "ELE_LOW";
  if (s === "小学校高学年") return "ELE_HIGH";
  if (s === "中学生以上") return "JUNIOR_HIGH_PLUS";

  return "";
}

function childAgeLabel(v: unknown): string {
  const n = normalizeChildAgeGroup(v);
  if (n === "PRESCHOOL") return "未就学児";
  if (n === "ELE_LOW") return "小学校低学年";
  if (n === "ELE_HIGH") return "小学校高学年";
  if (n === "JUNIOR_HIGH_PLUS") return "中学生以上";
  return "";
}

function formatDateTimeJa(isoLike: string | undefined | null): string {
  if (!isoLike) return "";
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return String(isoLike);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function renderStars(rating: number): string {
  const n = Math.max(0, Math.min(5, Math.round(rating)));
  return "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
}

export default function SpotDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const [spot, setSpot] = useState<SpotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [spotError, setSpotError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  // お気に入り
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  // モーダル
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  const [formRating, setFormRating] = useState<number>(0);
  const [formChildAgeGroup, setFormChildAgeGroup] = useState<ChildAgeGroup | "">("");
  const [formReviewText, setFormReviewText] = useState("");

  const [formRatingCost, setFormRatingCost] = useState("");
  const [formCrowdLevel, setFormCrowdLevel] = useState("");
  const [formToiletCleanliness, setFormToiletCleanliness] = useState("");
  const [formStrollerEase, setFormStrollerEase] = useState("");
  const [formCostTotal, setFormCostTotal] = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const isAuthed = !!auth.token && !!auth.user;
  const user = auth.user;

  const childAgeGroupOptions = useMemo(
    () => [
      { value: "PRESCHOOL" as const, label: "未就学児" },
      { value: "ELE_LOW" as const, label: "小学校低学年" },
      { value: "ELE_HIGH" as const, label: "小学校高学年" },
      { value: "JUNIOR_HIGH_PLUS" as const, label: "中学生以上" },
    ],
    []
  );

  const toNullableNumber = (v: string): number | null => {
    const t = v.trim();
    if (t === "") return null;
    const n = Number(t);
    return Number.isNaN(n) ? null : n;
  };

  const goLogin = () => {
    navigate("/login", { state: { from: location.pathname } });
  };

  const fetchSpot = async () => {
    if (!id) return;
    setLoading(true);
    setSpotError(null);

    try {
      const data = await fetchSpotDetail(Number(id));
      setSpot(data);
    } catch (e: unknown) {
      console.error(e);
      setSpotError(getErrorMessage(e, "スポット詳細の取得に失敗しました。"));
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    setReviewsError(null);

    try {
      const data = await fetchReviewsBySpotId(Number(id));

      // ✅ backend には isMine が無い想定なので、フロントで判定
      const meId = auth.user?.id;
      const withMine = (data ?? []).map((r) => ({
        ...r,
        isMine: meId != null && r.userId === meId,
      }));

      setReviews(withMine);
    } catch (e: unknown) {
      console.error(e);
      setReviewsError(getErrorMessage(e, "レビュー一覧の取得に失敗しました。"));
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    void fetchSpot();
    void fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const resetReviewForm = () => {
    setEditingReviewId(null);
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
    if (!isAuthed) {
      goLogin();
      return;
    }
    resetReviewForm();
    setIsReviewModalOpen(true);
  };

  const openEditReviewModal = (review: ReviewListItem) => {
    if (!isAuthed) {
      goLogin();
      return;
    }
    if (!user || !review.isMine) return;

    setEditingReviewId(review.id);

    setFormRating(review.rating ?? 0);
    setFormReviewText(review.reviewText ?? "");

    // ✅ 指摘対応：「子どもの年齢帯」が初期選択されるようにする（値揺れ吸収）
    setFormChildAgeGroup(normalizeChildAgeGroup(getChildAgeGroupFromReview(review)));

    setFormRatingCost(review.ratingCost == null ? "" : String(review.ratingCost));
    setFormCrowdLevel(review.crowdLevel == null ? "" : String(review.crowdLevel));
    setFormToiletCleanliness(review.toiletCleanliness == null ? "" : String(review.toiletCleanliness));
    setFormStrollerEase(review.strollerEase == null ? "" : String(review.strollerEase));
    setFormCostTotal(review.costTotal == null ? "" : String(review.costTotal));

    setSubmitError(null);
    setSubmitSuccess(null);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!id) return;
    if (!isAuthed) {
      goLogin();
      return;
    }

    // ✅ 必須チェック
    if (formRating < 1 || formRating > 5) {
      setSubmitError("総合評価を選択してください。");
      return;
    }
    if (!formChildAgeGroup) {
      setSubmitError("子どもの年齢帯を選択してください。");
      return;
    }
    if (!formReviewText.trim()) {
      setSubmitError("レビュー本文を入力してください。");
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

      const spotId = Number(id);

      if (editingReviewId) {
        await updateReview(spotId, editingReviewId, body);
        setSubmitSuccess("レビューを更新しました。");
      } else {
        await createReview(spotId, body);
        setSubmitSuccess("レビューを投稿しました。");
      }

      await fetchReviews();
      setIsReviewModalOpen(false);
      resetReviewForm();
    } catch (e: unknown) {
      console.error(e);
      setSubmitError(getErrorMessage(e, "送信に失敗しました。"));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!id) return;
    if (!isAuthed) {
      goLogin();
      return;
    }

    // ✅ 指摘対応：confirm を挟む（バックエンド修正不要）
    const ok = window.confirm("本当に削除しますか？");
    if (!ok) return;

    try {
      await deleteReview(Number(id), reviewId);
      await fetchReviews();
    } catch (e: unknown) {
      console.error(e);
      alert(getErrorMessage(e, "削除に失敗しました。"));
    }
  };

  const toggleFavorite = async () => {
    if (!spot) return;

    setFavoriteError(null);

    if (!isAuthed) {
      goLogin();
      return;
    }

    try {
      if (spot.isFavorite) {
        await removeFavorite(spot.id);
        setSpot((prev) => (prev ? { ...prev, isFavorite: false } : prev));
      } else {
        await addFavorite(spot.id);
        setSpot((prev) => (prev ? { ...prev, isFavorite: true } : prev));
      }
    } catch (e: unknown) {
      console.error(e);
      setFavoriteError(getErrorMessage(e, "お気に入り更新に失敗しました。"));
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-10">読み込み中...</div>;
  }

  if (spotError) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {spotError}
        </div>
        <div className="mt-4">
          <Link to="/spots" className="font-bold text-emerald-700 hover:underline">
            ← スポット一覧へ戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!spot) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Link to="/spots" className="font-bold text-emerald-700 hover:underline">
          ← スポット一覧へ戻る
        </Link>

        <button
          type="button"
          onClick={toggleFavorite}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          {spot.isFavorite ? "♥ お気に入り解除" : "♡ お気に入り"}
        </button>
      </div>

      {favoriteError && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {favoriteError}
        </div>
      )}

      {/* ------- スポット詳細 ------- */}
      <div className="mt-6 rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <div className="px-6 py-5 border-b border-emerald-50">
          <div className="text-2xl font-extrabold text-slate-900">{spot.name}</div>
          <div className="mt-2 text-sm text-slate-600">{spot.address}</div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              {spot.categoryName}
            </span>

            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
              エリア：{spot.area}
            </span>

            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
              価格帯：{spot.priceType}
            </span>

            {spot.targetAge && (
              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                対象年齢：{spot.targetAge}
              </span>
            )}

            {spot.stayingTime && (
              <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                滞在目安：{spot.stayingTime}
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-extrabold text-slate-900">設備・特徴</div>

              <div className="mt-3 flex flex-wrap gap-2">
                {spot.diaperChanging && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                    おむつ交換台
                  </span>
                )}
                {spot.strollerOk && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                    ベビーカーOK
                  </span>
                )}
                {spot.playground && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                    遊具
                  </span>
                )}
                {spot.athletics && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                    アスレチック
                  </span>
                )}
                {spot.waterPlay && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                    水遊び
                  </span>
                )}
                {spot.indoor && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                    屋内
                  </span>
                )}

                {!spot.diaperChanging &&
                  !spot.strollerOk &&
                  !spot.playground &&
                  !spot.athletics &&
                  !spot.waterPlay &&
                  !spot.indoor && (
                    <div className="text-sm text-slate-500">
                      登録されている設備情報はありません。
                    </div>
                  )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-extrabold text-slate-900">詳細情報</div>

              <dl className="mt-3 space-y-2 text-sm">
                {spot.parkingInfo && (
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 font-bold text-slate-700">駐車場</dt>
                    <dd className="text-slate-700">{spot.parkingInfo}</dd>
                  </div>
                )}

                {spot.toiletInfo && (
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 font-bold text-slate-700">トイレ</dt>
                    <dd className="text-slate-700">{spot.toiletInfo}</dd>
                  </div>
                )}

                {spot.convenienceStore && (
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 font-bold text-slate-700">コンビニ</dt>
                    <dd className="text-slate-700">{spot.convenienceStore}</dd>
                  </div>
                )}

                {spot.restaurantInfo && (
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 font-bold text-slate-700">飲食</dt>
                    <dd className="text-slate-700">{spot.restaurantInfo}</dd>
                  </div>
                )}

                {spot.closedDays && (
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 font-bold text-slate-700">定休日</dt>
                    <dd className="text-slate-700">{spot.closedDays}</dd>
                  </div>
                )}

                {spot.notes && (
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 font-bold text-slate-700">備考</dt>
                    <dd className="text-slate-700">{spot.notes}</dd>
                  </div>
                )}

                {!spot.parkingInfo &&
                  !spot.toiletInfo &&
                  !spot.convenienceStore &&
                  !spot.restaurantInfo &&
                  !spot.closedDays &&
                  !spot.notes && (
                    <div className="text-sm text-slate-500">
                      登録されている詳細情報はありません。
                    </div>
                  )}
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                {spot.googleMapUrl && (
                  <a
                    href={spot.googleMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Googleマップ
                  </a>
                )}

                {spot.officialUrl && (
                  <a
                    href={spot.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    公式サイト
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------- レビュー ------- */}
      <div className="mt-6 rounded-2xl border border-emerald-100 bg-white shadow-sm">
        <div className="px-6 py-5 border-b border-emerald-50 flex items-center justify-between">
          <div className="text-lg font-extrabold text-slate-900">レビュー</div>

          <button
            type="button"
            onClick={openReviewModal}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-orange-600"
          >
            レビューを投稿
          </button>
        </div>

        <div className="px-6 py-5">
          {reviewsLoading ? (
            <div className="mt-4 text-sm text-slate-500">読み込み中...</div>
          ) : reviewsError ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {reviewsError}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {reviews.map((r) => {
                const ageLabel = childAgeLabel(getChildAgeGroupFromReview(r));

                return (
                  <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <div className="font-extrabold text-slate-900">{r.userName}</div>

                          {/* ✅ 指摘対応：星の横に「総合評価」を表示 */}
                          <div className="text-sm font-bold text-amber-600">
                            総合評価：{renderStars(r.rating)}
                          </div>

                          <div className="text-xs text-slate-500">{formatDateTimeJa(r.createdAt)}</div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {/* ✅ 指摘対応：年齢帯が空欄になっても変換できるものは表示 */}
                          {ageLabel && (
                            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                              子どもの年齢帯：{ageLabel}
                            </span>
                          )}

                          {/* ✅ 表示ラベル変更 */}
                          {r.costTotal != null && (
                            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                              かかった合計金額：{r.costTotal}円
                            </span>
                          )}
                          {r.ratingCost != null && (
                            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                              コスパ評価：{r.ratingCost}
                            </span>
                          )}
                          {r.crowdLevel != null && (
                            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                              混雑具合：{r.crowdLevel}
                            </span>
                          )}
                          {r.toiletCleanliness != null && (
                            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                              トイレ清潔度：{r.toiletCleanliness}
                            </span>
                          )}
                          {r.strollerEase != null && (
                            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                              ベビーカーの使いやすさ：{r.strollerEase}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                          {r.reviewText}
                        </div>
                      </div>

                      {r.isMine && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditReviewModal(r)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            編集
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteReview(r.id)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100"
                          >
                            削除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ------- レビュー投稿/編集モーダル ------- */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-orange-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-orange-100 px-6 py-5">
              <div>
                <div className="text-lg font-bold text-slate-900">
                  {editingReviewId ? "レビューを編集する" : "レビューを投稿する"}
                </div>
                <div className="mt-1 text-xs text-slate-500">※ 必須：総合評価・年齢帯・本文</div>
              </div>

              <button
                type="button"
                className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
                onClick={() => setIsReviewModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {submitSuccess}
                </div>
              )}

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-700">総合評価（必須）</div>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={formRating}
                  onChange={(e) => setFormRating(Number(e.target.value))}
                >
                  <option value={0}>選択してください</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-700">子どもの年齢帯（必須）</div>
                <select
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={formChildAgeGroup}
                  onChange={(e) => setFormChildAgeGroup(e.target.value as ChildAgeGroup | "")}
                >
                  <option value="">選択してください</option>
                  {childAgeGroupOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-700">レビュー本文（必須）</div>
                <textarea
                  className="min-h-30 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={formReviewText}
                  onChange={(e) => setFormReviewText(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-sm font-semibold text-slate-700">コスパ（1〜5）</div>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={formRatingCost}
                    onChange={(e) => setFormRatingCost(e.target.value)}
                  >
                    <option value="">未入力</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={String(n)}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-1 text-sm font-semibold text-slate-700">混雑の具合（1〜5）</div>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={formCrowdLevel}
                    onChange={(e) => setFormCrowdLevel(e.target.value)}
                  >
                    <option value="">未入力</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={String(n)}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-1 text-sm font-semibold text-slate-700">トイレの清潔度（1〜5）</div>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={formToiletCleanliness}
                    onChange={(e) => setFormToiletCleanliness(e.target.value)}
                  >
                    <option value="">未入力</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={String(n)}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-1 text-sm font-semibold text-slate-700">ベビーカーの使いやすさ（1〜5）</div>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={formStrollerEase}
                    onChange={(e) => setFormStrollerEase(e.target.value)}
                  >
                    <option value="">未入力</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={String(n)}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-1 text-sm font-semibold text-slate-700">かかった合計金額（任意）</div>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={formCostTotal}
                  onChange={(e) => setFormCostTotal(e.target.value)}
                  placeholder="数字のみ（未入力なら送信しません）"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-5">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                onClick={() => setIsReviewModalOpen(false)}
                disabled={submitLoading}
              >
                キャンセル
              </button>

              <button
                type="button"
                className="rounded-xl bg-orange-500 px-6 py-2 text-sm font-extrabold text-white hover:bg-orange-600 disabled:opacity-60"
                onClick={handleSubmitReview}
                disabled={submitLoading}
              >
                {editingReviewId ? "更新" : "投稿"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
