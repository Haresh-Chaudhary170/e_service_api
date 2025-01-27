import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { Controller } from "../decorators/controller";
import { Route } from "../decorators/route";
import { Validate } from "../decorators/validator";
import { checkRole } from "../middleware/authMiddleware";
import { reviewValidationSchema } from "../validators/reviewValidator";
import { multipleUploadMiddleware } from "../middleware/uploadMidleware";

const prisma = new PrismaClient();

@Controller("/api/reviews")
class ReviewController {
    // Get all reviews for a service
    @Route("get", "/service/:serviceId")
    async getReviewsByService(req: Request, res: Response, next: NextFunction) {
        const { serviceId } = req.params;

        try {
            const reviews = await prisma.review.findMany({
                where: { serviceId },
                include: {
                    author: true,
                },
            });

            res.status(200).json(reviews);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            res.status(500).json({ error: "Error fetching reviews" });
        }
    }

    // Add a review
    @Route("post", "/", checkRole(["CUSTOMER"]), multipleUploadMiddleware)
    @Validate(reviewValidationSchema)
    async addReview(req: Request, res: Response, next: NextFunction) {
        const { serviceId, rating, comment, images } = req.body;

        const userId = req.user.id;
        // check if user is customer
        const customer = await prisma.customer.findUnique({ where: { userId: userId } });
        if (!customer) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // check if has any bookings
        const bookings = await prisma.booking.findMany({
            where: { customerId: customer.id, serviceId: serviceId },
        });

        if (bookings.length < 1) {
            return res.status(403).json({ error: "You must have to book a service to give reviews." });
        }
        try {
            const review = await prisma.review.create({
                data: {
                    serviceId,
                    authorId: userId,
                    rating,
                    comment,
                    images,
                },
            });

            res.status(201).json(review);
        } catch (error) {
            console.error("Error adding review:", error);
            res.status(500).json({ error: "Error adding review" });
        }
    }

    // add reply
    @Route("put", "/reply/:id", checkRole(["CUSTOMER", "SERVICE_PROVIDER"]))
    // @Validate(reviewValidationSchema)
    async addReply(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { reply } = req.body;
        try {
            const updatedReview = await prisma.review.update({
                where: { id },
                data: {
                    reply,
                },
            });

            res.status(200).json(updatedReview);
        } catch (error) {
            console.error("Error adding reply:", error);
            res.status(500).json({ error: "Error adding reply" });

        }
    }
    // Verify a review
    @Route("put", "/verify/:id", checkRole(["ADMIN", "SERVICE_PROVIDER"]))
    async verifyReview(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const updatedReview = await prisma.review.update({
                where: { id },
                data: {
                    isVerified: true,
                },
            });

            res.status(200).json(updatedReview);
        } catch (error) {
            console.error("Error verifying review:", error);
            res.status(500).json({ error: "Error verifying review" });
        }
    }
    // Hide a review
    @Route("put", "/hide/:id", checkRole(["ADMIN", "SERVICE_PROVIDER"]))
    async hideReview(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { hiddenReason } = req.body;

        try {
            const updatedReview = await prisma.review.update({
                where: { id },
                data: {
                    isHidden: true,
                    hiddenReason,
                },
            });

            res.status(200).json(updatedReview);
        } catch (error) {
            console.error("Error hiding review:", error);
            res.status(500).json({ error: "Error hiding review" });
        }
    }

    // Update a review
    @Route("put", "/:id", checkRole(["CUSTOMER"]))
    @Validate(reviewValidationSchema)
    async updateReview(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { rating, comment, images } = req.body;

        try {
            const review = await prisma.review.update({
                where: { id },
                data: {
                    rating,
                    comment,
                    images,

                },
            });

            res.status(200).json(review);
        } catch (error) {
            console.error("Error updating review:", error);
            res.status(500).json({ error: "Error updating review" });
        }
    }

    // Delete a review
    @Route("delete", "/:id", checkRole(["ADMIN", "SERVICE_PROVIDER"]))
    async deleteReview(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            await prisma.review.delete({
                where: { id },
            });

            res.status(200).json({ message: "Review deleted successfully" });
        } catch (error) {
            console.error("Error deleting review:", error);
            res.status(500).json({ error: "Error deleting review" });
        }
    }

    // Get a single review
    // @Route("get", "/:id")
    // async getSingleReview(req: Request, res: Response, next: NextFunction) {
    //     const { id } = req.params;

    //     try {
    //         const review = await prisma.review.findUnique({
    //             where: { id },
    //             include: {
    //                 author: true,
    //             },
    //         });

    //         if (!review) {
    //             return res.status(404).json({ error: "Review not found" });
    //         }

    //         res.status(200).json(review);
    //     } catch (error) {
    //         console.error("Error fetching review:", error);
    //         res.status(500).json({ error: "Error fetching review" });
    //     }
    // }
}

export default ReviewController;
