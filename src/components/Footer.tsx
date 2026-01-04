import { NavLink } from "react-router-dom";
import { SearchIcon, HeartIcon, UserIcon } from "./Icons";

export const Footer = () => {
  const base = "flex flex-col items-center gap-1 group transition-colors";
  const activeClass = "text-primary";
  const inactiveClass = "text-gray-400 hover:text-gray-600";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 pb-safe z-40">
      <div className="max-w-md mx-auto flex justify-around items-center">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${base} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <SearchIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold">検索</span>
        </NavLink>

        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            `${base} ${isActive ? activeClass : inactiveClass}`
          }
        >
          {({ isActive }) => (
            <>
              <HeartIcon
                className="w-6 h-6 group-hover:scale-110 transition-transform"
                filled={isActive}
              />
              <span className="text-[10px] font-medium">お気に入り</span>
            </>
          )}
        </NavLink>

        {/* ✅ マイページへ遷移（RequireAuthがログインへ誘導してくれる） */}
        <NavLink
          to="/mypage"
          className={({ isActive }) =>
            `${base} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <UserIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-medium">マイページ</span>
        </NavLink>
      </div>
    </nav>
  );
};
