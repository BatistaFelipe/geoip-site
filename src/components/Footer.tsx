const LINKS: ReadonlyArray<{
  label: string;
  url: string;
  icon: "github" | "globe";
}> = [
  {
    label: "GitHub",
    url: "https://github.com/BatistaFelipe/geoip-site",
    icon: "github",
  },
  {
    label: "felipebatista.dev",
    url: "https://felipebatista.dev/",
    icon: "globe",
  },
];

function Icon({ name }: { name: "github" | "globe" | "heart" }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    className: "inline-block shrink-0",
  } as const;

  if (name === "heart") {
    return (
      <svg
        {...common}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />
      </svg>
    );
  }

  if (name === "github") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.57.11.78-.25.78-.55v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.26-1.28-5.26-5.72 0-1.26.45-2.29 1.19-3.1-.12-.3-.52-1.47.11-3.07 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.6.23 2.77.11 3.07.74.81 1.19 1.84 1.19 3.1 0 4.45-2.71 5.43-5.29 5.71.41.36.78 1.06.78 2.14v3.18c0 .3.21.67.79.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
      </svg>
    );
  }

  return (
    <svg
      {...common}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-10 pt-4 border-t border-zinc-800 text-zinc-400 text-center">
      <p className="flex items-center justify-center gap-2">
        <span className="text-red-400">
          <Icon name="heart" />
        </span>
        <span>Ferramenta gratuita e livre de an&uacute;ncios.</span>
      </p>
      <p className="mt-2 flex items-center justify-center gap-6">
        {LINKS.map(({ label, url, icon }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-green-400"
          >
            <Icon name={icon} />
            <span>{label}</span>
          </a>
        ))}
      </p>
    </footer>
  );
}
