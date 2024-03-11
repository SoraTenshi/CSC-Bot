import { type CommandInteraction, SlashCommandBuilder } from "discord.js";

import type { ApplicationCommand, CommandResult } from "./command.js";
import { woisData } from "../handler/voiceStateUpdateHandler.js";

export class WoisLog implements ApplicationCommand {
    name = "woislog";
    description = "Zeigt die letzen Aktivitäten im Woischat an";

    applicationCommand = new SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description);

    async handleInteraction(
        command: CommandInteraction,
    ): Promise<CommandResult> {
        const latestEvents = woisData.latestEvents.filter(event => {
            return event.createdAt.getTime() > Date.now() - 2 * 60 * 1000;
        });

        if (latestEvents.length === 0) {
            await command.reply({
                content: "Es gab keine Aktivitäten in den letzten 2 Minuten",
                ephemeral: true,
            });
            return;
        }

        const latestEventsString = latestEvents.map(event => {
            const { oldState, newState, createdAt } = event;
            const oldChannel = oldState.channel;
            const newChannel = newState.channel;
            const user = newState.member?.user;
            const oldChannelName = oldChannel ? oldChannel.name : "null";
            const newChannelName = newChannel ? newChannel.name : "null";
            return `${createdAt.toLocaleString()} ${
                user?.username
            } moved from ${oldChannelName} to ${newChannelName}`;
        });
        // make string [] to string
        const latestEventsStringJoined = latestEventsString.join("\n");
        await command.reply({
            content: latestEventsStringJoined,
            ephemeral: true,
        });
    }
}
