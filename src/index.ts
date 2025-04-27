import { Chest, createBot } from "mineflayer";

declare module "mineflayer" {
    interface Bot {
        delivering: boolean
    }
}
const bot = createBot({
    host: "8b8t.me",
    username: "kitbot",
    auth: "microsoft",
    version: "1.21",
})

bot.delivering = false; // Initialize the busy property

bot.once("spawn", () => {
    console.log("Bot has spawned.")
    bot.chat("/server 8b8t"); // Send a chat message when the bot spawns
    bot.waitForTicks(20).then(() => {
        bot.chat("/kit")
    })
})



bot.on("chat", (username, message) => {
    console.log(username, message)
    if (username === bot.username) return; // Ignore messages from the bot itself
    if (message.startsWith("-----kit")) {
        console.log("Kit command received from", username);
        if (bot.delivering) {
            bot.chat(`/w ${username} I'm busy right now, please wait.`);
            return;
        }
        bot.delivering = true; // Set busy to true when starting the kit process
        bot.chat("/kit")
        bot.chat(`/w ${username} I'm delivering your kit!`);
        setTimeout(async () => {
            bot.setControlState("sneak", true);
            await bot.waitForTicks(5);
            const donkey = Object.values(bot.entities).find((entity) =>
                entity.entityType === bot.registry.entitiesByName["donkey"].id && entity.position.distanceTo(bot.entity.position) < 5
            )
            
            bot.mount(donkey!)
            await bot.waitForTicks(1);
            bot.setControlState("sneak", false);
            await bot.waitForTicks(1);
            const minecart = Object.values(bot.entities).find((entity) =>
                entity.entityType === bot.registry.entitiesByName["minecart"].id && entity.position.distanceTo(bot.entity.position) < 5)
            bot.mount(minecart!)
            const button = bot.findBlock({
                matching: bot.registry.blocksByName["birch_button"].id,
            })
            if (button) {
                bot.activateBlock(button!)
            }
            const handler = async (window: Chest) => {
                if (window.type !== "minecraft:generic_9x2") {
                    bot.once("windowOpen", handler)
                    return;
                }
                console.log("waiting for position to become -69982")
                while (bot.entity.position.y >= -69982) {

                }
                console.log("transfering items")
                await bot.transfer({
                    window: window,
                    itemType: bot.registry.itemsByName["blue_shulker_box"].id,
                    metadata: null,
                    count: 1728,
                    sourceStart: 0,
                    sourceEnd: 17,
                    destStart: 18, destEnd: 26
                })
                while (bot.entity.position.y != -70105.261) {
                }
                bot.dismount()
                bot.chat(`/tpa ${username}`)
                while (bot.nearestEntity(entity => entity.name === username) === null) {
                    await bot.waitForTicks(5);
                }
                bot.chat("/kit")
            }
            bot.once("windowOpen", handler)
        }, 1000); // Wait for 10 seconds before setting busy to false
    }
})
