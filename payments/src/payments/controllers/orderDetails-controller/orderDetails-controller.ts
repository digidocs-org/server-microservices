import { BadRequestError } from "@digidocs/guardian";
import { Request, Response } from "express";
import PaymentOrders from "payments-service/models/payment-orders";

export const paymentDetails = async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await PaymentOrders.findById(orderId);

    if (!orderId) {
        throw new BadRequestError("Order Id not found!!!");
    }

    return res.send({ success: true, data: order })
}