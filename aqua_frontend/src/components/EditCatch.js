// src/components/EditCatch.js
import React, { useState, useEffect } from 'react';

function EditCatch({ catchId, onDone }) {
  const [species, setSpecies] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [buyer, setBuyer] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch existing data for the catch
    const token = localStorage.getItem('token');
    fetch(`/catches`, {
      headers: { "Authorization": "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => {
        const c = data.catches.find(item => item.id === catchId);
        if (c) {
          setSpecies(c.species); setQuantity(c.quantity); setPrice(c.price); setBuyer(c.buyer);
        }
      });
  }, [catchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/catches/${catchId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ species, quantity: Number(quantity), price: Number(price), buyer })
      });
      if (response.ok) {
        setMessage("✅ Catch updated.");
        if (onDone) onDone();
      } else {
        const data = await response.json();
        setMessage("❌ " + (data.msg || "Update failed"));
      }
    } catch (err) {
      console.error("Error updating catch:", err);
      setMessage("❌ Network error.");
    }
  };

  return (
    <div className="edit-catch-form">
      <h2>Edit Catch</h2>
      <form onSubmit={handleSubmit}>
        {/* similar fields as LogCatch */}
        <div>
          <label>Species:</label><br/>
          <input type="text" value={species} onChange={e => setSpecies(e.target.value)} required />
        </div>
        {/* ... Quantity, Price, Buyer fields similarly ... */}
        <button type="submit">Save Changes</button>
        <button type="button" onClick={onDone}>Cancel</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default EditCatch;
