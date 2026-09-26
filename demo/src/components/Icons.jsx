const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ size = 24, children, className, title, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden={title ? undefined : true} role={title ? "img" : undefined} {...rest}>
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

// ---- Sağlayıcı logoları (lobehub/icons) ----
export function OpenAILogo({ size = 24, className }) {
  return (
    <Svg size={size} className={className} title="OpenAI">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z"
      />
    </Svg>
  );
}

export function GroqLogo({ size = 24, className }) {
  return (
    <Svg size={size} className={className} title="Groq">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12.036 2c-3.853-.035-7 3-7.036 6.781-.035 3.782 3.055 6.872 6.908 6.907h2.42v-2.566h-2.292c-2.407.028-4.38-1.866-4.408-4.23-.029-2.362 1.901-4.298 4.308-4.326h.1c2.407 0 4.358 1.915 4.365 4.278v6.305c0 2.342-1.944 4.25-4.323 4.279a4.375 4.375 0 01-3.033-1.252l-1.851 1.818A7 7 0 0012.029 22h.092c3.803-.056 6.858-3.083 6.879-6.816v-6.5C18.907 4.963 15.817 2 12.036 2z"
      />
    </Svg>
  );
}

export function ProviderLogo({ provider, size = 24, className }) {
  return provider === "Groq" ? <GroqLogo size={size} className={className} /> : <OpenAILogo size={size} className={className} />;
}

// ---- Tetikleyici ikonları ----
const TRIGGER_PATHS = {
  income_increase: (
    <>
      <path {...stroke} d="M3 17l5.5-5.5 4 4L21 7" />
      <path {...stroke} d="M15 7h6v6" />
    </>
  ),
  idle_cash_buildup: (
    <>
      <ellipse {...stroke} cx="12" cy="6" rx="7" ry="2.5" />
      <path {...stroke} d="M5 6v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" />
      <path {...stroke} d="M5 10v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4" />
      <path {...stroke} d="M5 14v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4" />
    </>
  ),
  unusual_spending_increase: (
    <>
      <path {...stroke} d="M5 8h14l-1.2 11.2a2 2 0 01-2 1.8H8.2a2 2 0 01-2-1.8L5 8z" />
      <path {...stroke} d="M9 8V6.5a3 3 0 016 0V8" />
      <path {...stroke} d="M12 17v-5M9.8 14.2L12 12l2.2 2.2" />
    </>
  ),
  liquidity_pressure: (
    <>
      <path {...stroke} d="M4 16a8 8 0 1116 0" />
      <path {...stroke} d="M12 16L7.5 11.5" />
      <circle cx="12" cy="16" r="1.4" fill="currentColor" />
      <path {...stroke} d="M4 19.5h16" />
    </>
  ),
  loan_paid_off: (
    <>
      <path {...stroke} d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
      <path {...stroke} d="M14 3v5h5" />
      <path {...stroke} d="M8.5 14.5l2.3 2.3 4.7-4.8" />
    </>
  ),
  new_recurring_bill: (
    <>
      <path {...stroke} d="M6 3h12v18l-2.5-1.6L13 21l-2.5-1.6L8 21l-2-1.3V3z" transform="translate(0 0)" />
      <path {...stroke} d="M9 8h6M9 11.5h6" />
      <path {...stroke} d="M14.5 15.5a2.6 2.6 0 11-.8-1.9M14.5 13.2v1.9h-1.9" />
    </>
  ),
  first_overdraft: (
    <>
      <path {...stroke} d="M10.3 4.2L2.8 17.5A2 2 0 004.5 20.5h15a2 2 0 001.7-3L13.7 4.2a2 2 0 00-3.4 0z" />
      <path {...stroke} d="M9 14h6" />
    </>
  ),
  pension_income_started: (
    <>
      <path {...stroke} d="M3 18h18" />
      <path {...stroke} d="M7 18a5 5 0 0110 0" />
      <path {...stroke} d="M12 5v3M5.2 8.2l2.1 2.1M18.8 8.2l-2.1 2.1M2.5 14h2M19.5 14h2" />
      <path {...stroke} d="M8 21h8" />
    </>
  ),
};

export function TriggerIcon({ type, size = 24, className }) {
  return (
    <Svg size={size} className={className}>
      {TRIGGER_PATHS[type]}
    </Svg>
  );
}

// ---- Arayüz ikonları ----
export const ShuffleIcon = (p) => (
  <Svg {...p}>
    <path {...stroke} d="M16 4h4v4M4 20L20 4M20 16v4h-4M15 15l5 5M4 4l5 5" />
  </Svg>
);
export const ArrowRightIcon = (p) => (
  <Svg {...p}>
    <path {...stroke} d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const ArrowLeftIcon = (p) => (
  <Svg {...p}>
    <path {...stroke} d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);
export const CheckIcon = (p) => (
  <Svg {...p}>
    <path {...stroke} strokeWidth={2.25} d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const CrossIcon = (p) => (
  <Svg {...p}>
    <path {...stroke} strokeWidth={2.25} d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
export const AlertIcon = (p) => (
  <Svg {...p}>
    <path {...stroke} d="M12 8v5M12 16.5v.01" strokeWidth={2.25} />
    <circle {...stroke} cx="12" cy="12" r="9" />
  </Svg>
);
export const InfoIcon = (p) => (
  <Svg {...p}>
    <circle {...stroke} cx="12" cy="12" r="9" />
    <path {...stroke} d="M12 11v5.5M12 7.5v.01" strokeWidth={2.25} />
  </Svg>
);
export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle {...stroke} cx="11" cy="11" r="6.5" />
    <path {...stroke} d="M20 20l-4.2-4.2" />
  </Svg>
);
export const UserIcon = (p) => (
  <Svg {...p}>
    <circle {...stroke} cx="12" cy="8" r="4" />
    <path {...stroke} d="M4 21a8 8 0 0116 0" />
  </Svg>
);
export const SparkIcon = (p) => (
  <Svg {...p}>
    <path fill="currentColor" d="M12 2l1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
  </Svg>
);
export const MailIcon = (p) => (
  <Svg {...p}>
    <rect {...stroke} x="3" y="5" width="18" height="14" rx="2.5" />
    <path {...stroke} d="M3.5 6.5l8.5 6.5 8.5-6.5" />
  </Svg>
);
export const PhoneIcon = (p) => (
  <Svg {...p}>
    <rect {...stroke} x="6.5" y="2.5" width="11" height="19" rx="2.5" />
    <path {...stroke} d="M10.5 18.5h3" />
  </Svg>
);
export const CardIcon = (p) => (
  <Svg {...p}>
    <rect {...stroke} x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path {...stroke} d="M2.5 9.5h19M6 15h4" />
  </Svg>
);
export const BankIcon = (p) => (
  <Svg {...p}>
    <path {...stroke} d="M3 9.5L12 4l9 5.5M4.5 10v8M9.5 10v8M14.5 10v8M19.5 10v8M3 20h18" />
  </Svg>
);
