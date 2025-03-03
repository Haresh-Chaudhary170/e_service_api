import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { Controller } from "../decorators/controller";
import { Route } from "../decorators/route";
import { Validate } from "../decorators/validator";
import { checkRole } from "../middleware/authMiddleware";
import { bookingValidationSchema } from "../validators/bookingValidator";
import { logActivity } from "../library/activityLogger";
import { NotificationService } from "../library/notificationService";

const prisma = new PrismaClient();

@Controller("/api/bookings")
class BookingController {
    // Get all bookings
    @Route("get", "/get-all", checkRole(['ADMIN']))
    async getAllBookings(req: Request, res: Response, next: NextFunction) {
        try {
            const bookings = await prisma.booking.findMany({
                include: {
                    customer: true,
                    service: true,
                    provider: true,
                    timeSlot: true,
                },
            });

            res.status(200).json(bookings);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(500).json({ error: "Error fetching bookings" });
        }
    }

    // Get bookings by customer ID
    @Route("get", "/customer/:id", checkRole(['SERVICE_PROVIDER', 'CUSTOMER']))
    async getBookingsByCustomerId(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const bookings = await prisma.booking.findMany({
                where: { customerId: id },
                include: {
                    customer: true,
                    service: true,
                    provider: true,
                    timeSlot: true,
                },
            });

            res.status(200).json(bookings);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(500).json({ error: "Error fetching bookings" });
        }
    }
    // Get bookings by service ID
    @Route("get", "/service/:id", checkRole(['SERVICE_PROVIDER', 'ADMIN']))
    async getBookingsByServiceId(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const bookings = await prisma.booking.findMany({
                where: { serviceId: id },
                include: {
                    customer: true,
                    service: true,
                    provider: true,
                    timeSlot: true,
                },
            });

            res.status(200).json(bookings);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(500).json({ error: "Error fetching bookings" });
        }
    }
    // Get bookings by provider ID
    @Route("get", "/provider", checkRole(['SERVICE_PROVIDER']))
    async getBookingsByProviderId(req: Request, res: Response, next: NextFunction) {
        const id = req.user.providerId;
        try {
            const bookings = await prisma.booking.findMany({
                where: { providerId: id },
                include: {
                    customer: true,
                    service: true,
                    provider: true,
                    timeSlot: true,
                },
            });
            // get booking count
            const total_bookings = await prisma.booking.count({ where: { providerId: id } });

            res.status(200).json({bookings,total_bookings});
        } catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(500).json({ error: "Error fetching bookings" });
        }
    }
    // Get a single booking by ID
    @Route("get", "/:id")
    async getBookingById(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const booking = await prisma.booking.findUnique({
                where: { id },
                include: {
                    customer: true,
                    service: true,
                    provider: true,
                    timeSlot: true,
                },
            });

            if (!booking) {
                return res.status(404).json({ error: "Booking not found" });
            }

            res.status(200).json(booking);
        } catch (error) {
            console.error("Error fetching booking:", error);
            res.status(500).json({ error: "Error fetching booking" });
        }
    }

    // Create a booking
    @Route("post", "/", checkRole(["CUSTOMER"]))
    @Validate(bookingValidationSchema)
    async createBooking(req: Request, res: Response, next: NextFunction) {
        const uid = req.user.id;

        // get user with id
        const user = await prisma.user.findUnique({
            where: { id: uid },
        });

        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // check if email is verified
        if (user.emailVerified) {
            return res.status(401).json({ error: "Email not verified. Please verify your email first." });
        }
        // check if phone is verified
        if (user.phoneVerified) {
            return res.status(401).json({ error: "Phone number not verified. Please verify your phone number first." });
        }
        // check if the user is customer
        const customer = await prisma.customer.findUnique({
            where: { userId: uid },
        })

        if (!customer) {
            return res.status(401).json({ error: "You are not a customer. Only customers can create bookings." });
        }

        const {
            serviceId,
            providerId,
            timeSlotId,
            scheduledDate,
            totalAmount,
            notes,
            location,
        } = req.body;

        // check if provider exists
        const provider = await prisma.serviceProvider.findUnique({
            where: { id: providerId },
        });

        if (!provider) {
            return res.status(404).json({ error: "Provider not found" });
        }

        // check if time slot is available
        const timeSlot = await prisma.timeSlot.findUnique({
            where: { id: timeSlotId, isAvailable: true },
        });

        if (!timeSlot) {
            return res.status(404).json({ error: "Time slot not found or is unavailable." });
        }

        try {
            const booking = await prisma.booking.create({
                data: {
                    customerId: customer.id,
                    serviceId,
                    providerId,
                    timeSlotId,
                    scheduledDate: new Date(scheduledDate),
                    totalAmount,
                    notes,
                    location,
                },
            });
            // add to serviceTrackingLog
            await prisma.serviceTrackingLog.create({
                data: {
                    location,
                    bookingId: booking.id,
                    status: "PENDING",
                    metadata: { message: "Booking Initiated" }
                },
            });
            await logActivity({
                userId: uid,
                action: "Initiated Booking.",
                entity: "booking",
                entityId: booking.id,
                details: booking,
            })
            // Send notification
            await NotificationService.createNotification({
                userId: req.user.id,
                title: "Booking Confirmed",
                message: "Your booking has been successfully confirmed.",
                type: "BOOKING",
            });
            res.status(200).json(booking);
        } catch (error) {
            console.error("Error creating booking:", error);
            res.status(500).json({ error: "Error creating booking" });
        }
    }

    // Update a booking
    @Route("put", "/:id", checkRole(["CUSTOMER", "SERVICE_PROVIDER"]))
    @Validate(bookingValidationSchema.partial()) // Allow partial updates
    async updateBooking(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const {
            customerId,
            serviceId,
            providerId,
            timeSlotId,
            status,
            scheduledDate,
            completedDate,
            totalAmount,
            notes,
            location,
        } = req.body;

        try {
            const updatedBooking = await prisma.booking.update({
                where: { id },
                data: {
                    customerId,
                    serviceId,
                    providerId,
                    timeSlotId,
                    status,
                    scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
                    completedDate: completedDate ? new Date(completedDate) : undefined,
                    totalAmount,
                    notes,
                    location,
                },
            });
            res.status(200).json(updatedBooking);
        } catch (error) {
            console.error("Error updating booking:", error);
            res.status(500).json({ error: "Error updating booking" });
        }
    }

    // Delete a booking
    @Route("delete", "/:id", checkRole(["ADMIN", "SERVICE_PROVIDER"]))
    async deleteBooking(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            await prisma.booking.delete({
                where: { id },
            });

            res.status(200).json({ message: "Booking deleted successfully" });
        } catch (error) {
            console.error("Error deleting booking:", error);
            res.status(500).json({ error: "Error deleting booking" });
        }
    }
}

export default BookingController;
