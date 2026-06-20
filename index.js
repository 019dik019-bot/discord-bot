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
    },

    {
      keywords: ["エッチ"],
      reply: "エッチなのはダメ！死刑！！",
      name: "コハル",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517871218823532715/E382B3E3838FE383AB_E382B3E3838FE383AB5FE7AB8BE381A1E7B5B5302E706E67.jpeg?ex=6a37db3b&is=6a3689bb&hm=bc982130927d8f218c1198ba79935eebf0a9fcba1d80d7a7b056e52b3d596932&",
      color: "#ff4ac3"
    },

    {
      keywords: ["エロ"],
      reply: "エッチなのはダメ！死刑！！",
      name: "コハル",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517871218823532715/E382B3E3838FE383AB_E382B3E3838FE383AB5FE7AB8BE381A1E7B5B5302E706E67.jpeg?ex=6a37db3b&is=6a3689bb&hm=bc982130927d8f218c1198ba79935eebf0a9fcba1d80d7a7b056e52b3d596932&",
      color: "#ff4ac3"
    },

    {
      keywords: ["うへ"],
      reply: "うへ〜",
      name: "ホシノ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517872196230320159/E3839BE382B7E3838E_E3839BE382B7E3838E5F302E706E67.jpeg?ex=6a37dc24&is=6a368aa4&hm=641aa82ada7810378bcb681528c6bc79a69faa16e08d0b1aa55877dd7ce210ff&",
      color: "#ffb3d6"
    },

    {
      keywords: ["祈る"],
      reply: "それじゃあ...祈るね☆",
      name: "ミカ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517873188464496751/E3839FE382AB_E3839FE382AB5FE7AB8BE381A1E7B5B5312E706E67.jpeg?ex=6a37dd10&is=6a368b90&hm=4da8a7be6af83ce59e41ef3319d92425955fdd5e57c111257ccb501db7d31674&",
      color: "#fbbdff"
    },

    {
      keywords: ["折る"],
      reply: "それじゃあ...折るね☆",
      name: "ミカ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517873188464496751/E3839FE382AB_E3839FE382AB5FE7AB8BE381A1E7B5B5312E706E67.jpeg?ex=6a37dd10&is=6a368b90&hm=4da8a7be6af83ce59e41ef3319d92425955fdd5e57c111257ccb501db7d31674&",
      color: "#fbbdff"
    },

    {
      keywords: ["ペロロ"],
      reply: "ぺロロ様！",
      name: "ヒフミ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517875011820454058/E38392E38395E3839F_E38392E38395E3839F5F302E706E67.jpeg?ex=6a37dec3&is=6a368d43&hm=d0f285718c1bc7bcb14612e1d6b7a0eebf97d3074cdb19a44a225f9bd88fa21c&",
      color: "#ffe684"
    },

    {
      keywords: ["パヒャ"],
      reply: "パヒャヒャ！",
      name: "ノゾミ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517876652724588544/E3838EE382BEE3839F_E3838EE382BEE3839F2E706E67.jpeg?ex=6a37e04a&is=6a368eca&hm=76fa3725d15a88d672f958ccf9df2661ab523186deea6f7512779dceba2f1e84&",
      color: "#b7ff84"
    },

    {
      keywords: ["にゅふ"],
      reply: "にゅふふ♪",
      name: "エリ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517878434313932913/CH0304_spr_00_2.0527999999999995_1.jpeg?ex=6a37e1f3&is=6a369073&hm=cd8c8539e20f94e855ee41a88b2eb7950295ea5fc56f553e0cb3782a5a291812&",
      color: "#ff8079"
    },

    {
      keywords: ["セクシー"],
      reply: "セクシーセイアですまない。",
      name: "セイア",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517879236453601320/E382BBE382A4E382A2_E382BBE382A4E382A25FE7AB8BE381A1E7B5B5302E706E67.jpeg?ex=6a37e2b2&is=6a369132&hm=80b1b2a9ceeaad06426275774adf6236c49e2034838a67efa64e611031f841a4&",
      color: "#ffdfa0"
    },

    {
      keywords: ["全知"],
      reply: "ミレニアムが誇る超天才清楚系病弱美少女ハッカーであり、「全知」の学位を持つ眉目秀麗な乙女のこの私を呼びましたか？",
      name: "ヒマリ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517881290550935573/E38392E3839EE383AA_E38392E3839EE383AA5FE59CA7E7B8AE2E706E67.jpeg?ex=6a37e49c&is=6a36931c&hm=b626afc9546ad9b090ff53b7081061d91b813f60c9b459f5ebb87b5b36c9358f&",
      color: "#ffffff",
    },

    {
      keywords: ["ぴょん"],
      reply: "ぴょん。",
      name: "トキ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517882227558711467/E38388E382AD_E38388E382AD2E706E67.jpeg?ex=6a37e57b&is=6a3693fb&hm=ac18ef6f091b946b6e4b75c3dc5cd9f6e747ea9a813e6c0d826924d72c653fa8&",
      color: "#00b3ff"
    },

    {
      keywords: ["はっちゃ"],
      reply: "はっちゃー！",
      name: "コユキ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517884581548789810/E382B3E383A6E382AD_E382B3E383A6E382ADEFBC88E588B6E69C8DEFBC895FE59CA7E7B8AE2E706E67.jpeg?ex=6a37e7ad&is=6a36962d&hm=3b082b7a827ddfe929f28ccc20f64b1f0f5504301f045065d45a527a6943319d&",
      color: "#ffa3e0"
    },

    {
      keywords: ["囧"],
      reply: "うあぁああああーなんでー",
      name: "コユキ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517888181238763581/FoFAdkWaAAACuTO_2.jpg?ex=6a37eb07&is=6a369987&hm=2a235d7dad99c8e0d416c799e6353e5604d9e1fa1954e4b79d10baa6870194fa&",
      color: "#ffa3e0"
    },

    {
      keywords: ["エビ"],
      reply: "エビが消えた？",
      name: "ミヤコ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517889496060792892/E3839FE383A4E382B3EFBC88E6B0B4E79D80EFBC89_E3839FE383A4E382B3EFBC88E6B0B4E79D80EFBC892E706E67.jpeg?ex=6a37ec40&is=6a369ac0&hm=523be8fed8769ad09a909a71b1eec480c2dec8b11168f828db2b0a780df2ce2d&",
      color: "#7dcdff"
    },

    {
      keywords: ["わっぴ"],
      reply: "わっぴ〜！",
      name: "サクラコ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517890636119015484/E382B5E382AFE383A9E382B3_E382B5E382AFE383A9E382B35F322E706E67.jpeg?ex=6a37ed50&is=6a369bd0&hm=6fc949fe9891d835a5c7a022381870beb7739eb1cd9a481020a2bd59b46c08fe&",
      color: "#c4fea7"
    },
    {
      keywords: ["レイサ"],
      reply: "呼ばれて飛び出て！参りました！ みんなのスーパースター、宇沢レイサ、登場です！",
      name: "レイサ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517891739686535239/E383ACE382A4E382B5_E383ACE382A4E382B52E706E67.jpeg?ex=6a37ee57&is=6a369cd7&hm=b62ad465da7af9975311a3ee7611ce74c670ebd540251c137fb213d25e30ba5f&",
      color: "#aebafd"
    },

    {
      keywords: ["ロールケーキ"],
      reply: "ロールケーキをぶち込みますよっ！？",
      name: "ナギサ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517894293598109866/E3838AE382AEE382B5_E3838AE382AEE382B5EFBC88E7AB8BE381A1EFBC892E706E67.jpeg?ex=6a37f0b8&is=6a369f38&hm=8e3029011d47a7eeb2a26a591ee03617ebe73011b0a8da8cd053feaca9c63941&",
      color: "#e0dfbc"
    },

    {
      keywords: ["ケイちゃん"],
      reply: "先生を殺して私も死にます！",
      name: "ケイ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517895536529641542/b58f8c5494eef01f3a293e2c89a28e25bc315d60d79c_3_4.jpeg?ex=6a37f1e1&is=6a36a061&hm=bed996c1658e683a52a534ef0673c20fb834c5e7e1146cbf8f15164007f33a7f&",
      color: "#ff54b5"
    },

     {
      keywords: ["光"],
      reply: "光よ！",
      name: "アリス",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517897372594602034/E382A2E383AAE382B9_E382A2E383AAE382B95F322E706E67.jpeg?ex=6a37f396&is=6a36a216&hm=e511f64036073a32d214de9f8855b4b0d2506afb5fd01539278af6ecbde5623f&",
      color: "#00a6ff"
    },

    {
      keywords: ["にん"],
      reply: "にんにん！",
      name: "イズナ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517898662527897600/E382A4E382BAE3838A_E382A4E382BAE3838A5F322E706E67.jpeg?ex=6a37f4ca&is=6a36a34a&hm=a075072ec1856073b63f4dbbf0b7ee56a381896a0717a00ad9c39775342edd0a&",
      color: "#ff007b"
    },

    {
      keywords: ["粛清"],
      reply: "全員粛清だ！",
      name: "チェリノ",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517900454707593466/E38381E382A7E383AAE3838E_E38381E382A7E383AAE3838E5F322E706E67.jpeg?ex=6a37f675&is=6a36a4f5&hm=4803eba59387798aced2afbf73303cd7c674505b0700f5d824ddd1ccbd3c6939&",
      color: "#ff4b4b"
    },

    {
      keywords: ["おはよう"],
      reply: "おはようじょー！",
      name: "シュエリン",
      icon: "https://cdn.discordapp.com/attachments/1517811050307915826/1517901487051636836/shun_small.jpeg?ex=6a37f76b&is=6a36a5eb&hm=2bebd63bc3b649d6745f4d735421288a81628403b345dda1e16f93ce14d486eb&",
      color: "#9fff4b"
    },
  ],

  voiceStartMessage: (channel) =>
    `通話を開始します！<:Arona:1517203866251427931>`,

  voiceEndMessage: (channel, durationText) =>
    `通話を終了します。${durationText} また来てくださいね！<:Hoshino:1517204960734085260>`,
};

const VOICE_LOG_CHANNELS = {
  "1517236465334095973": "1517233481577402461",
  "1517224273251532881": "1517224234248569015",
  "1517218696085504110": "1517218586622558378",
  "1517232047205122188": "1517230723935899658",
  "1517232300545278132": "1517230777102893186",
  "1517233631871897811": "1517219816480440401",
  "1517234369004175500": "1517234090267643986",
};

const reactionRoles = {
  '1517773559814946926': {
    '🎮': 'ロールID1',
    '1️⃣':'1517225234577490211',
    '2️⃣':'1517225899202711674',
    '3️⃣':'1517225954286768188',
    '4️⃣':'1517226056170340605',
    '5️⃣':'1517227002137153546',
    '6️⃣':'1517227086710964414',
    '🇪':'1517227124803637339',
    '🔚':'1517227212493819904',
    '0️⃣':'1517227266441084989',
    '🇽':'1517227294270292089',
    '🆕':'1517227729186066484',
    '⭕':'1517231254250983434',
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
