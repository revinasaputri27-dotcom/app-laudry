const labels = {
  pending: 'Menunggu konfirmasi', confirmed: 'Dikonfirmasi', picked_up: 'Dijemput kurir',
  washing: 'Sedang dicuci', ironing: 'Sedang disetrika', ready: 'Siap diambil',
  delivered: 'Selesai', cancelled: 'Dibatalkan'
};

export default function StatusBadge({ status }) {
  return <span className={`status-pill status-${status}`}>{labels[status] || status}</span>;
}