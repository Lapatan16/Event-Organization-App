import React, { useRef } from 'react';

interface Props {
  image: string | null; // current image (URL or base64)
  onImageChange: (file: File, previewUrl: string) => void;
  disabled: boolean,
}

const ProfilePictureUploader: React.FC<Props> = ({ image, onImageChange, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.imageWrapper}>
        <img
          src={
            image ||
            'https://www.w3schools.com/howto/img_avatar.png'
          }
          alt="Profile"
          style={styles.image}
        />
        <div style={styles.iconWrapper} onClick={handleClick}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/685/685655.png"
            alt="Upload"
            style={styles.icon}
          />
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageChange}
        disabled={disabled}
      />
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '0px',
  },
  imageWrapper: {
    position: 'relative',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid #ccc',
    aspectRatio: '1 / 1',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  iconWrapper: {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    padding: '6px',
    cursor: 'pointer',
    border: '1px solid #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: '18px',
    height: '18px',
  },
};

export default ProfilePictureUploader;
