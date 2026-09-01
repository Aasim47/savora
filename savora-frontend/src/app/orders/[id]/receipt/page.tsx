"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { TOKEN_KEY_CUSTOMER } from "@/lib/axios";
import { formatCurrency } from "@/utils/currency";
import { io } from "socket.io-client";
import { QRCodeSVG } from "qrcode.react";

export default function ReceiptPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();

    // Socket.io Setup
    const token = localStorage.getItem(TOKEN_KEY_CUSTOMER);
    let userId = "";
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.id;
      } catch(e) {}
    }

    const socketURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000";
    const socket = io(socketURL);

    socket.on("connect", () => {
      if (userId) {
        socket.emit("join", `user_${userId}`);
      }
    });

    socket.on("order-updated", (updatedOrder: any) => {
      if (updatedOrder.id === id) {
        setOrder(updatedOrder);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (order) {
      // Small delay to ensure rendering is complete before popping up print dialog
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [order]);

  if (loading) return <div className="p-10 text-center font-mono text-sm">Loading receipt...</div>;
  if (!order) return <div className="p-10 text-center font-mono text-sm">Order not found</div>;

  const upiId = order.restaurantUpiId || order.restaurant?.upiId || "bhojanwale@okaxis";
  const payeeName = order.restaurantLegalName || order.restaurant?.name || "Bhojanwale Restaurant";
  const orderAmount = Number(order.totalAmount || 0).toFixed(2);
  const shortOrderId = order.id ? order.id.split('-')[0] : "";
  const upiPaymentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${orderAmount}&cu=INR&tn=${encodeURIComponent(`Bill Order ${shortOrderId}`)}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { 
            background: white !important; 
            margin: 0; 
            padding: 0; 
          }
          @page {
            margin: 0;
            size: 80mm auto; /* Standard thermal receipt size */
          }
          .no-print { display: none !important; }
        }
      `}} />
      
      {/* Controls for standard screen view */}
      <div className="no-print bg-surface border-b border-divider p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 shadow-sm">
        <button onClick={() => router.back()} className="px-4 py-2 bg-base border border-divider rounded-lg text-sm font-medium text-primary cursor-pointer">
          Back to Orders
        </button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer" style={{ color: "var(--base)" }}>
          Print / Save PDF
        </button>
      </div>

      {/* Thermal Receipt Layout */}
      <div className="font-mono text-black bg-white mx-auto mt-20 md:mt-24 p-6" style={{ maxWidth: "300px", minHeight: "100vh" }}>
        
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold uppercase mb-1">{order.restaurant?.name || "Bhojanwale Restaurant"}</h1>
          <p className="text-[11px] leading-tight text-gray-700">
            {order.restaurant?.address || "123 Food Street, Tasty City"}<br/>
            Phone: {order.restaurant?.phone || "+1 555-0123"}
          </p>
        </div>

        {/* Compliance Block — only if snapshotted data exists */}
        {(order.restaurantGstNumber || order.restaurantFssaiNumber) && (
          <div className="text-center mb-4 pb-3 border-b border-gray-200" style={{ lineHeight: '1.4' }}>
            {order.restaurantLegalName && (
              <p className="text-[13px] font-semibold text-gray-800">{order.restaurantLegalName}</p>
            )}
            {order.restaurantRegisteredAddress && (
              <p className="text-[11px] text-gray-500">{order.restaurantRegisteredAddress}</p>
            )}
            {order.restaurantGstNumber && (
              <p className="text-[11px] text-gray-600">GSTIN: {order.restaurantGstNumber}</p>
            )}
            {order.restaurantFssaiNumber && (
              <p className="text-[11px] text-gray-600">FSSAI Lic. No: {order.restaurantFssaiNumber}</p>
            )}
          </div>
        )}

        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

        {/* Order Info */}
        <div className="text-[11px] mb-4 space-y-1">
          <div className="flex justify-between">
            <span>Order No:</span>
            <span className="font-bold">{shortOrderId}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date(order.createdAt).toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" })} {new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer:</span>
            <span>{order.customerName || order.user?.name || "Walk-in"}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="uppercase">{order.status}</span>
          </div>
          {order.paymentStatus && (
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className={`font-semibold ${order.paymentStatus === 'PAID' ? 'text-green-700' : 'text-amber-700'}`}>
                {order.paymentStatus}
              </span>
            </div>
          )}
        </div>

        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

        {/* Items */}
        <div className="mb-4">
          <div className="flex justify-between text-[11px] font-bold border-b border-gray-300 pb-1 mb-2">
            <span className="w-8">QTY</span>
            <span className="flex-1">ITEM</span>
            <span className="text-right">AMT</span>
          </div>
          <div className="space-y-2">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-[11px] items-start">
                <span className="w-8">{item.quantity}</span>
                <span className="flex-1 pr-2">{item.menuItem?.name}</span>
                <span className="text-right">{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

        {/* Totals */}
        <div className="text-[12px] space-y-1 mb-4">
          <div className="flex justify-between mt-2">
            <span>SUBTOTAL:</span>
            <span>{formatCurrency(order.totalAmount - (order.deliveryFee || 0))}</span>
          </div>
          <div className="flex justify-between">
            <span>DELIVERY FEE:</span>
            <span>{formatCurrency(order.deliveryFee || 0)}</span>
          </div>
          <div className="flex justify-between font-bold text-[14px] mt-2 border-t border-gray-300 pt-2">
            <span>TOTAL:</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Dynamic UPI Payment QR Code Section */}
        <div className="border-t-2 border-dashed border-gray-300 pt-4 pb-2 my-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-2">
            Scan & Pay with UPI
          </p>

          <div className="bg-white p-2.5 inline-block border-2 border-black rounded-lg my-1 shadow-xs">
            <QRCodeSVG
              value={upiPaymentUri}
              size={135}
              level="M"
              includeMargin={false}
            />
          </div>

          <div className="mt-2 space-y-0.5">
            <p className="text-[12px] font-bold text-black">
              Amount: {formatCurrency(order.totalAmount)}
            </p>
            <p className="text-[9px] text-gray-600 font-medium">
              GPay • PhonePe • Paytm • BHIM • Cred
            </p>
            <p className="text-[9px] text-gray-500 truncate max-w-[240px] mx-auto">
              UPI: {upiId}
            </p>
          </div>
        </div>

        <div className="text-center text-[10px] text-gray-600 mt-4 mb-4">
          <p className="border-b border-gray-300 pb-2 mb-2 italic">Delivery Rule: First 2 km free, ₹10/km after</p>
          <p>Thank you for your order!</p>
          <p>Powered by Bhojanwale</p>
        </div>
        
        {/* Padding for printer cut */}
        <div className="h-12"></div>
      </div>
    </>
  );
}
