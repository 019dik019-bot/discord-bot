require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  EmbedBuilder
} = require('discord.js');

const express = require('express');
const app = express();

// =====================
// 🔥 Render用ポート対策（必須）
// =====================
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is alive');
});

app.listen(PORT, () => {
  console.log(`Web server running on ${PORT}`);
});

// =====================
// Discord bot
// =====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.Guilds // 追加（安定化）
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User // 🔥追加（リアクション事故防止）
  ]
});

const voiceStartTimes = new Map();

const CONFIG = {

  welcomeMessage: (member) =>
    `キヴォトスへようこそ ${member.user.username}先生！お知らせの確認と自己紹介をお願いします！`,

  keywordReplies: [
    {
      keywords: ["アロナ"],
      reply: "こんにちアロナ！",
      name: "アロナ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517821570175864952/E382A2E383ADE3838A_E382A2E383ADE3838A5FE585A8E8BAAB2E706E67.jpeg",
      color: "#00DCFF"
    },
    {
      keywords: ["プラナ"],
      reply: "こんにちプラナ",
      name: "プラナ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517821587259265085/E38397E383A9E3838A_41524F4E412E706E67.jpeg",
      color: "#ff92db"
    },
    {
      keywords: ["アロナ", "プラナ"],
      reply: "アロプラチャンネルです！",
      name: "アロナ&プラナ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517821613158957187/74732e8a051af245.jpg",
      color: "#bb8eff"
    }
  ],

  voiceStartMessage: () =>
    `通話を開始します！<:Arona:1517203866251427931>`,

  voiceEndMessage: (channel, durationText) =>
    `通話を終了します。${durationText} また来てくださいね！<:Hoshino:1517204960734085260>`,
};

const VOICE_LOG_CHANNELS = {
  "1517236465334095973": "1517233481577402461",
};

const reactionRoles = {
  '1517773559814946926': {
    '🎮': 'ロールID1',
    '1️⃣':'1517225234577490211',
  },
};

// =====================
// サーバー参加
// =====================
client.on(Events.GuildMemberAdd, member => {
  const channel = member.guild.systemChannel;
  if (!channel) return;
  channel.send(CONFIG.welcomeMessage(member));
});

// =====================
// 自動返信
// =====================
client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;

  const embeds = [];

  for (const item of CONFIG.keywordReplies) {

    const allMatch = item.keywords.every(word =>
      message.content.includes(word)
    );

    if (allMatch) {
      const embed = new EmbedBuilder()
        .setColor(item.color || '#00DCFF')
        .setDescription(item.reply)
        .setAuthor({
          name: item.name,
          iconURL: item.icon
        });

      embeds.push(embed);
    }
  }

  if (embeds.length === 0) return;

  for (let i = 0; i < embeds.length; i += 10) {
    await message.reply({ embeds: embeds.slice(i, i + 10) });
  }
});

// =====================
// 通話ログ
// =====================
client.on(Events.VoiceStateUpdate, (oldState, newState) => {

  if (!oldState.channel && newState.channel) {

    const vc = newState.channel;
    const logChannelId = VOICE_LOG_CHANNELS[vc.id];
    if (!logChannelId) return;

    const logChannel = vc.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    if (vc.members.size === 1) {
      voiceStartTimes.set(vc.id, Date.now());

      const embed = new EmbedBuilder()
        .setColor('#00DCFF')
        .setDescription(`### ${CONFIG.voiceStartMessage(vc)}`);

      logChannel.send({ embeds: [embed] });
    }
  }

  if (oldState.channel && !newState.channel) {

    const vc = oldState.channel;

    const logChannelId = VOICE_LOG_CHANNELS[vc.id];
    if (!logChannelId) return;

    const logChannel = vc.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    if (vc.members.size === 0) {

      const startTime = voiceStartTimes.get(vc.id);

      let durationText = "不明";

      if (startTime) {
        const seconds = Math.floor((Date.now() - startTime) / 1000);

        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        durationText = `${h}時間${m}分${s}秒の通話でした！`;

        voiceStartTimes.delete(vc.id);
      }

      const embed = new EmbedBuilder()
        .setColor('#00DCFF')
        .setDescription(`### ${CONFIG.voiceEndMessage(vc, durationText)}`);

      logChannel.send({ embeds: [embed] });
    }
  }
});

// =====================
// リアクションロール
// =====================
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;

  try {
    if (reaction.partial) await reaction.fetch();

    const roleMap = reactionRoles[reaction.message.id];
    if (!roleMap) return;

    const emojiKey = reaction.emoji.id || reaction.emoji.name;
    const roleId = roleMap[emojiKey];
    if (!roleId) return;

    const member = await reaction.message.guild.members.fetch(user.id);

    if (!member.roles.cache.has(roleId)) {
      await member.roles.add(roleId);
    }
  } catch (err) {
    console.error(err);
  }
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
  if (user.bot) return;

  try {
    if (reaction.partial) await reaction.fetch();

    const roleMap = reactionRoles[reaction.message.id];
    if (!roleMap) return;

    const emojiKey = reaction.emoji.id || reaction.emoji.name;
    const roleId = roleMap[emojiKey];

    const member = await reaction.message.guild.members.fetch(user.id);

    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);
    }
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.TOKEN);
