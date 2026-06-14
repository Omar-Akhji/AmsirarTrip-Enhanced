import { useTranslation } from "@/lib/hooks/useTranslation";

export function ContactInfoSidebar() {
  const { t } = useTranslation();

  return (
    <>
      <div>
        <p className="text-xs font-semibold tracking-[0.45em] text-orange-200 uppercase">
          {t("contact.form.infoBadge", "Need details?")}
        </p>
        <h3 className="mbs-3 text-2xl font-semibold sm:text-3xl">
          {t("contact.form.infoTitle", "Plan handcrafted experiences")}
        </h3>
        <p className="mbs-4 text-sm text-slate-200">
          {t(
            "contact.form.infoCopy",
            "Our Marrakech team answers every message personally and can help with custom itineraries, desert camps, or last-minute transfers.",
          )}
        </p>
      </div>

      <ul className="mbs-8 space-y-6 text-sm">
        {(
          [
            {
              id: "visit",
              num: "01",
              label: t("contact.form.info.address", "Visit"),
              content: (
                <p className="mbs-1 text-base text-white">
                  Imm. J appt N° 5, Résidence La Perle de l&apos;Atlas, angle Rue aboubakr,
                  Marrakech
                </p>
              ),
            },
            {
              id: "call",
              num: "02",
              label: t("contact.form.info.phone", "Call"),
              content: (
                <>
                  <a
                    className="mbs-1 block text-base text-white pointer-fine:hover:text-orange-300"
                    href="tel:+21266173144"
                  >
                    +212 (0) 6 61 17 31 44
                  </a>
                  <a
                    className="mbs-1 block text-base text-white/80 pointer-fine:hover:text-orange-300"
                    href="tel:+212566173144"
                  >
                    +212 (0) 5 6 61 73 14 44
                  </a>
                </>
              ),
            },
            {
              id: "email",
              num: "03",
              label: t("contact.form.info.email", "Email"),
              content: (
                <a
                  className="break-anywhere mbs-1 block text-base text-white pointer-fine:hover:text-orange-300"
                  href="mailto:amsirare@gmail.com"
                >
                  amsirare@gmail.com
                </a>
              ),
            },
          ] as const
        ).map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[48px_1fr] items-start gap-4"
          >
            <span className="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-sm leading-none font-semibold text-orange-300">
              {item.num}
            </span>
            <div className="self-start">
              <p className="text-xs tracking-wide text-slate-300 uppercase">{item.label}</p>
              {item.content}
            </div>
          </li>
        ))}
      </ul>

      <p className="mbs-8 text-xs text-slate-400">
        {t("contact.form.infoFooter", "Available every day from 09:00 to 21:00 GMT+1")}
      </p>
    </>
  );
}
