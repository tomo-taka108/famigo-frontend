import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { fetchSpotDetail } from "../api/spots";
import { createReview, fetchReviewsBySpotId } from "../api/reviews";
import type {
  SpotDetail,
  ReviewListItem,
  ReviewCreateRequest,
  ChildAgeGroup,
} from "../types";

export default function SpotDetailPage() {
  const { id } = useParams();

  const [spot, setSpot] = useState<SpotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [showAllReviews, setShowAllReviews] = useState(false); // 初期は一部だけ表示する
  const INITIAL_REVIEW_COUNT = 3; // 初期表示件数（必要なら5などに変更）

  // 投稿フォーム状態（必須＋任意）
  const [formRating, setFormRating] = useState<number>(0);

  // childAgeGroup はバックで@NotNullなので必須（未選択は "" で保持して送信前に弾く）
  const [formChildAgeGroup, setFormChildAgeGroup] =
    useState<ChildAgeGroup | "">(""); // （必須）

  const [formReviewText, setFormReviewText] = useState<string>(""); // （必須）

  const [formRatingCost, setFormRatingCost] = useState<string>(""); // （任意：入力は文字列で保持）
  const [formCrowdLevel, setFormCrowdLevel] = useState<string>(""); // （任意）
  const [formToiletCleanliness, setFormToiletCleanliness] =
    useState<string>(""); // （任意）
  const [formStrollerEase, setFormStrollerEase] = useState<string>(""); // （任意）
  const [formCostTotal, setFormCostTotal] = useState<string>(""); // （任意）

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // ChildAgeGroupの表示ラベル（UI用）
  const childAgeGroupOptions = useMemo(
    () => [
      { value: "PRESCHOOL" as const, label: "未就学児" },
      { value: "ELE_LOW" as const, label: "小学校低学年" },
      { value: "ELE_HIGH" as const, label: "小学校高学年" },
      { value: "JUNIOR_HIGH_PLUS" as const, label: "中学生以上" },
    ],
    []
  );

  // 任意評価（1〜5）用の選択肢
  const ratingOptions = useMemo(() => [1, 2, 3, 4, 5], []);

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

  // レビュー再取得を関数化（投稿後も使う）
  const reloadReviews = async (spotId: number) => {
    try {
      const data = await fetchReviewsBySpotId(spotId);
      setReviews(data);
      setReviewsError(null);
    } catch (e: any) {
      console.error(e);
      setReviewsError(e.message ?? "レビュー一覧の取得に失敗しました。");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const spotId = Number(id);

    const loadReviews = async () => {
      setReviewsLoading(true); // 再取得でも使うので明示
      await reloadReviews(spotId);
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

  // 投稿フォーム用の「クリックできる星」
  const renderClickableStars = (
    value: number,
    onChange: (v: number) => void
  ) => {
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
                className="h-5 w-5"
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
    : reviews.slice(0, INITIAL_REVIEW_COUNT); // 表示対象（初期は先頭3件だけ）

  // 任意入力（selectの文字列）→ number|null に変換
  const toNullableNumber = (v: string): number | null => {
    const trimmed = v.trim();
    if (trimmed === "") return null;
    const n = Number(trimmed);
    if (Number.isNaN(n)) return null;
    return n;
  };

  // 投稿処理
  const handleSubmitReview = async () => {
    if (!id) return;

    const spotId = Number(id);

    // 簡易バリデーション（必須）
    if (formRating < 1 || formRating > 5) {
      setSubmitError("総合評価（★）は1〜5で選択してください。");
      setSubmitSuccess(null);
      return;
    }

    // childAgeGroup 必須（バックで@NotNull）
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
        childAgeGroup: formChildAgeGroup, // 必須なので必ず送る
        rating: formRating, // 必須
        ratingCost: toNullableNumber(formRatingCost), // 任意
        crowdLevel: toNullableNumber(formCrowdLevel), // 任意
        toiletCleanliness: toNullableNumber(formToiletCleanliness), // 任意
        strollerEase: toNullableNumber(formStrollerEase), // 任意
        reviewText: formReviewText.trim(), // 必須
        costTotal: toNullableNumber(formCostTotal), // 任意（0以上）
      };

      await createReview(spotId, body);

      // 投稿成功 → フォーム初期化
      setFormRating(0);
      setFormChildAgeGroup(""); // 必須だが、送信後は未選択に戻す
      setFormReviewText("");
      setFormRatingCost("");
      setFormCrowdLevel("");
      setFormToiletCleanliness("");
      setFormStrollerEase("");
      setFormCostTotal("");

      setSubmitSuccess("レビューを投稿しました。");
      setShowAllReviews(true); // 投稿後は全件表示でも良い
      setReviewsLoading(true);
      await reloadReviews(spotId);
    } catch (e: any) {
      console.error(e);
      setSubmitError(e.message ?? "レビュー投稿に失敗しました。");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">読み込み中...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">エラー: {error}</div>;
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
          <p className="text-sm text-gray-600 mb-1">エリア：{spot.area}</p>
          <p className="text-sm text-gray-600 mb-1">
            カテゴリ：{spot.categoryName}
          </p>
          <p className="text-sm text-gray-600">価格帯：{spot.priceType}</p>
        </section>

        {/* 詳細情報（メモ系） */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">詳細情報</h2>

          <dl className="space-y-2 text-sm text-gray-700">
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">対象年齢</dt>
              <dd>{spot.targetAge ?? "情報なし"}</dd>
            </div>
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">滞在目安</dt>
              <dd>{spot.stayingTime ?? "情報なし"}</dd>
            </div>
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">駐車場</dt>
              <dd>{spot.parkingInfo ?? "情報なし"}</dd>
            </div>
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">トイレ</dt>
              <dd>{spot.toiletInfo ?? "情報なし"}</dd>
            </div>
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">コンビニ</dt>
              <dd>{spot.convenienceStore ?? "情報なし"}</dd>
            </div>
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">飲食店</dt>
              <dd>{spot.restaurantInfo ?? "情報なし"}</dd>
            </div>
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">定休日</dt>
              <dd>{spot.closedDays ?? "情報なし"}</dd>
            </div>
            <div className="flex">
              <dt className="w-28 font-semibold text-gray-500">備考</dt>
              <dd>{spot.notes ?? "特になし"}</dd>
            </div>
          </dl>
        </section>

        {/* 設備情報 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">設備情報</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
            <li>オムツ替え：{spot.diaperChanging ? "あり" : "なし"}</li>
            <li>ベビーカー：{spot.strollerOk ? "OK" : "NG"}</li>
            <li>遊具：{spot.playground ? "あり" : "なし"}</li>
            <li>
              アスレチックコース：{spot.athletics ? "あり" : "なし"}
            </li>
            <li>水遊び：{spot.waterPlay ? "あり" : "なし"}</li>
            <li>屋内施設：{spot.indoor ? "あり" : "なし"}</li>
          </ul>
        </section>

        {/* リンク系 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">外部リンク</h2>
          <div className="flex flex-col gap-2 text-sm">
            {spot.googleMapUrl && (
              <a
                href={spot.googleMapUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                Googleマップで開く
              </a>
            )}
            {spot.officialUrl && (
              <a
                href={spot.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline"
              >
                公式サイトを見る
              </a>
            )}
            {!spot.googleMapUrl && !spot.officialUrl && (
              <p className="text-gray-500">リンク情報は登録されていません。</p>
            )}
          </div>
        </section>

        {/* レビュー（投稿フォーム + 一覧） */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            レビュー
            {!reviewsLoading && !reviewsError && `（${reviews.length}件）`}
          </h2>

          {/* 投稿フォーム（任意項目も表示） */}
          <div className="border border-gray-100 rounded-lg p-4 mb-6">
            <div className="font-semibold text-gray-900 mb-3">
              レビューを投稿する
            </div>

            {submitError && (
              <div className="text-sm text-red-600 mb-3">エラー: {submitError}</div>
            )}
            {submitSuccess && (
              <div className="text-sm text-green-600 mb-3">{submitSuccess}</div>
            )}

            {/* 必須：総合評価 */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-1">
                総合評価（必須）
              </div>
              <div className="flex items-center gap-3 text-yellow-500">
                {renderClickableStars(formRating, setFormRating)}
                <span className="text-sm text-gray-700">
                  {formRating > 0 ? `${formRating}/5` : "未選択"}
                </span>
              </div>
            </div>

            {/* 必須：子どもの年齢帯（バックで@NotNull） */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-1">
                子どもの年齢帯（必須）
              </div>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
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

            {/* 必須：レビュー本文 */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-1">
                レビュー本文（必須）
              </div>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[110px]"
                value={formReviewText}
                onChange={(e) => setFormReviewText(e.target.value)}
                placeholder="例：遊具が多くて子どもが楽しめました。トイレもきれいで助かりました。"
              />
            </div>

            {/* 任意：詳細評価（selectで入力） */}
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                詳細評価（任意）
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-600 mb-1">コスパ（1〜5）</div>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
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
                  <div className="text-xs text-gray-600 mb-1">混雑度（1〜5）</div>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
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
                  <div className="text-xs text-gray-600 mb-1">
                    トイレ清潔度（1〜5）
                  </div>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
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
                  <div className="text-xs text-gray-600 mb-1">
                    ベビーカー（1〜5）
                  </div>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
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

            {/* 任意：合計金額 */}
            <div className="mb-5">
              <div className="text-sm font-semibold text-gray-700 mb-1">
                合計金額（任意）
              </div>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={formCostTotal}
                onChange={(e) => setFormCostTotal(e.target.value)}
                placeholder="例：1500"
                inputMode="numeric"
              />
              <div className="text-xs text-gray-500 mt-1">
                ※ 数字のみ（未入力なら送信しません）
              </div>
            </div>

            <div>
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                onClick={handleSubmitReview}
                disabled={submitLoading}
              >
                {submitLoading ? "送信中..." : "送信"}
              </button>
            </div>
          </div>

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
            <>
              <ul className="space-y-4">
                {visibleReviews.map((r) => (
                  <li key={r.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-gray-900">{r.userName}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-yellow-500">{renderStars(r.rating)}</span>
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

              {hasMoreReviews && !showAllReviews && (
                <div className="mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowAllReviews(true)}
                  >
                    もっと見る
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
