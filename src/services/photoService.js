import { supabase } from '../lib/supabase';
import exifr from 'exifr';

export const photoService = {
    // 1. Upload Batch
    async uploadPhotos(albumId, userId, files) {
        const uploads = files.map(async (file) => {
            // A. Upload to Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${albumId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('photos')
                .upload(fileName, file);

            if (uploadError) {
                console.error("Upload failed", uploadError);
                return null;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('photos')
                .getPublicUrl(fileName);

            // B. Extract Metadata
            let takenAt = new Date();
            let width = 0;
            let height = 0;

            try {
                // exifr can give dimensions too?
                // For now just date.
                const meta = await exifr.parse(file);
                if (meta?.DateTimeOriginal) {
                    takenAt = new Date(meta.DateTimeOriginal);
                } else {
                    takenAt = new Date(file.lastModified);
                }
            } catch (e) {
                console.warn("Metadata extraction failed", e);
            }

            // C. Insert to DB
            return {
                album_id: albumId,
                user_id: userId,
                url: publicUrl,
                storage_path: fileName,
                taken_at: takenAt,
                // width, height (optional optimization for layout)
            };
        });

        const results = await Promise.all(uploads);
        const validResults = results.filter(r => r !== null);

        if (validResults.length > 0) {
            const { data, error } = await supabase
                .from('photos')
                .insert(validResults)
                .select();
            if (error) throw error;
            return data;
        }
        return [];
    },

    // 2. Get Photos (Metadata only)
    async getPhotos(albumId) {
        const { data, error } = await supabase
            .from('photos')
            .select('*')
            .eq('album_id', albumId)
            .order('taken_at', { ascending: true });

        if (error) throw error;

        // Transform for app usage?
        // App expects: { id, url, date: "Month DD, YYYY" }
        // We can do this transformation here or in the component.
        // Let's return raw data to keep service pure.
        return data;
    },

    // 3. Delete a photo
    async deletePhoto(photoId, storagePath) {
        if (storagePath) {
            const { error: storageError } = await supabase.storage
                .from('photos')
                .remove([storagePath]);
            if (storageError) console.error("Storage delete failed:", storageError);
        }

        const { error } = await supabase
            .from('photos')
            .delete()
            .eq('id', photoId);

        if (error) throw error;
    },

    // 4. Update description
    async updatePhotoDescription(photoId, description) {
        const { data, error } = await supabase
            .from('photos')
            .update({ description })
            .eq('id', photoId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // 5. Add Comment
    async addComment(photoId, userId, message) {
        const { data, error } = await supabase
            .from('photo_comments')
            .insert([{ photo_id: photoId, user_id: userId, message }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // 6. Get Comments
    async getComments(photoId) {
        const { data, error } = await supabase
            .from('photo_comments')
            .select('*')
            .eq('photo_id', photoId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    async getUsername(userId) {
        const { data, error } = await supabase.rpc('get_username', { target_user_id: userId });
        if (error) return "User";
        return data;
    }
};
