import { MAX_IMAGE_WIDTH, IMAGE_QUALITY } from '../constants';

export const handleFileUpload = (file, callback) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = img.width > MAX_IMAGE_WIDTH ? MAX_IMAGE_WIDTH / img.width : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
      callback(compressed);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};