
import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderTrackingId = searchParams.get('OrderTrackingId');
    const orderNotificationType = searchParams.get('OrderNotificationType');
    const orderMerchantReference = searchParams.get('OrderMerchantReference'); // This would be our internal transaction ID

    console.log("--- PESAPAL IPN RECEIVED ---");
    console.log(`Type: ${orderNotificationType}`);
    console.log(`Tracking ID: ${orderTrackingId}`);
    console.log(`Merchant Ref: ${orderMerchantReference}`);
    console.log("----------------------------");

    // In a production environment, you would:
    // 1. Find the transaction in your database using `orderMerchantReference`.
    // 2. Call Pesapal's "GetTransactionStatus" endpoint using the `orderTrackingId` to verify the IPN is legitimate.
    // 3. Check the status from the transaction status API call.

    // This is a placeholder for the verification logic.
    const isPaymentCompleted = true; // Assume success for this simulation.

    if (orderNotificationType === 'IPNCHANGE' && isPaymentCompleted) {
        // Placeholder: Find the organization associated with this transaction and update their subscription.
        // For example, if you stored the org ID with the transaction reference:
        // const orgId = findOrgByTransaction(orderMerchantReference);
        // const orgRef = doc(db, 'organizations', orgId);
        // await updateDoc(orgRef, {
        //     'settings.subscriptionPlan': 'Pro',
        //     'settings.subscriptionStatus': 'Active'
        // });
        
        console.log(`SUCCESS: Payment for tracking ID ${orderTrackingId} was successful. Organization subscription would be updated here.`);
    } else {
        console.log(`IPN for tracking ID ${orderTrackingId} was not a successful completion event or failed verification.`);
    }

    // Respond to Pesapal to acknowledge receipt of the IPN
    const responseBody = `OrderTrackingId=${orderTrackingId}&OrderNotificationType=${orderNotificationType}&OrderMerchantReference=${orderMerchantReference}`;
    
    return new Response(responseBody, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
