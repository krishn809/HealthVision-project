import crypto from "crypto";

export const verifyPaymentSignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");
    return generatedSignature === razorpay_signature;
};