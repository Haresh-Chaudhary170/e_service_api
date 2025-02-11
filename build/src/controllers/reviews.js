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
const reviewValidator_1 = require("../validators/reviewValidator");
const uploadMidleware_1 = require("../middleware/uploadMidleware");
const prisma = new client_1.PrismaClient();
let ReviewController = class ReviewController {
    // Get all reviews for a service
    getReviewsByService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { serviceId } = req.params;
            try {
                const reviews = yield prisma.review.findMany({
                    where: { serviceId },
                    include: {
                        author: true,
                    },
                });
                res.status(200).json(reviews);
            }
            catch (error) {
                console.error("Error fetching reviews:", error);
                res.status(500).json({ error: "Error fetching reviews" });
            }
        });
    }
    // Add a review
    addReview(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { serviceId, rating, comment } = req.body;
            // check if the rating is between 1 and 5
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ error: "Rating must be between 1 and 5" });
            }
            // Accessing multiple uploaded files
            const images = req.files;
            // Validate uploaded files
            if (!images || images.length === 0) {
                return res.status(400).json({ error: "At least one image is required" });
            }
            const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
            const maxFileSize = 5 * 1024 * 1024; // 5 MB
            const maxFileCount = 5;
            if (images.length > maxFileCount) {
                return res
                    .status(400)
                    .json({ error: `You can upload a maximum of ${maxFileCount} images` });
            }
            for (const file of images) {
                if (!validMimeTypes.includes(file.mimetype)) {
                    return res
                        .status(400)
                        .json({ error: `Invalid file type: ${file.originalname}` });
                }
                if (file.size > maxFileSize) {
                    return res
                        .status(400)
                        .json({ error: `File too large: ${file.originalname}` });
                }
            }
            const userId = req.user.id;
            // check if user is customer
            const customer = yield prisma.customer.findUnique({ where: { userId: userId } });
            if (!customer) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            // check if has any bookings
            const bookings = yield prisma.booking.findMany({
                where: { customerId: customer.id, serviceId: serviceId },
            });
            if (bookings.length < 1) {
                return res.status(403).json({ error: "You must have to book a service to give reviews." });
            }
            try {
                const review = yield prisma.review.create({
                    data: {
                        serviceId,
                        authorId: userId,
                        rating: parseInt(rating),
                        comment,
                        images: images ? images.map((image) => `${image.destination}/${image.filename}`) : [],
                    },
                });
                res.status(200).json(review);
            }
            catch (error) {
                console.error("Error adding review:", error);
                res.status(500).json({ error: "Error adding review" });
            }
        });
    }
    // add reply
    addReply(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { reply } = req.body;
            try {
                const updatedReview = yield prisma.review.update({
                    where: { id },
                    data: {
                        reply,
                    },
                });
                res.status(200).json(updatedReview);
            }
            catch (error) {
                console.error("Error adding reply:", error);
                res.status(500).json({ error: "Error adding reply" });
            }
        });
    }
    // Verify a review
    verifyReview(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const updatedReview = yield prisma.review.update({
                    where: { id },
                    data: {
                        isVerified: true,
                    },
                });
                res.status(200).json(updatedReview);
            }
            catch (error) {
                console.error("Error verifying review:", error);
                res.status(500).json({ error: "Error verifying review" });
            }
        });
    }
    // Hide or show review (toggle isHidden)
    hideReview(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { hiddenReason } = req.body;
            try {
                const review = yield prisma.review.findUnique({
                    where: { id: id },
                });
                if (!review) {
                    return res.status(404).json({ error: "Review not found." });
                }
                // Toggle the isHidden flag and update the hiddenReason if provided
                const updatedReview = yield prisma.review.update({
                    where: { id: id },
                    data: {
                        isHidden: !review.isHidden, // Toggle the value of isHidden
                        hiddenReason: hiddenReason || (review.isHidden ? null : ""), // Only update hiddenReason if necessary
                    },
                });
                // Return the updated review
                res.status(200).json(updatedReview);
            }
            catch (error) {
                console.error("Error toggling review visibility:", error);
                res.status(500).json({ error: "Internal server error, unable to toggle review visibility." });
            }
        });
    }
    // Update a review
    updateReview(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { rating, comment, images } = req.body;
            try {
                const review = yield prisma.review.update({
                    where: { id },
                    data: {
                        rating,
                        comment,
                        images,
                    },
                });
                res.status(200).json(review);
            }
            catch (error) {
                console.error("Error updating review:", error);
                res.status(500).json({ error: "Error updating review" });
            }
        });
    }
    // Delete a review
    deleteReview(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield prisma.review.delete({
                    where: { id },
                });
                res.status(200).json({ message: "Review deleted successfully" });
            }
            catch (error) {
                console.error("Error deleting review:", error);
                res.status(500).json({ error: "Error deleting review" });
            }
        });
    }
};
__decorate([
    (0, route_1.Route)("get", "/service/:serviceId")
], ReviewController.prototype, "getReviewsByService", null);
__decorate([
    (0, route_1.Route)("post", "/", (0, authMiddleware_1.checkRole)(["CUSTOMER"]), uploadMidleware_1.multipleUploadMiddleware),
    (0, validator_1.Validate)(reviewValidator_1.reviewValidationSchema)
], ReviewController.prototype, "addReview", null);
__decorate([
    (0, route_1.Route)("put", "/reply/:id", (0, authMiddleware_1.checkRole)(["CUSTOMER", "SERVICE_PROVIDER"]))
    // @Validate(reviewValidationSchema)
], ReviewController.prototype, "addReply", null);
__decorate([
    (0, route_1.Route)("put", "/verify/:id", (0, authMiddleware_1.checkRole)(["ADMIN", "SERVICE_PROVIDER"]))
], ReviewController.prototype, "verifyReview", null);
__decorate([
    (0, route_1.Route)("put", "/hide/:id", (0, authMiddleware_1.checkRole)(["ADMIN", "SERVICE_PROVIDER"]))
], ReviewController.prototype, "hideReview", null);
__decorate([
    (0, route_1.Route)("put", "/:id", (0, authMiddleware_1.checkRole)(["CUSTOMER"])),
    (0, validator_1.Validate)(reviewValidator_1.reviewValidationSchema)
], ReviewController.prototype, "updateReview", null);
__decorate([
    (0, route_1.Route)("delete", "/:id", (0, authMiddleware_1.checkRole)(["ADMIN", "SERVICE_PROVIDER"]))
], ReviewController.prototype, "deleteReview", null);
ReviewController = __decorate([
    (0, controller_1.Controller)("/api/reviews")
], ReviewController);
exports.default = ReviewController;
