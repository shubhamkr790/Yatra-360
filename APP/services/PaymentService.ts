import { toast } from 'sonner-native';

const MERCHANT_ID = 'YOUR_MERCHANT_ID';
const MERCHANT_KEY = 'YOUR_MERCHANT_KEY';
const WEBSITE = 'DEFAULT';
const INDUSTRY_TYPE = 'Retail';
const CHANNEL_ID = 'WAP';
const CALLBACK_URL = 'https://securegw.paytm.in/theia/paytmCallback';

interface PaymentDetails {
  orderId: string;
  customerId: string;
  amount: number;
  email: string;
  phone: string;
}

export const initiatePayment = async (details: PaymentDetails) => {
  try {
    // Create order on your backend
    const orderPayload = {
      MID: MERCHANT_ID,
      ORDER_ID: details.orderId,
      CUST_ID: details.customerId,
      INDUSTRY_TYPE_ID: INDUSTRY_TYPE,
      CHANNEL_ID: CHANNEL_ID,
      TXN_AMOUNT: details.amount.toString(),
      WEBSITE: WEBSITE,
      CALLBACK_URL: CALLBACK_URL,
      EMAIL: details.email,
      MOBILE_NO: details.phone
    };

    // Call your backend API to generate checksum and get payment URL
    const response = await fetch('YOUR_BACKEND_URL/initiate-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        paymentUrl: data.paymentUrl,
        orderId: details.orderId
      };
    } else {
      throw new Error('Failed to initiate payment');
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    toast.error('Payment initiation failed');
    return {
      success: false,
      error: 'Payment initiation failed'
    };
  }
};

export const verifyPayment = async (orderId: string) => {
  try {
    const response = await fetch('YOUR_BACKEND_URL/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Payment verification error:', error);
    toast.error('Payment verification failed');
    return {
      success: false,
      error: 'Payment verification failed'
    };
  }
};

export const generateOrderId = () => {
  return `ORDER_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};