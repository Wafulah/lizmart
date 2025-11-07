'use client';

import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const COLORS = {
  primary: '#1A7431',
  secondary: '#FFC600',
  accent: '#653100',
  background: '#FFFFFF',
  textDark: '#111827',
  textMuted: '#6B7280',
  borderGray: '#E5E7EB',
  bgLight: '#F9FAFB',
};

type OrderItem = { name: string; quantity: number; price: number };
type Order = {
  id: string;
  restaurant: string;
  items: OrderItem[];
  orderDate: string;
  total: number;
  status: 'active' | 'past';
};

const MOCK_PAST_ORDERS: Order[] = [
  {
    id: '1',
    restaurant: 'Kazi Farms Kitchen Tajmohol Road',
    items: [{ name: 'Spicy Chicken', quantity: 2, price: 4.0 }],
    orderDate: '15 May, 2023',
    total: 4.0,
    status: 'past',
  },
  {
    id: '2',
    restaurant: 'Mama Mia Pizzeria',
    items: [{ name: 'Margherita', quantity: 1, price: 6.5 }],
    orderDate: '01 Jun, 2023',
    total: 8.0,
    status: 'past',
  },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const activeOrders: Order[] = [];
  const pastOrders = MOCK_PAST_ORDERS;

  return (
    <div style={{ background: COLORS.bgLight, minHeight: '100vh', padding: '40px 20px' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 1100,
          margin: '0 auto',
          background: COLORS.background,
          boxShadow: '0 6px 18px rgba(16,24,40,0.06)',
          borderRadius: 12,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header />

        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div style={{ overflowY: 'auto', flexGrow: 1, background: COLORS.background, padding: 16 }}>
          {activeTab === 'active' && <ActiveOrders orders={activeOrders} />}
          {activeTab === 'past' && <PastOrders orders={pastOrders} />}
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: `1px solid ${COLORS.borderGray}`,
        background: COLORS.background,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ArrowLeft size={20} color={COLORS.textDark} />
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: COLORS.textDark }}>My Orders</h1>
      </div>

      <div style={{ flex: 1 }} />

      {/* removed avatar / round placeholder as requested */}
    </div>
  );
}

function TabBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: 'active' | 'past';
  setActiveTab: (tab: 'active' | 'past') => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 24,
        padding: '12px 20px',
        borderBottom: `1px solid ${COLORS.borderGray}`,
        background: COLORS.background,
      }}
    >
      {['active', 'past'].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab as 'active' | 'past')}
          style={{
            paddingBottom: 8,
            paddingTop: 8,
            borderBottom: activeTab === tab ? `3px solid ${COLORS.primary}` : '3px solid transparent',
            fontWeight: activeTab === tab ? 700 : 500,
            color: activeTab === tab ? COLORS.primary : COLORS.textMuted,
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          {tab === 'active' ? 'Active Orders' : 'Past Orders'}
        </button>
      ))}
    </div>
  );
}

function ActiveOrders({ orders }: { orders: Order[] }) {
  if (!orders.length)
    return (
      <div style={{ padding: 24 }}>
        <div
          style={{
            background: 'rgba(255,198,0,0.04)',
            padding: 28,
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <ShoppingCart size={48} strokeWidth={1} color={COLORS.primary} />
          <p style={{ color: COLORS.textMuted, fontWeight: 500, textAlign: 'center' }}>
            You have no active orders.
          </p>
        </div>
      </div>
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function PastOrders({ orders }: { orders: Order[] }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: 16,
        borderRadius: 12,
        background: COLORS.background,
        border: `1px solid ${COLORS.borderGray}`,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 8,
          background: '#F3F4F6',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.textMuted,
          fontSize: 12,
        }}
      >
        {/* placeholder image area */}
        <img src="/1.webp" alt={order.items[0]?.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.textDark }}>{order.restaurant}</h3>
        <p style={{ margin: '8px 0 0 0', color: COLORS.textMuted, fontSize: 14 }}>
          {order?.items[0]?.quantity}x {order?.items[0]?.name}
        </p>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, color: COLORS.primary, fontWeight: 800, fontSize: 16 }}>${order.total.toFixed(2)}</p>
            <p style={{ margin: '4px 0 0 0', color: COLORS.textMuted, fontSize: 12 }}>Order date: {order.orderDate}</p>
          </div>

          <div>
            <Link
              href={`/orders/${order.id}`}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: 'transparent',
                color: COLORS.primary,
                fontWeight: 700,
                border: `1px solid ${COLORS.primary}`,
                textDecoration: 'none',
              }}
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
