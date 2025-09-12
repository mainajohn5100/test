
import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, Organization } from '@/lib/data';
import { auth } from '@/lib/firebase';
import { randomBytes } from 'crypto';

// This is a placeholder for the real Pesapal integration.
// In a real application, you would use a library or fetch to call the Pesapal API.

export async function POST(request: Request) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        return NextResponse.json({ error: 'You must be logged in to make a payment.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { plan, paymentMethod, phone } = body;

        // 1. Get user and organization details
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (!userDoc.exists()) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }
        const user = userDoc.data() as User;
        
        const orgDoc = await getDoc(doc(db, 'organizations', user.organizationId));
        if (!orgDoc.exists()) {
            return NextResponse.json({ error: 'Organization not found.' }, { status: 404 });
        }
        const organization = orgDoc.data() as Organization;

        // 2. Placeholder for Pesapal Logic
        console.log(`Initiating payment for ${organization.name} (Org ID: ${user.organizationId})`);
        console.log(`Plan: ${plan}, Method: ${paymentMethod}, Phone: ${phone}`);

        // In a real scenario, you would:
        // a. Get Pesapal API credentials from secure storage (e.g., environment variables).
        // b. Authenticate with Pesapal to get an access token.
        // c. Construct the order details payload.
        const orderDetails = {
            id: `TEST-${randomBytes(8).toString('hex')}`, // Unique ID for the transaction
            currency: 'KES',
            amount: 2999.00, // Amount for the "Pro" plan
            description: `RequestFlow Pro Plan Subscription for ${organization.name}`,
            callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`, // URL user is redirected to
            notification_id: `${process.env.NEXT_PUBLIC_BASE_URL}/api/billing/pesapal-ipn`, // IPN listener
            billing_address: {
                email_address: user.email,
                phone_number: phone || user.phone,
                first_name: user.name.split(' ')[0],
                last_name: user.name.split(' ').slice(1).join(' ') || user.name.split(' ')[0],
            },
        };
        
        // d. Call Pesapal's "SubmitOrderRequest" endpoint.
        // const pesapalResponse = await pesapal.submitOrder(orderDetails);
        // const redirectUrl = pesapalResponse.redirect_url;
        
        // 3. Simulate the redirect URL from Pesapal
        const simulatedRedirectUrl = `https://cybqa.pesapal.com/pesapaliframe/api/values/PostPesapalDirectOrderV4?OrderTrackingId=${orderDetails.id}`;

        console.log("Simulating Pesapal redirect to:", simulatedRedirectUrl);

        return NextResponse.json({ redirectUrl: simulatedRedirectUrl });

    } catch (error) {
        console.error("Error initiating payment:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
