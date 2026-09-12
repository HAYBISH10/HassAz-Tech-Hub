import { useSite } from "../../hooks/useContent";
import { toWhatsAppLink } from "../../utils/phone";

export default function WhatsAppButton({ variant = "floating" }) {
  const site = useSite();
  const href = toWhatsAppLink(site.whatsapp) || `mailto:${site.email}`;
  const floating = variant === "floating";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={
        floating
          ? "fixed right-3 bottom-28 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-3 py-2 text-xs font-semibold text-white shadow-lg sm:right-5 sm:bottom-[6.75rem] sm:px-4 sm:py-2.5 sm:text-sm"
          : "inline-flex items-center gap-2 rounded-full bg-[#25D366] px-3 py-2 text-xs font-semibold text-white shadow-lg sm:px-4 sm:py-2.5 sm:text-sm"
      }
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M19.1 17.4c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1.1-.3.2-.6.1a7.5 7.5 0 0 1-2.2-1.4 8.3 8.3 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.5-.6c.1-.2.2-.3.3-.5s0-.4 0-.5-.6-1.5-.8-2.1c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.8.4s-1 1-1 2.4 1.1 2.8 1.2 3 .2.4 2.1 3.2a11.4 11.4 0 0 0 4.4 2.6c.6.2 1.1.2 1.5.1s1.6-.7 1.8-1.3.2-1.2.1-1.3-.3-.2-.6-.3z" />
        <path d="M16 3a13 13 0 0 0-11.2 19.5L3 29l6.7-1.7A13 13 0 1 0 16 3zm0 23.6a10.6 10.6 0 0 1-5.4-1.5l-.4-.2-4 1 1.1-3.9-.2-.4A10.6 10.6 0 1 1 16 26.6z" />
      </svg>
      Chat with us
    </a>
  );
}
