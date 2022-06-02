import mongoose from "mongoose"
import { cacheCheck, removeCache, cacheInsert } from '../cache/redis'

export class CategoryService {
    Category: any

    constructor(Catgeory: any) {
        this.Category = Catgeory
    }

    async get(id?: mongoose.Types.ObjectId, first?: number, after?: mongoose.Types.ObjectId, search?: string) {
        const query = {
            ...(id && { _id: id }),
            ...(after && { _id: { $lt: after } }),
            ...(search && { title: { $regex: search, $options: 'i' } }),
        }
        if (first) {
            return await this.Category.find(query).sort({ createdAt: -1 }).limit(first);
        } else if (id) {
            const cache = await cacheCheck(`category-${id}`, this.Category)
            if (cache) {
                return cache
            } else {
                const data = await this.Category.find(query)
                cacheInsert(`category-${id}`, data) // pass ttl in milliseconds as third parameter . by default forever cache
                return data
            }
        } else {
            return await this.Category.find(query).sort({ createdAt: -1 })
        }
    }

    async create(data: any) {
        try {
            const todo = new this.Category(data)
            return await todo.save()
        } catch (error) {
            throw new Error(error.message)
        }
    }
    async update(id: mongoose.Types.ObjectId, data: any) {
        try {
            const res = await this.Category.findByIdAndUpdate(id, data, { new: true })
            removeCache(`category-${id}`)
            if ('active' in data && data.active === false) {
                this.deactiveChildCategories(id)
            }
            return res
        } catch (error) {
            throw new Error(error.message)
        }
    }
    async delete(id: mongoose.Types.ObjectId) {
        try {
            const res = await this.Category.findByIdAndDelete(id)
            removeCache(`category-${id}`)
            return res
        } catch (error) {
            throw new Error(error.message)
        }
    }

    private async deactiveChildCategories(id: mongoose.Types.ObjectId) {
        await this.Category.updateMany({
            parentCategory: id
        }, {
            active: false
        })
    }
}