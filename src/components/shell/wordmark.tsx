/** EFG. Consulting wordmark. Dark variant sits on ink/primary surfaces. */
export function Wordmark({
  size = 18,
  dark = false,
}: {
  size?: number;
  dark?: boolean;
}) {
  return (
    <div
      className="font-heading font-semibold whitespace-nowrap"
      style={{ fontSize: size, color: dark ? "#fff" : "#162E27" }}
    >
      EFG
      <span style={{ color: dark ? "#D0E8E2" : "#2E6B5A" }}>.</span>{" "}
      <span
        className="font-medium"
        style={{ color: dark ? "#D0E8E2" : "#4A6B62" }}
      >
        Consulting
      </span>
    </div>
  );
}
