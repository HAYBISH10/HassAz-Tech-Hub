import { Link } from "react-router-dom";
import { aboutLinks } from "../../data/about";

export default function AboutMenu({ onNavigate }) {
  return (
    <div className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-navy/10 bg-white p-2 shadow-xl">
      {aboutLinks.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="block rounded-xl px-4 py-3 hover:bg-[#f7f3e8]"
        >
          <p className="text-sm font-semibold text-navy">{item.label}</p>
          <p className="mt-1 text-xs leading-5 text-muted">{item.text}</p>
        </Link>
      ))}
    </div>
  );
}
