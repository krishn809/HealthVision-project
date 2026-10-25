import { Resend } from 'resend';

export const sendEmail = async (options) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    });

    if (error) {
        console.error('Resend error:', error);
        throw new Error(error.message);
    }

    console.log('\n================ EMAIL SENT ================');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`ID:      ${data.id}`);
    console.log('============================================\n');
};