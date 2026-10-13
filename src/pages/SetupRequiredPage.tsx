export function SetupRequiredPage() {
  return (
    <section className="center" style={{ marginTop: 40 }}>
      <div className="eyebrow">One setup step</div>
      <h1 style={{ margin: '10px 0' }}>Connect Supabase</h1>
      <p className="muted small">
        Copy <code>.env.example</code> to <code>.env</code>, add your Supabase project URL and publishable key,
        then restart <code>npm run dev</code>.
      </p>
    </section>
  );
}
