const DataLoader = require('dataloader')
import { Category } from '../models/catgeory'
import { ObjectId } from 'mongoose'

export const categoryDataLoader = new DataLoader(async (catIds: [ObjectId]) => {
    const results = await Category.find({
        _id: catIds
    })
    return catIds.map((key: any) => {
        const searchIndex = results.findIndex((cat: any) => cat._id.toString() === key);
        return results[searchIndex]
    })
});