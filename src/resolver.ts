import { IResolvers } from "graphql-tools";
import { Category } from './models/catgeory'
import { CategoryService } from './services/category'
// const DataLoader = require('dataloader') -- implement for relationship for N+1 problem , though it's use redis cache.

const categoryService = new CategoryService(Category)
const resolvers: IResolvers = {
  Query: {
    helloWorld: () => "Hello world from Apollo Server",
    category: async (parent, { id, first, after, search }, ctx, info) => {
      return categoryService.get(id, first, after, search)
    },
  },
  Mutation: {
    createCategory: async (parent, { data }, ctx, info) => {
      try {
        return await categoryService.create(data)
      } catch (error) {
        throw new Error(error.message)
      }
    },
    updateCategory: async (parent, { id, data }, ctx, info) => {
      try {
        return await categoryService.update(id, data)
      } catch (error) {
        throw new Error(error.message)
      }
    },
    deleteCategory: async (parent, { id }, ctx, info) => {
      try {
        return await categoryService.delete(id)
      } catch (error) {
        throw new Error(error.message)
      }
    },
  },

  // relationship
  Category: {
    parentCategory: async (parent, args, ctx, info) => {
      try {
        // DataLoader for N+1
        const pCat = await categoryService.get(parent.parentCategory)
        return pCat[0]
      } catch (error) {
        throw new Error(error.message)
      }
    }
  }
};
export default resolvers;
