import { Check, Circle } from 'lucide-react';
import { formatTanggal } from '../services/api';

const steps = [
  ['pending', 'Pesanan diterima'], ['confirmed', 'Pesanan dikonfirmasi'],
  ['picked_up', 'Dijemput kurir'], ['washing', 'Sedang dicuci'],
  ['ironing', 'Sedang disetrika'], ['ready', 'Siap diantar atau diambil'], ['delivered', 'Pesanan selesai']
];

export default function Timeline({ status, history = [] }) {
  if (status === 'cancelled') return <div className="cancelled-note">Pesanan dibatalkan. Jika pembayaran sudah dilakukan, hubungi layanan pelanggan.</div>;
  const activeIndex = steps.findIndex(([key]) => key === status);
  const eventByStatus = new Map(history.map((entry) => [entry.status, entry]));
  return <ol className="order-timeline">{steps.map(([key, title], index) => {
    const event = eventByStatus.get(key);
    const done = index < activeIndex;
    const active = index === activeIndex;
    return <li key={key} className={`order-timeline-step${done ? ' completed' : ''}${active ? ' active' : ''}`}>
      <span className="order-timeline-icon">{done ? <Check size={13} /> : active ? <Circle size={9} fill="currentColor" /> : <span>{index + 1}</span>}</span>
      <span className="order-timeline-copy"><strong>{title}</strong>{event?.note && <small>{event.note}</small>}{event?.createdAt && <time>{formatTanggal(event.createdAt)}</time>}</span>
    </li>;
  })}</ol>;
}