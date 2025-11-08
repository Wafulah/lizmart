import { getAccessToken } from "@/lib/mpesa-token";
import prisma from "@/lib/prisma";

export async function MpesaPay(
    phoneNumber: number,
    amount: number,
    orderIds: string[]
) {
    try {
        // Your authentication and request setup
        const accessToken = await getAccessToken();
        const businessShortCode = process.env.MPESA_SHORTCODE;
        const passKey = process.env.MPESA_PASSKEY;
       
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", `Bearer ${accessToken}`);

        const currentDatetime = new Date();

        // Generate the timestamp in YYYYMMDDHHMMSS format
        const year = currentDatetime.getFullYear();
        const month = (currentDatetime.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
        const day = currentDatetime.getDate().toString().padStart(2, "0");
        const hours = currentDatetime.getHours().toString().padStart(2, "0");
        const minutes = currentDatetime.getMinutes().toString().padStart(2, "0");
        const seconds = currentDatetime.getSeconds().toString().padStart(2, "0");
        const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

        // Concatenate BusinessShortCode, PassKey, and Timestamp
        const passwordString = `${businessShortCode}${passKey}${timestamp}`;

        // Encode the password as a Base64 string
        const base64Password = Buffer.from(passwordString).toString('base64');
      
        const requestPayload = {
            BusinessShortCode: businessShortCode, // Replace with your business shortcode
            Password: base64Password,
            Timestamp: timestamp, // Generate timestamp in the required format
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: businessShortCode, // PartyB can be the same as BusinessShortCode
            PhoneNumber: phoneNumber,
            CallBackURL: "https://lizmart.vercel.app/api/admin/mpesa-webhook", // Replace with your callback URL
            AccountReference: "Lizmart", // Replace with your account reference
            TransactionDesc: "Payment for LizMart Naturals products", // Replace with your transaction description
        };
        
        
        // Sending the STK push request
        const response = await fetch(
            "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                method: "POST",
                headers,
                body: JSON.stringify(requestPayload), // Corrected: stringifying the payload
            }
        );
       
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        
        try {
            
           // Create StkCallback record first
    const stk = await prisma.stkCallback.create({
      data: {
        merchantRequestId: result.MerchantRequestID,
        checkoutRequestId: result.CheckoutRequestID,
        resultCode: parseInt(result.ResponseCode, 10),
        resultDesc: result.ResponseDescription,
        
      },
    });

    // Then update the Order(s) to set their stkCallbackId = result.CheckoutRequestID
    // Only first or all depending on how many
    if (orderIds && orderIds.length > 0) {
      // If unique constraint on Order.stkCallbackId, only update one
      const idToUpdate = orderIds[0];
      await prisma.order.update({
        where: { id: idToUpdate },
        data: {
          stkCallbackId: result.CheckoutRequestID,
          status: "PENDING",         // or leave
          paymentStatus: "PENDING",   // this maybe updated later on callback success
        },
      });
    }

    return result;
            
        } catch (error) {
            console.error(" Error: ", error);
            throw error;
        }
    } catch (error) {
        console.error("STK Push Error: ", error);
        throw error;
    }
}

export default MpesaPay;