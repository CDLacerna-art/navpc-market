import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { CAMPUS_MEETUP_SPOTS } from '../../utils/constants';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import {
  Store,
  Save,
  CheckCircle,
  AlertCircle,
  Shield,
  MapPin,
  Lock,
} from 'lucide-react';

export default function SellerStoreSettingsPage() {
  const { user, profile } = useAuth();
  const sellerId = user?.id || profile?.id || 'demo-seller-001';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Store fields
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [pickupLocation, setPickupLocation] = useState(CAMPUS_MEETUP_SPOTS[0]);
  const [contactNote, setContactNote] = useState('');

  useEffect(() => {
    async function loadStore() {
      try {
        setLoading(true);
        const store = await productService.getSellerStore(sellerId);
        if (store) {
          setStoreName(store.store_name || `${profile?.full_name || 'Student'}'s Campus Shop`);
          setDescription(store.description || '');
          setPickupLocation(store.pickup_location || CAMPUS_MEETUP_SPOTS[0]);
          setContactNote(store.contact_note || '');
        } else {
          setStoreName(`${profile?.full_name || 'Student'}'s Campus Shop`);
        }
      } catch (err) {
        console.error('Failed to load store settings:', err);
        setError('Could not retrieve store settings.');
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, [sellerId, profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setError('Store name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await productService.updateSellerStore(sellerId, {
        store_name: storeName.trim(),
        description: description.trim(),
        pickup_location: pickupLocation,
        contact_note: contactNote.trim(),
      });

      setSuccess('Store profile updated successfully.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error('Error saving store profile:', err);
      setError(err.message || 'Failed to save store profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Spinner size="lg" />
        <p className="text-xs text-content-muted">Loading your store settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-content-heading">Store Profile & Settings</h1>
        <p className="text-xs text-content-muted">
          Customize how your campus store appears to students on NavPC Market.
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* PRIVACY DISCLOSURE */}
      <Card padding={true} className="bg-slate-50 border-ui-border">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-content-heading">Student Privacy Architecture</h4>
            <p className="text-xs text-content-body leading-relaxed">
              Your institutional email address (<strong>{profile?.email}</strong>) is kept strictly private by database Row Level Security. Only your custom Store Name, description, and proposed meetup spot are visible to other campus students on listing pages.
            </p>
          </div>
        </div>
      </Card>

      {/* FORM */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card padding={true} className="space-y-4">
          <h3 className="text-sm font-bold text-content-heading border-b border-ui-border pb-2">
            Store Identity
          </h3>

          <div>
            <label className="block text-xs font-semibold text-content-heading mb-1">
              Public Store Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Maria's NPC Campus Hub"
              className="w-full px-3 py-2 text-xs rounded-lg border border-ui-border focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none"
            />
            <p className="text-[10px] text-content-muted mt-1">
              This name is shown as the seller name on your product listings.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-heading mb-1">
              Store Bio / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell fellow NPC students what you specialize in (e.g. 3rd year BSIT textbooks, fresh baked cookies, drafting materials)..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-ui-border focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-heading mb-1">
              Default Proposed Meetup Zone (Subject to NPC School Approval)
            </label>
            <select
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-ui-border bg-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none text-content-body"
            >
              {CAMPUS_MEETUP_SPOTS.map((spot) => (
                <option key={spot} value={spot}>
                  {spot}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-heading mb-1">
              Campus Schedule & Availability Note (Optional)
            </label>
            <input
              type="text"
              value={contactNote}
              onChange={(e) => setContactNote(e.target.value)}
              placeholder="e.g. Available for handoffs Mondays and Wednesdays 1:00 PM – 4:00 PM at SAC"
              className="w-full px-3 py-2 text-xs rounded-lg border border-ui-border focus:ring-1 focus:ring-brand-blue focus:border-brand-blue outline-none"
            />
          </div>
        </Card>

        <div className="flex items-center justify-end space-x-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={saving}
            leftIcon={Save}
          >
            {saving ? 'Saving...' : 'Save Store Profile'}
          </Button>
        </div>
      </form>
    </div>
  );
}
