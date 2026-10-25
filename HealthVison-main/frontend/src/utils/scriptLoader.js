export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window.Razorpay === 'function') {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            // Check if Razorpay is a function after a small delay to ensure script has finished initializing
            setTimeout(() => {
                if (typeof window.Razorpay === 'function') {
                    resolve(true);
                } else {
                    console.error('Razorpay loaded but window.Razorpay is not a function');
                    resolve(false);
                }
            }, 50);
        };
        script.onerror = () => {
            console.error('Failed to load Razorpay script');
            resolve(false);
        };
        document.head.appendChild(script);
    });
};
