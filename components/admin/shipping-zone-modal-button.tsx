'use client';

import { useState } from 'react';
import { Plus, Edit } from 'lucide-react';
import { ShippingZoneModal } from './shipping-zone-modal';

interface ShippingZoneModalButtonProps {
  isEdit: boolean;
  zone: any;
}

export function ShippingZoneModalButton({ isEdit, zone }: ShippingZoneModalButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="admin-btn admin-btn-primary"
      >
        {isEdit ? <Edit size={16} /> : <Plus size={16} />}
        {isEdit ? '' : ' Thêm khu vực'}
      </button>
      <ShippingZoneModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        zone={zone}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
