
import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, Organization } from '@/lib/data';
import { auth } from '@/lib/firebase';
import { randomBytes } from 'crypto';

// This is a placeholder for the real Pesapal integration.
// In a real application, you would use a library or fetch to call the Pesapal API.

export async function POST(request: Request) {
    // In a real app, you'd get the user from a session or verified token,
    // not directly from the client-side auth instance.
    // For this prototype, we'll assume the client has sent user information securely.
    
    // Let's simulate getting the user ID from a secure session/token.
    // Since we can't do that here, we'll have to rely on a less secure method for now.
    // const currentUser = auth.currentUser;
    // if (!currentUser) {
    //     return NextResponse.json({ error: 'You must be logged in to make a payment.' }, { status: 401 });
    // }
    
    // This is a placeholder for a secure way to get the user in a serverless environment.
    // We will proceed with a placeholder user for logic demonstration.
    const placeholderUserId = "usr_1"; // Assuming the Admin user for this prototype
    const placeholderOrgId = "org_1";

    try {
        const body = await request.json();
        const { plan, paymentMethod, phone } = body;

        // 1. Get user and organization details
        const userDoc = await getDoc(doc(db, 'users', placeholderUserId));
        if (!userDoc.exists()) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }
        const user = userDoc.data() as User;
        
        const orgDoc = await getDoc(doc(db, 'organizations', placeholderOrgId));
        if (!orgDoc.exists()) {
            return NextResponse.json({ error: 'Organization not found.' }, { status: 404 });
        }
        const organization = orgDoc.data() as Organization;

        // 2. Construct the Pesapal Order Request
        console.log(`Initiating payment for ${organization.name} (Org ID: ${placeholderOrgId})`);
        console.log(`Plan: ${plan}, Method: ${paymentMethod}, Phone: ${phone}`);

        const orderDetails = {
            id: `RF-${randomBytes(8).toString('hex').toUpperCase()}`, // Unique ID for the transaction
            currency: 'KES',
            amount: 2999.00, // Amount for the "Pro" plan
            description: `RequestFlow Pro Plan Subscription for ${organization.name}`,
            callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`, // URL user is redirected to after payment
            notification_id: process.env.PESAPAL_IPN_ID, // Your registered IPN ID on Pesapal
            billing_address: {
                email_address: user.email,
                phone_number: phone || user.phone,
                first_name: user.name.split(' ')[0],
                last_name: user.name.split(' ').slice(1).join(' ') || user.name.split(' ')[0],
            },
        };
        
        // In a real scenario, you would:
        // a. Get Pesapal API credentials from secure storage (e.g., environment variables).
        // b. Authenticate with Pesapal to get an access token.
        // c. Call Pesapal's "SubmitOrderRequest" endpoint with `orderDetails`.
        // const pesapalResponse = await pesapal.submitOrder(orderDetails);
        // const redirectUrl = pesapalResponse.redirect_url;
        
        // 3. Simulate the redirect URL from Pesapal for this prototype
        const simulatedRedirectUrl = `https://cybqa.pesapal.com/pesapaliframe/api/values/PostPesapalDirectOrderV4?OrderTrackingId=${orderDetails.id}`;

        console.log("Simulating Pesapal API call and redirecting to:", simulatedRedirectUrl);
        
        // This is where you would store the transaction details in your DB with a 'PENDING' status
        // so you can look it up when the IPN comes in.

        return NextResponse.json({ redirectUrl: simulatedRedirectUrl });

    } catch (error) {
        console.error("Error initiating payment:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
