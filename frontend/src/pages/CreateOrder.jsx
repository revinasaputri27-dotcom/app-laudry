import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock3, MapPin, Plus, Truck, WashingMachine } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api, { formatRupiah } from '../services/api';

const stepTitles = ['Alamat', 'Layanan', 'Detail cucian', 'Konfirmasi'];
const localDateTime = (value) => {
  const date = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return date.toISOString().slice(0, 16);
};

export default function CreateOrder() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [addresses, setAddresses] = useState([]);
  const [packages, setPackages] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [hasPreviousOrders, setHasPreviousOrders] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ addressId: '', pickupMethod: 'pickup', packageId: params.get('packageId') || '', addOns: [], weight: '', note: '', pickupSchedule: localDateTime(new Date(Date.now() + 60 * 60 * 1000)) });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/addresses'), api.get('/packages'), api.get('/packages/add-ons'), api.get('/dashboard/customer-stats')])
      .then(([addressResponse, packageResponse, addOnResponse, statsResponse]) => {
        setAddresses(addressResponse.data);
        setPackages(packageResponse.data);
        setAddOns(addOnResponse.data.filter((item) => item.name !== 'Antar Jemput'));
        setHasPreviousOrders(statsResponse.data.totalPesanan > 0);
        const preferred = addressResponse.data.find((item) => item.isDefault) || addressResponse.data[0];
        setForm((current) => ({ ...current, addressId: preferred ? String(preferred.id) : '' }));
      })
      .catch((requestError) => setError(requestError.response?.data?.message || 'Data pemesanan belum dapat dimuat.'));
  }, []);

  const selectedPackage = packages.find((item) => String(item.id) === String(form.packageId));
  const selectedAddress = addresses.find((item) => String(item.id) === String(form.addressId));
  const selectedAddOns = addOns.filter((item) => form.addOns.includes(item.id));
  const estimate = useMemo(() => {
    const weight = Number(form.weight || 0);
    const base = Number(selectedPackage?.pricePerKg || 0) * weight;
    const extras = selectedAddOns.reduce((sum, item) => sum + Number(item.price) * (item.unit === 'kg' ? weight : 1), 0);
    const subtotal = base + extras;
    const discount = !hasPreviousOrders ? subtotal * 0.2 : 0;
    const deliveryFee = form.pickupMethod === 'pickup' && subtotal - discount < 50000 ? 5000 : 0;
    return { base, extras, subtotal, discount, deliveryFee, total: Math.max(0, subtotal - discount + deliveryFee) };
  }, [form.weight, form.pickupMethod, selectedPackage, selectedAddOns, hasPreviousOrders]);

  const canContinue = () => {
    if (step === 0 && !form.addressId) return 'Pilih alamat penjemputan terlebih dahulu.';
    if (step === 1 && !form.packageId) return 'Pilih paket laundry terlebih dahulu.';
    if (step === 2) {
      if (Number(form.weight) < Number(selectedPackage?.minWeight || 1)) return `Berat minimum paket ini ${selectedPackage?.minWeight || 1} ${selectedPackage?.unit || 'kg'}.`;
      if (!form.pickupSchedule || new Date(form.pickupSchedule).getTime() <= Date.now()) return 'Pilih jadwal penjemputan yang masih akan datang.';
    }
    return '';
  };
  const next = () => { const message = canContinue(); if (message) { setError(message); return; } setError(''); setStep((current) => Math.min(3, current + 1)); };
  const submit = async () => {
    const message = canContinue(); if (message) { setError(message); setStep(2); return; }
    setBusy(true); setError('');
    try {
      const { data } = await api.post('/orders/customer', {
        ...form,
        addressId: Number(form.addressId),
        packageId: Number(form.packageId),
        weight: Number(form.weight),
        addOns: form.addOns.map((id) => ({ id, qty: 1 }))
      });
      navigate(`/my-orders/${data.id}`, { state: { created: true } });
    } catch (requestError) { setError(requestError.response?.data?.message || 'Pesanan belum dapat dibuat.'); }
    finally { setBusy(false); }
  };
  const toggleAddOn = (id) => setForm((current) => ({ ...current, addOns: current.addOns.includes(id) ? current.addOns.filter((item) => item !== id) : [...current.addOns, id] }));

  return <div className="page-enter create-order-page">
    <Link to="/dashboard" className="back-link"><ArrowLeft size={15} /> Kembali ke beranda</Link>
    <div className="page-heading"><div><div className="eyebrow">PESANAN BARU</div><h1>Ceritakan kebutuhan laundry Anda.</h1><p>Empat langkah sederhana, semua biaya terlihat sebelum konfirmasi.</p></div></div>
    <ol className="order-form-steps">{stepTitles.map((title, index) => <li key={title} className={`${index === step ? 'current' : ''}${index < step ? ' done' : ''}`}><span>{index < step ? <Check size={14} /> : index + 1}</span><strong>{title}</strong></li>)}</ol>
    {error && <div className="alert-error">{error}</div>}
    <div className="create-order-layout"><section className="panel order-form-panel">
      {step === 0 && <div className="order-step-content"><div className="step-intro"><span className="step-symbol"><MapPin size={19} /></span><div><h2>Ke mana kurir menjemput?</h2><p>Pilih alamat tujuan pesanan ini.</p></div></div>
        <div className="address-choice-list">{addresses.map((address) => <label className={`address-choice${String(address.id) === form.addressId ? ' selected' : ''}`} key={address.id}><input type="radio" name="address" value={address.id} checked={String(address.id) === form.addressId} onChange={(event) => setForm({ ...form, addressId: event.target.value })} /><span><strong>{address.label}{address.isDefault && <small>UTAMA</small>}</strong><span>{address.address}, {address.city}, {address.postalCode}</span>{address.notes && <em>{address.notes}</em>}</span></label>)}
          {!addresses.length && <div className="address-needed"><MapPin size={20} /><strong>Tambahkan alamat pertama</strong><span>Alamat diperlukan agar kurir tahu ke mana harus datang.</span><Link to="/address?new=1&return=%2Fcreate-order" className="button button-primary"><Plus size={15} /> Tambah alamat</Link></div>}
        </div>
        {addresses.length > 0 && <Link to="/address?new=1&return=%2Fcreate-order" className="add-address-link"><Plus size={15} /> Tambah alamat baru</Link>}
        <div className="pickup-options"><span className="field-label">Pilih cara pengantaran</span><div className="pickup-option-grid"><button type="button" className={`pickup-option${form.pickupMethod === 'pickup' ? ' chosen' : ''}`} onClick={() => setForm({ ...form, pickupMethod: 'pickup' })}><Truck size={19} /><strong>Dijemput kurir</strong><span>Rp 5.000 · gratis min. Rp 50.000</span></button><button type="button" className={`pickup-option${form.pickupMethod === 'delivery' ? ' chosen' : ''}`} onClick={() => setForm({ ...form, pickupMethod: 'delivery' })}><MapPin size={19} /><strong>Antar sendiri ke outlet</strong><span>Tanpa biaya antar-jemput</span></button></div></div>
      </div>}
      {step === 1 && <div className="order-step-content"><div className="step-intro"><span className="step-symbol"><WashingMachine size={19} /></span><div><h2>Pilih perawatan yang sesuai.</h2><p>Harga akhir menyesuaikan berat aktual setelah cucian ditimbang.</p></div></div>
        <div className="service-choice-grid">{packages.map((item) => <button type="button" key={item.id} onClick={() => setForm({ ...form, packageId: String(item.id) })} className={`service-choice${String(item.id) === form.packageId ? ' selected' : ''}`}><span className="service-choice-top"><span className="package-tiny-icon"><WashingMachine size={17} /></span><span className="service-category">{item.category}</span></span><strong>{item.name}</strong><p>{item.description}</p><div><b>{formatRupiah(item.pricePerKg)}<small> / {item.unit}</small></b><span><Clock3 size={12} /> {item.estimasiJam ? `${item.estimasiJam} jam` : `${item.estimasiHari} hari`}</span></div>{Number(item.minWeight) > 1 && <em>Minimum {item.minWeight} {item.unit}</em>}</button>)}</div>
        <div className="addon-section"><h3>Tambahkan perawatan ekstra</h3><div className="addon-choice-list">{addOns.map((item) => <label className="addon-choice" key={item.id}><input type="checkbox" checked={form.addOns.includes(item.id)} onChange={() => toggleAddOn(item.id)} /><span><strong>{item.name}</strong><small>{item.description}</small></span><b>{formatRupiah(item.price)}{item.unit === 'kg' ? '/kg' : ''}</b></label>)}</div></div>
      </div>}
      {step === 2 && <div className="order-step-content"><div className="step-intro"><span className="step-symbol"><Clock3 size={19} /></span><div><h2>Atur detail cucian.</h2><p>Estimasi berat dan catatan khusus membantu tim kami merawat pakaian.</p></div></div>
        <div className="form-grid"><label className="field-label">Estimasi berat ({selectedPackage?.unit || 'kg'})<input type="number" min={selectedPackage?.minWeight || 1} step="0.1" required value={form.weight} onChange={(event) => setForm({ ...form, weight: event.target.value })} placeholder={`Minimal ${selectedPackage?.minWeight || 1} ${selectedPackage?.unit || 'kg'}`} /></label><label className="field-label">Jadwal penjemputan<input type="datetime-local" min={localDateTime(new Date(Date.now() + 30 * 60 * 1000))} required value={form.pickupSchedule} onChange={(event) => setForm({ ...form, pickupSchedule: event.target.value })} /></label></div>
        <label className="field-label">Catatan khusus <span className="optional-note">OPSIONAL</span><textarea rows="4" maxLength="500" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Contoh: pisahkan pakaian putih, ada noda di bagian kerah..." /></label>
      </div>}
      {step === 3 && <div className="order-step-content"><div className="step-intro"><span className="step-symbol"><Check size={19} /></span><div><h2>Periksa pesanan Anda.</h2><p>Pesanan baru berstatus menunggu konfirmasi.</p></div></div>
        <div className="confirmation-block"><div><span>ALAMAT {selectedAddress?.label?.toUpperCase()}</span><strong>{selectedAddress?.address}</strong><small>{selectedAddress?.city} · {selectedAddress?.postalCode}</small></div><button type="button" onClick={() => setStep(0)}>Ubah</button></div>
        <div className="confirmation-block"><div><span>PAKET</span><strong>{selectedPackage?.name}</strong><small>{Number(form.weight || 0).toLocaleString('id-ID')} {selectedPackage?.unit} · {formatRupiah(selectedPackage?.pricePerKg)} / {selectedPackage?.unit}</small></div><button type="button" onClick={() => setStep(1)}>Ubah</button></div>
        <div className="confirmation-block"><div><span>JADWAL</span><strong>{new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(form.pickupSchedule))}</strong><small>{form.pickupMethod === 'pickup' ? 'Dijemput kurir' : 'Diantar sendiri ke outlet'}</small></div><button type="button" onClick={() => setStep(2)}>Ubah</button></div>
        {form.note && <div className="confirmation-note"><span>CATATAN</span><p>{form.note}</p></div>}
      </div>}
      <div className="order-step-actions">{step > 0 ? <button type="button" className="button button-quiet" onClick={() => { setError(''); setStep(step - 1); }}><ArrowLeft size={15} /> Sebelumnya</button> : <span />}{step < 3 ? <button type="button" className="button button-primary" onClick={next}>Lanjut <ArrowRight size={15} /></button> : <button type="button" className="button button-primary" disabled={busy} onClick={submit}>{busy ? 'Menyimpan...' : <>Buat pesanan <ArrowRight size={15} /></>}</button>}</div>
    </section>
    <aside className="order-summary"><span className="eyebrow">RINGKASAN BIAYA</span><h2>Rincian pesanan</h2><div className="summary-line"><span>{selectedPackage?.name || 'Paket belum dipilih'}</span><strong>{formatRupiah(estimate.base)}</strong></div>{selectedAddOns.map((item) => <div className="summary-line" key={item.id}><span>{item.name}</span><strong>{formatRupiah(Number(item.price) * (item.unit === 'kg' ? Number(form.weight || 0) : 1))}</strong></div>)}<div className="summary-line"><span>Antar-jemput</span><strong>{form.pickupMethod === 'delivery' ? 'Gratis' : estimate.deliveryFee ? formatRupiah(estimate.deliveryFee) : 'Gratis'}</strong></div>{estimate.discount > 0 && <div className="summary-line discount-line"><span>Diskon pesanan pertama</span><strong>−{formatRupiah(estimate.discount)}</strong></div>}<div className="summary-divider" /><div className="summary-total"><span>Estimasi total</span><strong>{formatRupiah(estimate.total)}</strong></div><small className="summary-footnote">Total final mengikuti hasil penimbangan di outlet.</small><div className="summary-assurance"><Check size={14} /> Tidak ada biaya tersembunyi</div></aside></div>
  </div>;
}