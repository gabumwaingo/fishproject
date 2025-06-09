import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, ToastContainer, Toast } from 'react-bootstrap';

const mpesaPattern = /^[A-Z0-9]{10,13}$/;
const isPosNumber  = v => /^\d+(\.\d+)?$/.test(v) && Number(v) > 0;

export default function History() {
  /* ------------ state ------------- */
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  /* toast */
  const [toast, setToast] = useState({ show:false, msg:'', variant:'success' });

  /* edit modal */
  const [showEdit, setShowEdit]   = useState(false);
  const [editData, setEditData]   = useState(null);   // catch being edited
  const [saving,   setSaving]     = useState(false);

  /* ------------ fetch ------------- */
  const fetchCatches = async () => {
    setLoading(true); setError('');
    const token = localStorage.getItem('token');
    if (!token) { setError('Not logged in'); setLoading(false); return; }
    try {
      const res  = await fetch('/catches', { headers:{ Authorization:'Bearer '+token }});
      const data = await res.json();
      if (res.ok) setCatches(data.catches || []);
      else        setError(data.msg || 'Failed to load catches');
    } catch { setError('Network error'); }
    setLoading(false);
  };
  useEffect(()=>{ fetchCatches(); },[]);

  /* ------------ delete ------------- */
  const handleDelete = async id => {
    const token = localStorage.getItem('token'); if (!token) return;
    if (!window.confirm('Delete this catch?')) return;
    try{
      const res  = await fetch(`/catches/${id}`,{
        method:'DELETE', headers:{ Authorization:'Bearer '+token }
      });
      if(res.ok) setCatches(catches.filter(c=>c.id!==id));
      else alert('Failed to delete catch');
    }catch{ alert('Network error'); }
  };

  /* ------------ edit helpers ------------- */
  const openEdit  = c => { setEditData({ ...c }); setShowEdit(true); };
  const closeEdit = () => { if(!saving) setShowEdit(false); };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditData(d => ({ ...d, [name]: name==='mpesa_code'?value.toUpperCase():value }));
  };

  const editValid = editData && {
    species : editData.species.trim().length>1,
    quantity: isPosNumber(editData.quantity),
    price   : isPosNumber(editData.price),
    buyer   : editData.buyer.trim().length>1,
    mpesa   : !editData.mpesa_code || mpesaPattern.test(editData.mpesa_code)
  };
  const editOK = editData && Object.values(editValid).every(Boolean);

  const saveEdit = async () => {
    if(!editOK) return;
    setSaving(true);
    const token = localStorage.getItem('token');
    try{
      const res = await fetch(`/catches/${editData.id}`,{
        method:'PUT',
        headers:{ 'Content-Type':'application/json',
                  Authorization:'Bearer '+token },
        body: JSON.stringify({
          species    : editData.species,
          quantity   : Number(editData.quantity),
          price      : Number(editData.price),
          buyer      : editData.buyer,
          mpesa_code : editData.mpesa_code
        })
      });
      if(res.ok){
        /* update row locally */
        setCatches(list => list.map(r=>r.id===editData.id? editData : r));
        setToast({ show:true, msg:'Catch updated', variant:'success' });
        setShowEdit(false);
      }else{
        const data = await res.json();
        setToast({ show:true, msg:data.msg||'Update failed', variant:'danger' });
      }
    }catch{ setToast({ show:true, msg:'Network error', variant:'danger' }); }
    setSaving(false);
  };

  /* ------------ rendering ------------- */
  if (loading) return <p>Loading…</p>;
  if (error)   return <p className="text-danger">{error}</p>;
  if (!catches.length) return <p>No catches logged yet.</p>;

  return (
    <>
      {/* toast */}
      <ToastContainer className="toast-container">
        <Toast bg={toast.variant} show={toast.show} onClose={()=>setToast({...toast,show:false})}>
          <Toast.Body className="text-white">{toast.msg}</Toast.Body>
        </Toast>
      </ToastContainer>

      <h2 className="mb-4">Catch History</h2>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead className="table-primary">
            <tr>
              <th>Date</th><th>Species</th><th>Qty (kg)</th><th>Price&nbsp;(KES)</th>
              <th>Buyer</th><th>M-Pesa</th><th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {catches.map(c=>(
              <tr key={c.id}>
                <td>{new Date(c.date).toLocaleString()}</td>
                <td>{c.species}</td>
                <td>{c.quantity}</td>
                <td>{c.price}</td>
                <td>{c.buyer}</td>
                <td>{c.mpesa_code || '—'}</td>
                <td className="text-end table-actions">
                  <button className="btn btn-sm btn-primary me-2"
                          onClick={()=>openEdit(c)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger"
                          onClick={()=>handleDelete(c.id)}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============ EDIT MODAL ============ */}
      <Modal show={showEdit} onHide={closeEdit} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Edit Catch</Modal.Title>
        </Modal.Header>
        {editData && (
          <Modal.Body>
            {/* Species */}
            <Form.Group className="mb-3">
              <Form.Label>Species</Form.Label>
              <Form.Control
                name="species" value={editData.species}
                onChange={handleEditChange}
                isInvalid={!editValid.species}
              />
            </Form.Group>

            {/* Quantity */}
            <Form.Group className="mb-3">
              <Form.Label>Quantity (kg)</Form.Label>
              <Form.Control
                name="quantity" type="number" step="0.1"
                value={editData.quantity}
                onChange={handleEditChange}
                isInvalid={!editValid.quantity}
              />
            </Form.Group>

            {/* Price */}
            <Form.Group className="mb-3">
              <Form.Label>Price per kg (KES)</Form.Label>
              <Form.Control
                name="price" type="number" step="0.1"
                value={editData.price}
                onChange={handleEditChange}
                isInvalid={!editValid.price}
              />
            </Form.Group>

            {/* Buyer */}
            <Form.Group className="mb-3">
              <Form.Label>Buyer</Form.Label>
              <Form.Control
                name="buyer" value={editData.buyer}
                onChange={handleEditChange}
                isInvalid={!editValid.buyer}
              />
            </Form.Group>

            {/* Mpesa */}
            <Form.Group>
              <Form.Label>
                M-Pesa Code&nbsp; <small className="text-muted">(optional)</small>
              </Form.Label>
              <Form.Control
                name="mpesa_code" value={editData.mpesa_code || ''}
                onChange={handleEditChange}
                isInvalid={!editValid.mpesa}
                maxLength={13}
              />
              <Form.Text muted>10–13 letters / digits</Form.Text>
            </Form.Group>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEdit} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveEdit} disabled={!editOK || saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
