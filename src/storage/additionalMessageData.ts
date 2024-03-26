import type { Message, Snowflake } from "discord.js";
import { sql } from "kysely";

import type { AdditionalMessageData, DataUsage } from "./model.js";
import type { JsonObject } from "../types.js";
import db from "./db.js";

export async function getForMessage(
    message: Message,
    usage: DataUsage,
    ctx = db(),
) {
    if (!message.guild) {
        throw new Error(
            "Cannot associate data with message outside of a guild",
        );
    }
    const res = await ctx
        .selectFrom("additionalMessageData")
        .where("messageId", "=", message.id)
        .where("usage", "=", usage)
        .selectAll()
        .executeTakeFirst();

    return res === undefined
        ? undefined
        : { ...res, customData: JSON.parse(res.payload) as JsonObject };
}

export async function upsertForMessage(
    message: Message,
    usage: DataUsage,
    payload: JsonObject,
    ctx = db(),
) {
    if (!message.guild) {
        throw new Error(
            "Cannot associate data with message outside of a guild",
        );
    }

    await ctx
        .insertInto("additionalMessageData")
        .values({
            guildId: message.guildId as Snowflake,
            channelId: message.channelId,
            messageId: message.id,
            usage,
            payload: JSON.stringify(payload),
        })
        .onConflict(oc =>
            oc.columns(["guildId", "channelId", "messageId"]).doUpdateSet({
                payload: JSON.stringify(payload),
            }),
        )
        .execute();
}

export async function destroyForMessage(
    message: Message,
    usage: DataUsage,
    ctx = db(),
) {
    await ctx
        .deleteFrom("additionalMessageData")
        .where("messageId", "=", message.id)
        .where("usage", "=", usage)
        .execute();
}

export function findAll(
    usage: DataUsage,
    ctx = db(),
): Promise<AdditionalMessageData[]> {
    return ctx
        .selectFrom("additionalMessageData")
        .where("usage", "=", usage)
        .selectAll()
        .execute();
}
