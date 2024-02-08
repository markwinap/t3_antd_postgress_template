import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

const userSchema = z.object(
  {
    name: z.string(),
    email: z.string(),
  }
)

export const userRouter = createTRPCRouter({
  create: protectedProcedure.input(userSchema).mutation(({ ctx, input }) => {
    const { name, email } = input;
    return ctx.db.user.create({
      data: {
        name,
        email
      },
    });
  }),
  createBatch: protectedProcedure.input(z.array(userSchema)).mutation(({ ctx, input }) => {
    return ctx.db.user.createMany({
      data: input.map((item) => {
        const { name, email } = item;
        return {
          name,
          email
        };
      }),
    });
  }),
  deleteBatch: protectedProcedure.input(z.array(z.string())).mutation(({ ctx, input }) => {
    return ctx.db.user.deleteMany({
      where: {
        id: {
          in: input,
        },
      },
    });
  }),
  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.user.delete({
      where: {
        id: input,
      },
    });
  }),
  update: protectedProcedure.input(z.object({
    id: z.string(),
    data: userSchema,
  })).mutation(({ ctx, input }) => {
    const { id, data } = input;
    return ctx.db.user.update({
      where: {
        id,
      },
      data,
    });
  }),
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany();
  }),
  getAllPaged: protectedProcedure.input(
    z.object({
      value: z.string(),
      limit: z.number().min(1).max(100).nullish(),
      sortBy: z.string(),
      cursor: z.string().nullish(),
    }),
  ).query(async ({ ctx, input }) => {
    const limit = input.limit ?? 10;
    const { cursor, sortBy, value } = input;

    const items = await ctx.db.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: value,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: value,
              mode: "insensitive",
            },
          },
        ],
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        ...(sortBy === "email" ? { email: "desc" } : { name: "desc" }),
      },
    });
    let nextCursor: typeof cursor | undefined = undefined;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem!.id;
    }
    return {
      items,
      nextCursor,
    };
  }),
  search: protectedProcedure.input(z.object(
    {
      value: z.string(),
      limit: z.number().min(1).max(100),
    }
  )).query(({ ctx, input }) => {
    const { value, limit } = input;
    return ctx.db.user.findMany({
      take: limit + 1,
      where: {
        OR: [
          {
            name: {
              contains: value,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: value,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        name: "desc",
      },
    });
  }),
  getById: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.db.user.findUnique({
      where: {
        id: input,
      },
    });
  }),
});