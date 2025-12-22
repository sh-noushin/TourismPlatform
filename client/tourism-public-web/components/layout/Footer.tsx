export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Copyright {new Date().getFullYear()} Tourism Platform. All Rights Reserved.</p>
        <p>Made with reusable design tokens + next.js</p>
      </div>
    </footer>
  );
}