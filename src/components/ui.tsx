/**
 * Shared building blocks for the prototype's recurring styles, so button and
 * badge treatments exist exactly once.
 */

/** Secondary button: white, line border, primary text (Add report, Export PDF…). */
export const BTN_SECONDARY =
  "rounded-[10px] border border-line bg-white px-[13px] py-2 font-heading text-[12.5px] font-semibold text-primary";

/** View-as-client toggle: as secondary but with the primary border. */
export const BTN_VIEW_AS =
  "rounded-[10px] border border-primary bg-white px-[13px] py-2 font-heading text-[12.5px] font-semibold text-primary";

/** Back-to-internal: dashed muted border on soft fill. */
export const BTN_BACK_INTERNAL =
  "rounded-[10px] border border-dashed border-muted bg-soft px-[13px] py-2 font-heading text-[12.5px] font-semibold text-primary";

/** The 'Internal' role badge from the top bar. */
export function InternalBadge() {
  return (
    <span className="rounded-full border border-line bg-soft px-2.5 py-[3px] font-heading text-[11px] font-semibold tracking-[.04em] text-primary">
      Internal
    </span>
  );
}

/** Sign-out button posting to the signout route. */
export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className={BTN_SECONDARY}>
        Sign out
      </button>
    </form>
  );
}
