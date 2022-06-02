import mongoose, * as Mongoose from "mongoose";

export interface ICategory extends Mongoose.Document {
    title: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// create a schema
export const categorySchema = new Mongoose.Schema(
    {
        title: { type: String, required: true, unique: true },
        active: { type: Boolean, default: true },
        parentCategory: {
            type: Mongoose.Schema.Types.ObjectId, ref: "Category",
            required: false
        }
    },
    {
        // This is for hide _v key form collection
        // Automatically include createdAt and updatedAt field
        timestamps: true,
        versionKey: false
    }
);

//as title and createdAt used in search 
//ESR
categorySchema.index({
    title: -1,
    createdAt: -1
})

export const Category = Mongoose.model<ICategory>("Category", categorySchema);