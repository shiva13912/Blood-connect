import { storage } from '../config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const storageService = {
  uploadProfileImage: async (file, donorName) => {
    try {
      const uniqueFileName = `${donorName.replace(/\s+/g, '_')}_${Date.now()}`;
      const storageRef = ref(storage, `profile_images/${uniqueFileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image to Firebase Storage:', error);
      throw error;
    }
  }
};
