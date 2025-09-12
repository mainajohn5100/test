
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
    // 2. Call Pesapal's "GetTransactionStatus" endpoint using the `orderTrackingId` to verify the IPN is legitimate and get the final status.
    // 3. Check the status from the transaction status API call ('COMPLETED', 'FAILED', etc.).
    
    // For this prototype, we'll simulate a successful verification.
    const isPaymentCompleted = true; // Assume success for this simulation.
    const paymentStatus = "COMPLETED";

    if (orderNotificationType === 'IPNCHANGE' && paymentStatus === 'COMPLETED') {
        // Placeholder: Find the organization associated with this transaction and update their subscription.
        // For example, if you stored the org ID with the transaction reference:
        // const orgId = findOrgByTransaction(orderMerchantReference);
        // const orgRef = doc(db, 'organizations', orgId);
        // await updateDoc(orgRef, {
        //     'settings.subscriptionPlan': 'Pro',
        //     'settings.subscriptionStatus': 'Active',
        //     'settings.nextBillingDate': ... // calculate next billing date
        // });
        
        console.log(`SUCCESS: Payment for tracking ID ${orderTrackingId} was successful. Organization subscription would be updated here.`);
    
    } else {
        console.log(`IPN for tracking ID ${orderTrackingId} was not a successful completion event (Status: ${paymentStatus}).`);
    }

    // IMPORTANT: Respond to Pesapal to acknowledge receipt of the IPN.
    // If you don't send this response, Pesapal will keep resending the IPN.
    const responseBody = `OrderTrackingId=${orderTrackingId}&OrderNotificationType=${orderNotificationType}&OrderMerchantReference=${orderMerchantReference}`;
    
    return new Response(responseBody, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
