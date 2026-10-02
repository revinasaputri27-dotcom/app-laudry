export default function StatCard({ label, value, detail, icon: Icon, tone = 'mint' }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-topline"><span>{label}</span><span className="stat-icon"><Icon size={18} /></span></div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}