import { NavLink } from "react-router-dom";
import { SearchIcon, HeartIcon, UserIcon } from "./Icons";

export const Footer = () => {
  const base =
    "flex flex-col items-center gap-1 group transition-colors select-none";
  const activeClass = "text-emerald-700";
  const inactiveClass = "text-slate-400 hover:text-slate-600";

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-white/60 bg-white/75 py-2 px-6 pb-safe shadow-sm backdrop-blur z-40">
      <div className="max-w-md mx-auto flex justify-around items-center">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${base} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <SearchIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold">TOP</span>
        </NavLink>

        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            `${base} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <HeartIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold">お気に入り</span>
        </NavLink>

        {/* ✅ マイページへ遷移（RequireAuthがログインへ誘導してくれる） */}
        <NavLink
          to="/mypage"
          className={({ isActive }) =>
            `${base} ${isActive ? activeClass : inactiveClass}`
          }
        >
          <UserIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold">マイページ</span>
        </NavLink>
      </div>
    </nav>
  );
};
