import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { type CorsOptions } from 'cors';
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { utils, write } from "xlsx-js-style";

import { type User } from "@prisma/client";

interface UpdateParams {
    name: string,
    email: string,
}

const getExcel = (data: unknown) => {
    const worksheet = utils.json_to_sheet(Array.isArray(data) ? data : [data]);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'data');
    const excelBuffer: Buffer = write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    return excelBuffer;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const ctx = await createTRPCContext({ req, res });
    const caller = appRouter.createCaller(ctx);
    const corsOptions: CorsOptions = {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200,
    }
    try {
        await NextCors(req, res, corsOptions);
        if (req.method === 'GET') {
            const { id, excel } = req.query as { id: string, excel: string };
            if (id) {
                const result = await caller.user.getById(id);
                if (excel) {
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.status(200).send(getExcel(result));
                }
                else {
                    res.status(200).json(result);
                }
            }
            else{
                const result = await caller.user.getAll();
                if (excel) {
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    res.status(200).send(getExcel(result));
                }
                else {
                    res.status(200).json(result);
                }
            }
        }
        else if (req.method === 'DELETE') {
            const { id } = req.body as { id: string };
            const result = await caller.user.delete(id);
            res.status(200).json(result);
        }
        else if (req.method === 'PUT') {
            const { id, data } = req.body as { id: string, data: User };

            const putParams = {
                ...data.name && { name: data.name },
                ...data.email && { email: data.email },
            };
            const result = await caller.user.update({ id, data: putParams as UpdateParams });
            res.status(200).json(result);
        }
        else if (req.method === 'POST') {
            const { data } = req.body as { data: User };
            const postParams = {
                name: data.name ?? '',
                email: data.email ?? '',
            };
            const result = await caller.user.create(postParams);
            res.status(200).json(result);
            
        }
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: 'User operation failed' })
    }
}