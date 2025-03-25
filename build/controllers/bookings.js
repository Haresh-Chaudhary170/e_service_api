"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const controller_1 = require("../decorators/controller");
const route_1 = require("../decorators/route");
const validator_1 = require("../decorators/validator");
const authMiddleware_1 = require("../middleware/authMiddleware");
const bookingValidator_1 = require("../validators/bookingValidator");
const activityLogger_1 = require("../library/activityLogger");
const notificationService_1 = require("../library/notificationService");
const googleCalendar_1 = require("../services/googleCalendar");
const prisma = new client_1.PrismaClient();
let BookingController = class BookingController {
    // Get all bookings
    getAllBookings(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookings = yield prisma.booking.findMany({
                    include: {
                        customer: true,
                        provider: true,
                    },
                });
                res.status(200).json(bookings);
            }
            catch (error) {
                console.error("Error fetching bookings:", error);
                res.status(500).json({ error: "Error fetching bookings" });
            }
        });
    }
    // Get bookings by customer ID
    getBookingsByCustomerId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const bookings = yield prisma.booking.findMany({
                    where: { customerId: id },
                    include: {
                        customer: true,
                        provider: true,
                    },
                });
                res.status(200).json(bookings);
            }
            catch (error) {
                console.error("Error fetching bookings:", error);
                res.status(500).json({ error: "Error fetching bookings" });
            }
        });
    }
    // Get bookings by service ID
    // @Route("get", "/service/:id", checkRole(['SERVICE_PROVIDER', 'ADMIN']))
    // async getBookingsByServiceId(req: Request, res: Response, next: NextFunction) {
    //     const { id } = req.params;
    //     try {
    //         const bookings = await prisma.booking.findMany({
    //             where: { serviceId: id },
    //             include: {
    //                 customer: true,
    //                 service: true,
    //                 provider: true,
    //             },
    //         });
    //         res.status(200).json(bookings);
    //     } catch (error) {
    //         console.error("Error fetching bookings:", error);
    //         res.status(500).json({ error: "Error fetching bookings" });
    //     }
    // }
    // Get bookings by provider ID
    getBookingsByProviderId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.user.providerId;
            try {
                const bookings = yield prisma.booking.findMany({
                    where: { providerId: id },
                    include: {
                        customer: true,
                        provider: {
                            include: {
                                serviceAreas: true
                            }
                        },
                        bookedItems: {
                            include: {
                                service: true
                            }
                        },
                        address: true
                    },
                    orderBy: { createdAt: 'desc' }
                });
                // get booking count
                const total_bookings = yield prisma.booking.count({ where: { providerId: id } });
                res.status(200).json({ bookings, total_bookings });
            }
            catch (error) {
                console.error("Error fetching bookings:", error);
                res.status(500).json({ error: "Error fetching bookings" });
            }
        });
    }
    //update booking status
    changeStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { status } = req.body;
            const { id } = req.params;
            try {
                const booking = prisma.booking.update({
                    where: { id },
                    data: {
                        status
                    }
                });
                res.status(200).json({ booking, nessage: "Status changed successfully." });
            }
            catch (error) {
                console.error("Error fetching booking:", error);
                res.status(500).json({ error: "Error fetching booking" });
            }
        });
    }
    // Get a single booking by ID
    getBookingById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const booking = yield prisma.booking.findUnique({
                    where: { id },
                    include: {
                        customer: true,
                        provider: {
                            include: {
                                serviceAreas: true
                            }
                        },
                        bookedItems: {
                            include: {
                                service: true
                            }
                        },
                        address: true
                    },
                });
                if (!booking) {
                    return res.status(404).json({ error: "Booking not found" });
                }
                res.status(200).json(booking);
            }
            catch (error) {
                console.error("Error fetching booking:", error);
                res.status(500).json({ error: "Error fetching booking" });
            }
        });
    }
    // // Create a booking
    // @Route("post", "/", checkRole(["CUSTOMER"]))
    // @Validate(bookingValidationSchema)
    // async createBooking(req: Request, res: Response, next: NextFunction) {
    //     const uid = req.user.id;
    //     // get user with id
    //     const user = await prisma.user.findUnique({
    //         where: { id: uid },
    //     });
    //     if (!user) {
    //         return res.status(401).json({ error: "Unauthorized" });
    //     }
    //     // check if email is verified
    //     if (!user.emailVerified) {
    //         return res.status(401).json({ error: "Email not verified. Please verify your email first." });
    //     }
    //     // // check if phone is verified
    //     // if (user.phoneVerified) {
    //     //     return res.status(401).json({ error: "Phone number not verified. Please verify your phone number first." });
    //     // }
    //     // check if the user is customer
    //     const customer = await prisma.customer.findUnique({
    //         where: { userId: uid },
    //     })
    //     if (!customer) {
    //         return res.status(401).json({ error: "You are not a customer. Only customers can create bookings." });
    //     }
    //     const {
    //         providerId,
    //         addressId,
    //         type,
    //         paymentMethod,
    //         scheduledDate,
    //         scheduleStartTime,
    //         scheduleEndTime,
    //         totalAmount,
    //         notes,
    //     } = req.body;
    //     // check if provider exists
    //     const provider = await prisma.serviceProvider.findUnique({
    //         where: { id: providerId },
    //     });
    //     if (!provider) {
    //         return res.status(404).json({ error: "Provider not found" });
    //     }
    //     try {
    //         const booking = await prisma.booking.create({
    //             data: {
    //                 customerId: customer.id,
    //                 addressId,
    //                 type,
    //                 paymentMethod,
    //                 providerId,
    //                 scheduledDate: new Date(scheduledDate),
    //                 scheduleStartTime,
    //                 scheduleEndTime,
    //                 totalAmount: parseFloat(totalAmount),
    //                 notes,
    //             },
    //         });
    //         const cartItems = await prisma.cart.findMany({ where: { userId: uid } });
    //         cartItems.map(async (item) => {
    //             await prisma.bookedItem.create({
    //                 data: {
    //                     serviceId: item.serviceId,
    //                     bookingId: booking.id,
    //                 }
    //             })
    //         })
    //         // add to serviceTrackingLog
    //         await prisma.serviceTrackingLog.create({
    //             data: {
    //                 bookingId: booking.id,
    //                 status: "PENDING",
    //                 metadata: { message: "Booking Initiated" }
    //             },
    //         });
    //         await prisma.cart.deleteMany({ where: { userId: uid } })
    //         await logActivity({
    //             userId: uid,
    //             action: "Initiated Booking.",
    //             entity: "booking",
    //             entityId: booking.id,
    //             details: booking,
    //         })
    //         // Send notification
    //         await NotificationService.createNotification({
    //             userId: req.user.id,
    //             title: "Booking Confirmed",
    //             message: "Your booking has been successfully confirmed.",
    //             type: "BOOKING",
    //         });
    //         res.status(200).json(booking);
    //     } catch (error) {
    //         console.error("Error creating booking:", error);
    //         res.status(500).json({ error: "Error creating booking" });
    //     }
    // }
    // Create a booking
    createBooking(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const uid = req.user.id;
            // Get user with id
            const user = yield prisma.user.findUnique({
                where: { id: uid },
            });
            if (!user) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            // Check if email is verified
            if (!user.emailVerified) {
                return res.status(401).json({ error: "Email not verified. Please verify your email first." });
            }
            // Check if the user is a customer
            const customer = yield prisma.customer.findUnique({
                where: { userId: uid },
            });
            if (!customer) {
                return res.status(401).json({ error: "You are not a customer. Only customers can create bookings." });
            }
            const { providerId, addressId, type, paymentMethod, scheduledDate, scheduleStartTime, scheduleEndTime, totalAmount, notes, } = req.body;
            // Check if provider exists
            const provider = yield prisma.serviceProvider.findUnique({
                where: { id: providerId },
            });
            if (!provider) {
                return res.status(404).json({ error: "Provider not found" });
            }
            try {
                // Create the booking
                const booking = yield prisma.booking.create({
                    data: {
                        customerId: customer.id,
                        addressId,
                        type,
                        paymentMethod,
                        providerId,
                        scheduledDate: new Date(scheduledDate),
                        scheduleStartTime,
                        scheduleEndTime,
                        totalAmount: parseFloat(totalAmount),
                        notes,
                    },
                });
                console.log(booking);
                // Add booked items
                const cartItems = yield prisma.cart.findMany({ where: { userId: uid } });
                cartItems.map((item) => __awaiter(this, void 0, void 0, function* () {
                    yield prisma.bookedItem.create({
                        data: {
                            serviceId: item.serviceId,
                            bookingId: booking.id,
                        },
                    });
                }));
                // Add to serviceTrackingLog
                yield prisma.serviceTrackingLog.create({
                    data: {
                        bookingId: booking.id,
                        status: "PENDING",
                        metadata: { message: "Booking Initiated" },
                    },
                });
                // Clear the cart
                yield prisma.cart.deleteMany({ where: { userId: uid } });
                // Log activity
                yield (0, activityLogger_1.logActivity)({
                    userId: uid,
                    action: "Initiated Booking.",
                    entity: "booking",
                    entityId: booking.id,
                    details: booking,
                });
                // Send notification
                yield notificationService_1.NotificationService.createNotification({
                    userId: req.user.id,
                    title: "Booking Confirmed",
                    message: "Your booking has been successfully confirmed.",
                    type: "BOOKING",
                });
                // Get user's Google tokens from the database
                const userGoogleCredentials = yield prisma.user.findUnique({
                    where: { id: uid },
                    select: {
                        googleAccessToken: true,
                    },
                });
                if (!userGoogleCredentials || !userGoogleCredentials.googleAccessToken) {
                    return res.status(400).json({ error: 'No Google tokens found for this user.' });
                }
                // Function to parse time string (e.g., "12:00 PM") to hours and minutes
                const parseTimeString = (timeStr) => {
                    const [time, period] = timeStr.split(' ');
                    let [hours, minutes] = time.split(':').map(Number);
                    if (period === 'PM' && hours < 12)
                        hours += 12;
                    if (period === 'AM' && hours === 12)
                        hours = 0;
                    return { hours, minutes };
                };
                // Get start and end times
                const { hours: startHours, minutes: startMinutes } = parseTimeString(scheduleStartTime);
                const { hours: endHours, minutes: endMinutes } = parseTimeString(scheduleEndTime);
                // Create Date objects combining the date and time
                const startDateTime = new Date(scheduledDate);
                startDateTime.setHours(startHours, startMinutes, 0, 0);
                const endDateTime = new Date(scheduledDate);
                endDateTime.setHours(endHours, endMinutes, 0, 0);
                // Now use these in your calendar function
                yield (0, googleCalendar_1.createGoogleCalendarEvent)(userGoogleCredentials.googleAccessToken, `Booking with ${provider.businessName}`, `Booking ID: ${booking.id}\nCustomer: ${user.firstName} ${user.lastName}\nServices: ${cartItems.map(item => item.serviceId).join(", ")}`, startDateTime.toISOString(), endDateTime.toISOString());
                res.status(200).json(booking);
            }
            catch (error) {
                console.error("Error creating booking:", error);
                res.status(500).json({ error: "Error creating booking" });
            }
        });
    }
    // Update a booking
    updateBooking(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { customerId, serviceId, providerId, timeSlotId, status, scheduledDate, completedDate, totalAmount, notes, location, } = req.body;
            try {
                const updatedBooking = yield prisma.booking.update({
                    where: { id },
                    data: {
                        customerId,
                        providerId,
                        status,
                        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
                        completedDate: completedDate ? new Date(completedDate) : undefined,
                        totalAmount,
                        notes,
                        location,
                    },
                });
                res.status(200).json(updatedBooking);
            }
            catch (error) {
                console.error("Error updating booking:", error);
                res.status(500).json({ error: "Error updating booking" });
            }
        });
    }
    // Delete a booking
    deleteBooking(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield prisma.booking.delete({
                    where: { id },
                });
                res.status(200).json({ message: "Booking deleted successfully" });
            }
            catch (error) {
                console.error("Error deleting booking:", error);
                res.status(500).json({ error: "Error deleting booking" });
            }
        });
    }
};
__decorate([
    (0, route_1.Route)("get", "/get-all", (0, authMiddleware_1.checkRole)(['ADMIN']))
], BookingController.prototype, "getAllBookings", null);
__decorate([
    (0, route_1.Route)("get", "/customer/:id", (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER', 'CUSTOMER']))
], BookingController.prototype, "getBookingsByCustomerId", null);
__decorate([
    (0, route_1.Route)("get", "/provider", (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']))
], BookingController.prototype, "getBookingsByProviderId", null);
__decorate([
    (0, route_1.Route)("put", "/:id", (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']))
], BookingController.prototype, "changeStatus", null);
__decorate([
    (0, route_1.Route)("get", "/:id", (0, authMiddleware_1.checkRole)(['CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN']))
], BookingController.prototype, "getBookingById", null);
__decorate([
    (0, route_1.Route)("post", "/", (0, authMiddleware_1.checkRole)(["CUSTOMER"])),
    (0, validator_1.Validate)(bookingValidator_1.bookingValidationSchema)
], BookingController.prototype, "createBooking", null);
__decorate([
    (0, route_1.Route)("put", "/:id", (0, authMiddleware_1.checkRole)(["CUSTOMER", "SERVICE_PROVIDER"])),
    (0, validator_1.Validate)(bookingValidator_1.bookingValidationSchema.partial()) // Allow partial updates
], BookingController.prototype, "updateBooking", null);
__decorate([
    (0, route_1.Route)("delete", "/:id", (0, authMiddleware_1.checkRole)(["ADMIN", "SERVICE_PROVIDER"]))
], BookingController.prototype, "deleteBooking", null);
BookingController = __decorate([
    (0, controller_1.Controller)("/api/bookings")
], BookingController);
exports.default = BookingController;
