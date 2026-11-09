export function getSafeRedirect(redirect: string | undefined) {
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return "/";
}
