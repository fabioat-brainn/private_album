import React, { useState, useEffect } from 'react';
import PortalModal from '../common/PortalModal';
import { albumService } from '../../services/albumService';
import { X, Trash2, UserPlus, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ManagePeopleModal = ({ isOpen, onClose, albumId }) => {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [members, setMembers] = useState([]);
    const [ownerId, setOwnerId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && albumId) {
            loadData();
        }
    }, [isOpen, albumId]);

    const loadData = async () => {
        try {
            const [membersData, albumData] = await Promise.all([
                albumService.getMembers(albumId),
                albumService.getAlbum(albumId)
            ]);

            const realOwnerId = albumData?.owner_id;
            setOwnerId(realOwnerId);

            // Fetch Owner Details
            let ownerEmail = "Album Owner"; // Fallback
            if (user && realOwnerId === user.id) {
                ownerEmail = user.email;
            } else if (realOwnerId) {
                // We added getProfile to service, ensure it works or handle null
                const profile = await albumService.getProfile(realOwnerId);
                if (profile && profile.email) ownerEmail = profile.email;
            }

            const ownerObj = {
                id: 'owner-display',
                user_id: realOwnerId,
                user_email: ownerEmail,
                role: 'owner'
            };

            // Filter owner out of members to avoid duplicates if they were somehow added
            const otherMembers = (membersData || []).filter(m => m.user_id !== realOwnerId);

            setMembers([ownerObj, ...otherMembers]);
        } catch (err) {
            console.error("Failed to load data", err);
        }
    };

    const isOwner = user?.id === ownerId;

    const handleAddMember = async (e) => {
        e.preventDefault();
        const emailTrimmed = email.trim();
        if (!emailTrimmed) return;

        if (emailTrimmed.toLowerCase() === user.email.toLowerCase()) {
            setError("You cannot invite yourself.");
            return;
        }

        setLoading(true);
        setError('');
        try {
            await albumService.addMember(albumId, emailTrimmed);
            setEmail('');
            await loadData(); // Reload to see new member
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (member) => {
        if (!window.confirm(`Remove ${member.user_email}?`)) return;
        try {
            await albumService.removeMember(albumId, { userId: member.user_id, email: member.user_email });
            await loadData();
        } catch (err) {
            alert("Failed to remove: " + err.message);
        }
    };

    return (
        <PortalModal isOpen={isOpen} onClose={onClose}>
            <div style={{
                // Match Ribbon Texture
                background: `
                    repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px),
                    var(--color-ribbon)
                `,
                padding: '2rem',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
                color: '#fff',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginTop: 0, fontFamily: 'var(--font-display)', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>Manage Shared Access</h2>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
                    Invite friends to view and contribute to this album.
                </p>

                {error && <div style={{ color: '#ff9999', marginBottom: '1rem', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '4px' }}>{error}</div>}

                {/* Only Owner can invite people? Or members too? Usually only owner. Let's assume Owner only for now based on "users who aren't the owner can still perform this" */}
                {/* Actually, user said "users who aren't owner can still perform THIS (remove)". Adding might be open? */}
                {/* But usually invites are restricted. Let's check RLS. "Owner manages members" for insert. member for Select. */}
                {/* So Non-owners CANNOT insert. UI should hide form. */}
                {isOwner ? (
                    <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                        <input
                            type="email"
                            placeholder="Enter friend's email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="passcode-input" // Reusing cover input style class for placeholder if available
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'white'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                background: 'var(--color-gold)',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontWeight: 'bold',
                                color: '#333'
                            }}
                        >
                            <UserPlus size={18} /> {loading ? 'Wait...' : 'Invite'}
                        </button>
                    </form>
                ) : (
                    <div style={{ marginBottom: '2rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>
                        Only the album owner can invite new members.
                    </div>
                )}

                <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>Current Members</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {members.length === 0 && <li style={{ padding: '10px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>No other members yet.</li>}

                    {members.map(member => (
                        <li key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <div>
                                <div style={{ fontWeight: '500' }}>{member.user_email}</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                                    {member.role === 'owner' && <Crown size={14} fill="var(--color-gold)" color="var(--color-gold)" style={{ marginRight: '6px', transform: 'translateY(1px)' }} />}
                                    Role: {member.role}
                                    {user && member.user_id === user.id && " (You)"}
                                </div>
                            </div>

                            {/* Remove Button: Only if Owner (and not removing self? or maybe removing self is 'Leave'?) */}
                            {/* Assuming Owner manages others. */}
                            {isOwner && member.user_id !== user.id && (
                                <button
                                    onClick={() => handleRemoveMember(member)}
                                    title="Remove User"
                                    style={{ background: 'none', border: 'none', color: '#ff6666', cursor: 'pointer', padding: '5px' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </PortalModal>
    );
};

export default ManagePeopleModal;
