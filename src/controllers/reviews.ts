import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { Controller } from "../decorators/controller";
import { Route } from "../decorators/route";
import { Validate } from "../decorators/validator";
import { checkRole } from "../middleware/authMiddleware";
import { reviewValidationSchema } from "../validators/reviewValidator";

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
    @Route("post", "/", checkRole(["USER"]))
    @Validate(reviewValidationSchema)
    async addReview(req: Request, res: Response, next: NextFunction) {
        const { serviceId, authorId, rating, comment, reply, images } = req.body;

        try {
            const review = await prisma.review.create({
                data: {
                    serviceId,
                    authorId,
                    rating,
                    comment,
                    reply,
                    images,
                    isVerified: false, // By default, reviews are not verified
                },
            });

            res.status(201).json(review);
        } catch (error) {
            console.error("Error adding review:", error);
            res.status(500).json({ error: "Error adding review" });
        }
    }

    // Update a review
    @Route("put", "/:id", checkRole(["USER"]))
    @Validate(reviewValidationSchema)
    async updateReview(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { rating, comment, reply, images, isHidden, hiddenReason } = req.body;

        try {
            const review = await prisma.review.update({
                where: { id },
                data: {
                    rating,
                    comment,
                    reply,
                    images,
                    isHidden,
                    hiddenReason,
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
    @Route("get", "/:id")
    async getSingleReview(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const review = await prisma.review.findUnique({
                where: { id },
                include: {
                    author: true,
                },
            });

            if (!review) {
                return res.status(404).json({ error: "Review not found" });
            }

            res.status(200).json(review);
        } catch (error) {
            console.error("Error fetching review:", error);
            res.status(500).json({ error: "Error fetching review" });
        }
    }
}

export default ReviewController;
