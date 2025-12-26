import { supabase } from '../lib/supabase';

export const albumService = {
    // 1. Create a new album
    async createAlbum(title, ownerId) {
        const { data, error } = await supabase
            .from('albums')
            .insert([{ title, owner_id: ownerId }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // 2. Get albums user has access to
    async getMyAlbums() {
        const { data, error } = await supabase
            .from('albums')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // 3. Get album details
    async getAlbum(albumId) {
        const { data, error } = await supabase
            .from('albums')
            .select('*')
            .eq('id', albumId)
            .single();
        if (error) throw error;
        return data;
    },

    // 4. Add Member (Smart)
    async addMember(albumId, email) {
        // Validation: Check locally first to give fast feedback?
        // Or just let the RPC handle it.
        // Let's call the RPC which handles looking up UserID if they exist.

        const { data, error } = await supabase
            .rpc('add_album_member', {
                target_album_id: albumId,
                target_email: email
            });

        if (error) {
            // Handle unique violation 23505
            if (error.code === '23505') {
                throw new Error("User is already a member of this album.");
            }
            throw error;
        }
        return data;
    },

    // 5. Remove member
    async removeMember(albumId, { userId, email }) {
        let query = supabase.from('album_members').delete();

        if (userId) {
            query = query.match({ album_id: albumId, user_id: userId });
        } else if (email) {
            query = query.match({ album_id: albumId, user_email: email });
        } else {
            throw new Error("Must provide userId or email to remove member.");
        }

        const { error } = await query;
        if (error) throw error;
    },

    // 6. Get members of an album (Secure RPC)
    async getMembers(albumId) {
        const { data, error } = await supabase.rpc('get_album_members_secure', { target_album_id: albumId });
        if (error) throw error;
        return data;
    },

    // 7. Get user profile (Secure RPC for Email)
    async getProfile(userId) {
        const { data: email, error } = await supabase.rpc('get_user_email_secure', { target_user_id: userId });
        if (error || !email) return null;
        return { email };
    }
};
