import React, { useState, useEffect } from 'react';
import { ToastContainer, Toast } from 'react-bootstrap';

export default function LogCatch({ onAdd }) {
  const [species,  setSpecies]  = useState('');
  const [quantity, setQuantity] = useState('');
  const [price,    setPrice]    = useState('');
  const [buyer,    setBuyer]    = useState('');
  const [mpesa,    setMpesa]    = useState('');

  /* ─── Regex: 10-13 uppercase letters/digits ─── */
  const mpesaPattern = /^[A-Z0-9]{10,13}$/;

  /* Toast state */
  const [toast, setToast] = useState({ show:false, msg:'', variant:'success' });

  /* ─── Validation helpers ─── */
  const isPosNumber = v => /^\d+(\.\d+)?$/.test(v) && Number(v) > 0;

  const valid = {
    species : species.trim().length > 1,
    quantity: isPosNumber(quantity),
    price   : isPosNumber(price),
    buyer   : buyer.trim().length > 1,
    mpesa   : !mpesa || mpesaPattern.test(mpesa)   // optional but must match pattern if provided
  };
  const formOK = Object.values(valid).every(Boolean);

  /* ─── Live preview total ─── */
  const totalPrice =
    isPosNumber(quantity) && isPosNumber(price)
      ? (Number(quantity) * Number(price)).toFixed(2)
      : '—';

  /* ─── Submit handler ─── */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formOK) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setToast({ show:true, msg:'You must be logged in.', variant:'danger' });
      return;
    }
    try {
      const res = await fetch('/catches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization : 'Bearer ' + token
        },
        body: JSON.stringify({
          species,
          quantity : Number(quantity),
          price    : Number(price),
          buyer,
          mpesa_code: mpesa || null          // <── NEW
        })
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ show:true, msg:'Catch recorded!', variant:'success' });
        setSpecies(''); setQuantity(''); setPrice('');
        setBuyer('');  setMpesa('');               // clear mpesa too
        if (onAdd) onAdd(data);
      } else {
        setToast({ show:true, msg:data.msg || 'Failed to add catch', variant:'danger' });
      }
    } catch {
      setToast({ show:true, msg:'Network error', variant:'danger' });
    }
  };

  /* auto-hide toast */
  useEffect(() => {
    if (toast.show) {
      const id = setTimeout(() => setToast(t => ({ ...t, show:false })), 3000);
      return () => clearTimeout(id);
    }
  }, [toast.show]);

  /* ─── UI ─── */
  return (
    <>
      {/* toast */}
      <ToastContainer className="toast-container">
        <Toast bg={toast.variant} show={toast.show} onClose={() => setToast({...toast, show:false})}>
          <Toast.Body className="text-white">{toast.msg}</Toast.Body>
        </Toast>
      </ToastContainer>

      <h2 className="mb-4">Log a New Catch</h2>

      <div className="row g-4">
        {/* left column – form */}
        <div className="col-lg-6">
          <form onSubmit={handleSubmit}>
            {/* species */}
            <div className="mb-3">
              <label className="form-label">Species</label>
              <input
                type="text"
                className={`form-control ${species ? (valid.species?'is-valid':'is-invalid') : ''}`}
                value={species}
                onChange={e => setSpecies(e.target.value)}
                placeholder="Tilapia"
                required
              />
            </div>

            {/* quantity */}
            <div className="mb-3">
              <label className="form-label">Quantity</label>
              <div className="input-group">
                <input
                  type="number"
                  className={`form-control ${quantity ? (valid.quantity?'is-valid':'is-invalid') : ''}`}
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="0"
                  min="0" step="0.1" required
                />
                <span className="input-group-text">kg</span>
              </div>
            </div>

            {/* price */}
            <div className="mb-3">
              <label className="form-label">Price per kg</label>
              <div className="input-group">
                <span className="input-group-text">KES</span>
                <input
                  type="number"
                  className={`form-control ${price ? (valid.price?'is-valid':'is-invalid') : ''}`}
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0"
                  min="0" step="0.1" required
                />
              </div>
            </div>

            {/* buyer */}
            <div className="mb-3">
              <label className="form-label">Buyer</label>
              <input
                type="text"
                className={`form-control ${buyer ? (valid.buyer?'is-valid':'is-invalid') : ''}`}
                value={buyer}
                onChange={e => setBuyer(e.target.value)}
                placeholder="Local market"
                required
              />
            </div>

            {/* mpesa */}
            <div className="mb-4">
              <label className="form-label">
                M-Pesa Transaction Code <small className="text-muted">(optional)</small>
              </label>
              <input
                type="text"
                className={`form-control ${mpesa ? (valid.mpesa?'is-valid':'is-invalid') : ''}`}
                value={mpesa}
                onChange={e => setMpesa(e.target.value.toUpperCase())}
                placeholder="QJD6K4A2X0"
                maxLength={13}
              />
              <div className="invalid-feedback">
                10–13 uppercase letters / digits
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100"
              disabled={!formOK}
            >
              Add Catch
            </button>
          </form>
        </div>

        {/* right column – live preview */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">Entry Preview</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <span>Species</span><strong>{species || '—'}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Quantity</span><strong>{quantity ? quantity+' kg' : '—'}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Price / kg</span><strong>{price ? 'KES '+price : '—'}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Total</span><strong>{totalPrice==='—' ? '—' : 'KES '+totalPrice}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>Buyer</span><strong>{buyer || '—'}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <span>M-Pesa Code</span><strong>{mpesa || '—'}</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
