import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import './ImageUploader.css';

interface ImageUploaderProps {
  onImageUpload: (image: string | null) => void;
  imageData: string | null;
  label: string,
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imageData, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onImageUpload(base64);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Molimo Vas objavite validnu sliku (max 5MB).');
    }
  };

  const handleRemove = () => {
    onImageUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-uploader-wrapper">

      <div className='image-uploader-label-div'>
        <label className="image-uploader-label">{label ?? "Poster"}</label>
      </div>

      <div className="image-uploader-box">
        {imageData ? (
          <div className="image-container">
            <img src={imageData} alt="Objavljeno" className="uploaded-image" />
            <Button
              type='button'
              icon="pi pi-trash"
              className="remove-button p-button-rounded p-button-danger"
              onClick={handleRemove}
              aria-label="Remove"
            />
          </div>
        ) : (
          <>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              className="upload-button"
            >
              Dodaj Poster
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
