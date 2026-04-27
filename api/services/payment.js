const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Payment Service — SSLCommerz & NOWPayments Integration
 * 
 * Handles communication with local and international payment gateways.
 */
class PaymentService {
  constructor() {
    this.sslStoreId = process.env.SSLCOMMERZ_STORE_ID;
    this.sslStorePass = process.env.SSLCOMMERZ_STORE_PASSWORD;
    this.isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';
    this.sslBaseUrl = this.isLive 
      ? 'https://securepay.sslcommerz.com' 
      : 'https://sandbox.sslcommerz.com';
  }

  /**
   * Initialize SSLCommerz session
   */
  async initSSLCommerz({ transactionId, totalAmount, customerName, customerEmail }) {
    try {
      const data = new URLSearchParams();
      data.append('store_id', this.sslStoreId);
      data.append('store_passwd', this.sslStorePass);
      data.append('total_amount', totalAmount.toString());
      data.append('currency', 'BDT');
      data.append('tran_id', transactionId);
      data.append('success_url', `${process.env.API_BASE_URL}/payment/callback/sslcommerz/success`);
      data.append('fail_url', `${process.env.API_BASE_URL}/payment/callback/sslcommerz/fail`);
      data.append('cancel_url', `${process.env.API_BASE_URL}/payment/callback/sslcommerz/cancel`);
      data.append('ipn_url', `${process.env.API_BASE_URL}/payment/callback/sslcommerz/ipn`);
      
      data.append('cus_name', customerName || 'ReadyPI User');
      data.append('cus_email', customerEmail);
      data.append('cus_add1', 'Sylhet, Bangladesh');
      data.append('cus_city', 'Sylhet');
      data.append('cus_country', 'Bangladesh');
      data.append('cus_phone', '01700000000');
      
      data.append('shipping_method', 'NO');
      data.append('product_name', 'ReadyPI Credits');
      data.append('product_category', 'Software');
      data.append('product_profile', 'non-physical-goods');

      logger.info('Initializing SSLCommerz payment', { transactionId, totalAmount });

      const response = await axios.post(`${this.sslBaseUrl}/gwprocess/v4/api.php`, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.status === 'SUCCESS') {
        return {
          gatewayUrl: response.data.GatewayPageURL,
          sessionkey: response.data.sessionkey
        };
      } else {
        logger.error('SSLCommerz init failed', response.data);
        throw new Error(response.data.failedreason || 'SSLCommerz initialization failed');
      }
    } catch (error) {
      logger.error('SSLCommerz error:', error);
      throw error;
    }
  }

  /**
   * Validate SSLCommerz payment
   */
  async validateSSLCommerz(valId) {
    try {
      const url = `${this.sslBaseUrl}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${this.sslStoreId}&store_passwd=${this.sslStorePass}&format=json`;
      
      const response = await axios.get(url);
      
      if (response.data.status === 'VALID' || response.data.status === 'AUTHENTICATED') {
        return response.data;
      } else {
        logger.warn('SSLCommerz validation failed', response.data);
        return null;
      }
    } catch (error) {
      logger.error('SSLCommerz validation error:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
