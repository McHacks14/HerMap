import React, { useState } from 'react';

interface PlaceFormProps {
  lng: number;
  lat: number;
  onSubmit: (data: { lng: number; lat: number; title: string; description: string }) => void;
  onClose: () => void;
}

const PlaceForm: React.FC<PlaceFormProps> = ({ lng, lat, onSubmit, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ lng, lat, title, description });
    onClose();
  };

  return (
    <div className="place-form">
      <form onSubmit={handleSubmit}>
        <h3>Add a new place</h3>
        <label>
          Title:
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Description:
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </label>
        <button type="submit">Submit</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default PlaceForm;