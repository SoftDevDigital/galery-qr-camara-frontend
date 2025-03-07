'use client';

import { useRef, useState } from 'react';
import Webcam from 'react-webcam';

// Función para convertir base64 a File
async function base64ToFile(base64String: string, filename: string, mimeType: string): Promise<File | null> {
  /**
   * Convierte una cadena Base64 a un objeto File.
   *
   * @param base64String - La cadena Base64 que representa la imagen.
   * @param filename - El nombre que deseas darle al archivo.
   * @param mimeType - El tipo MIME de la imagen (ej: 'image/png', 'image/jpeg').
   * @returns Un objeto File o null si ocurre un error.
   */
  try {
    const response = await fetch(base64String);
    const blob = await response.blob();
    return new File([blob], filename, { type: mimeType });
  } catch (error) {
    console.error('Error al convertir Base64 a File:', error);
    return null;
  }
}

const Camera: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [flash, setFlash] = useState<boolean>(false);

  const takePhoto = () => {
    if (webcamRef.current) {
      const photoData = webcamRef.current.getScreenshot();
      if (photoData) {
        setFlash(true);
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        audio.play();

        setPhoto(photoData); // photoData es un string base64 (data:image/png;base64,...)
        setTimeout(() => setFlash(false), 200);
      }
    }
  };

  const discardPhoto = () => {
    setPhoto(null);
  };

  const savePhoto = async () => {
    if (!photo) {
      console.log('No hay foto para guardar');
      return;
    }

    try {
      const filename = 'captura.png';
      const mimeType = 'image/png';

      const file = await base64ToFile(photo, filename, mimeType);
      if (!file) {
        console.error('No se pudo convertir la imagen a File');
        return;
      }

      const formData = new FormData();
      formData.append('image', file); // Campo 'image' coincide con multer en el backend

      const response = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData, // fetch configura Content-Type automáticamente como multipart/form-data con boundary
      });

      if (response.ok) {
        const data: { message: string; location: string } = await response.json();
        setPhoto(null); // Limpia la foto tras éxito
      } else {
        console.error('Error en la respuesta:', response.status, await response.text());
      }
    } catch (err) {
      console.error('Error al guardar la foto:', err);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {photo ? (
        <>
          <img src={photo} alt="Foto capturada" />
          <button
            onClick={discardPhoto}
            style={{
              padding: '10px 20px',
              margin: '10px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Descartar
          </button>
          <button
            onClick={savePhoto}
            style={{
              padding: '10px 20px',
              margin: '10px',
              backgroundColor: '#44ff44',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Guardar
          </button>
        </>
      ) : (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            videoConstraints={{
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }}
          />
          <button
            onClick={takePhoto}
            style={{
              padding: '10px 20px',
              margin: '10px',
              backgroundColor: '#4444ff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Capturar Foto
          </button>
        </>
      )}
      {flash && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            opacity: 0.8,
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};

export default Camera;