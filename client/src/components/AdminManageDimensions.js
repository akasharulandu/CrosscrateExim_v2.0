import React, { useState } from 'react';
import axios from 'axios';

const AdminManageDimensions = ({ productId, initialDimensions = [] }) => {
  const [dimensions, setDimensions] = useState(initialDimensions);

  const addRow = () => {
    setDimensions([
      ...dimensions,
      { ref: '', grade: '', length: '', width: '', height: '', recommendedFor: '', extraOptions: '' }
    ]);
  };

  const updateRow = (index, field, value) => {
    const updated = [...dimensions];
    updated[index][field] = value;
    setDimensions(updated);
  };

  const saveDimensions = async () => {
    try {
      await axios.put(`/api/product/${productId}/dimensions`, { dimensions }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('✅ Dimensions updated successfully!');
    } catch (err) {
      console.error(err);
      alert('❌ Failed to update dimensions');
    }
  };

  return (
    <div className="p-3 border rounded bg-light my-3">
      <h5 className="mb-3">Manage Dimensions</h5>
      {dimensions.map((row, idx) => (
        <div key={idx} className="row mb-3">
          {Object.keys(row).map((key) => (
            <div className="col-md-3 mb-2" key={key}>
              <input
                type="text"
                className="form-control"
                placeholder={key}
                value={row[key]}
                onChange={(e) => updateRow(idx, key, e.target.value)}
              />
            </div>
          ))}
        </div>
      ))}
      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={addRow}>
          ➕ Add Row
        </button>
        <button className="btn btn-success" onClick={saveDimensions}>
          💾 Save
        </button>
      </div>
    </div>
  );
};

export default AdminManageDimensions;
