import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { memberQueries } from "../../api/members/member-queries";
import RetryMessage from "../../components/retry-message";
import { useAuthStore } from "../../stores/auth-store";
import { formatDate } from "../../utils/members/format-date";

export function MyProfilePage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  // 헤더와 같은 key라, 헤더가 이미 받아 온 데이터가 있으면 요청 없이 바로 보여줘요
  const meQuery = useQuery({
    ...memberQueries.me(),
    enabled: Boolean(accessToken),
  });

  function renderProfile() {
    if (!accessToken) {
      return (
        <p className="mt-8 text-(--color-text-secondary)">
          로그인이 필요해요.{" "}
          <Link className="text-(--color-action-primary) underline" to="/login">
            로그인하러 가기
          </Link>
        </p>
      );
    }
    if (meQuery.isPending) {
      return (
        <p className="mt-8 text-(--color-text-secondary)">
          내 정보를 불러오는 중이에요.
        </p>
      );
    }
    if (meQuery.isError) {
      return (
        <RetryMessage
          message="내 정보를 불러오지 못했어요."
          onRetry={() => meQuery.refetch()}
        />
      );
    }

    const profile = meQuery.data;
    return (
      <section
        className="mt-8 max-w-160 rounded-xl border border-(--color-border-default) bg-(--color-bg-surface) p-6 min-[481px]:p-8"
        aria-labelledby="profile-nickname"
      >
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-full bg-(--color-bg-page)">
            <img
              className="size-9 opacity-40"
              src="/icons/movie-icons/person.svg"
              alt=""
            />
          </span>
          <div className="min-w-0 flex-1">
            <p id="profile-nickname" className="text-xl font-extrabold">
              {profile.nickname}
            </p>
            <p className="mt-1 truncate text-sm text-(--color-text-secondary)">
              {profile.email}
            </p>
          </div>
          <Link
            className="flex h-10 items-center gap-1.5 rounded-md border border-(--color-border-default) px-4 text-sm font-bold text-(--color-text-primary) no-underline hover:bg-(--color-bg-page)"
            to="/my/edit"
          >
            <img className="size-4" src="/icons/movie-icons/edit.svg" alt="" />
            내 정보 수정
          </Link>
        </div>

        <dl className="mt-6 grid gap-x-4 gap-y-1 border-t border-(--color-border-default) pt-6 text-sm min-[481px]:grid-cols-[120px_1fr] min-[481px]:gap-y-4">
          <ProfileRow label="이메일" value={profile.email} />
          <ProfileRow label="닉네임" value={profile.nickname} />
          <ProfileRow label="가입일" value={formatDate(profile.createdAt)} />
        </dl>
      </section>
    );
  }

  return (
    <main className="page-container flex-1 pt-8 pb-20">
      <h1 className="text-[28px] font-extrabold tracking-[-0.02em] min-[481px]:text-4xl">
        내 정보
      </h1>
      {renderProfile()}

      <Link
        className="mt-4 flex max-w-160 items-center justify-between rounded-xl border border-(--color-border-default) bg-(--color-bg-surface) px-6 py-5 text-(--color-text-primary) no-underline hover:bg-(--color-bg-page) min-[481px]:px-8"
        to="/my/ratings"
      >
        <span>
          <span className="block font-bold">내 평점</span>
          <span className="mt-1 block text-sm text-(--color-text-secondary)">
            내가 남긴 영화 평점을 모아 봐요.
          </span>
        </span>
        <img
          className="size-5"
          src="/icons/movie-icons/chevron-right.svg"
          alt=""
        />
      </Link>
    </main>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-(--color-text-secondary)">{label}</dt>
      <dd className="mb-3 font-medium min-[481px]:mb-0">{value}</dd>
    </>
  );
}
