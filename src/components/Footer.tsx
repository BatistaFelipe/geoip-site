const LINKS: ReadonlyArray<{ label: string; url: string }> = [
  { label: "GitHub", url: "https://github.com/BatistaFelipe/geoip-site" },
  { label: "felipebatista.dev", url: "https://felipebatista.dev/" },
];

const LABEL_WIDTH = 18;

export default function Footer() {
  return (
    <footer className="mt-10 pt-4 border-t border-zinc-800 text-zinc-400 whitespace-pre tabular-nums">
      <p>Ferramenta gratuita e livre de an&uacute;ncios</p>
      {LINKS.map(({ label, url }) => (
        <p key={label}>
          {(label).padEnd(LABEL_WIDTH, " ")}&rarr;{" "}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:underline"
          >
            {url}
          </a>
        </p>
      ))}
    </footer>
  );
}
