import { v } from "convex/values";
import { mutation } from "./_generated/server";

const productImportValidator = v.object({
    farmerId: v.string(),
    categoryId: v.string(),
    name: v.string(),
    price: v.number(),
    unit: v.string(),
    quantity: v.number(),
    description: v.optional(v.string()),
    images: v.array(v.string()),
    harvestDate: v.string(),
    expiryDate: v.optional(v.string()),
    storageMethod: v.optional(
        v.union(v.literal("room_temp"), v.literal("refrigerated"), v.literal("frozen")),
    ),
    isOrganic: v.optional(v.boolean()),
    isFeatured: v.boolean(),
    location: v.string(),
    coordinates: v.optional(v.object({ lat: v.number(), lng: v.number() })),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("out_of_stock")),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
});

const categoryImportValidator = v.object({
    categoryId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    images: v.array(v.string()),
    productCount: v.number(),
    isActive: v.boolean(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
});

/** Replace products + categories with a snapshot pulled from Vunalet. */
export const importVunaletCatalog = mutation({
    args: {
        clearExisting: v.optional(v.boolean()),
        categories: v.array(categoryImportValidator),
        products: v.array(productImportValidator),
    },
    handler: async (ctx, args) => {
        const clearExisting = args.clearExisting !== false;

        if (clearExisting) {
            const existingProducts = await ctx.db.query("products").collect();
            for (const product of existingProducts) {
                await ctx.db.delete(product._id);
            }
            const existingCategories = await ctx.db.query("categories").collect();
            for (const category of existingCategories) {
                await ctx.db.delete(category._id);
            }
        }

        const now = Date.now();
        let categoriesInserted = 0;
        for (const category of args.categories) {
            await ctx.db.insert("categories", {
                ...category,
                createdAt: category.createdAt ?? now,
                updatedAt: category.updatedAt ?? now,
            });
            categoriesInserted += 1;
        }

        let productsInserted = 0;
        for (const product of args.products) {
            await ctx.db.insert("products", {
                ...product,
                createdAt: product.createdAt ?? now,
                updatedAt: product.updatedAt ?? now,
            });
            productsInserted += 1;
        }

        return { categoriesInserted, productsInserted };
    },
});

/** Assign a share of catalog products to a farmer (wallet / clerkUserId). */
export const assignProductsToFarmer = mutation({
    args: {
        farmerId: v.string(),
        ratio: v.optional(v.number()), // default 0.3
    },
    handler: async (ctx, args) => {
        const farmerId = args.farmerId.trim().toLowerCase();
        const ratio = Math.min(1, Math.max(0, args.ratio ?? 0.3));

        const farmer = await ctx.db
            .query("userProfiles")
            .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", farmerId))
            .first();

        if (!farmer || farmer.role !== "farmer") {
            throw new Error("Target user is not a registered farmer");
        }

        const products = await ctx.db.query("products").collect();
        const assignCount = Math.max(1, Math.round(products.length * ratio));
        const selected = products.slice(0, assignCount);

        for (const product of selected) {
            await ctx.db.patch(product._id, {
                farmerId,
                updatedAt: Date.now(),
            });
        }

        return {
            totalProducts: products.length,
            assignedCount: selected.length,
            farmerId,
            assignedProductNames: selected.map((p) => p.name),
        };
    },
});
