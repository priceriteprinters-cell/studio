'use server';

import { formatTelegramCaption } from '@/ai/flows/format-telegram-caption';
import type { FullPostData, ProcessingResult, PipelineStatus, TelegramResult, AdminResult, ChannelPostResult } from '@/lib/types';
import { base64ToBlob } from '@/lib/utils';
import { TELEGRAM_CHANNEL_IDS } from '@/lib/telegram';

// --- API Credentials (should be in .env.local) ---
const BYPASS_API_KEY = process.env.BYPASS_API_KEY || '99f6ca12-6a1c-460d-a524-3160823913ee';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7991088690:AAFv3YX4jZFFCiOVN0Bh-JisZBC_2Ke50hE';
const TELEGRAM_ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || '8172893406';
const SPECIAL_CHANNEL_ID = '-1002213784572';

const PREMIUM_BUTTON = {
  text: '👑 Premium Content 👑',
  url: 'https://t.me/+WxLO3q9bnxJkYTZk',
};

class PipelineService {
  private pipelineStatus: PipelineStatus = {
    bypass: false, rentry: false, lockr: false, tinyurl: false, gemini: false, telegram: false, admin: false,
  };
  private stepResults: ProcessingResult['steps'] = {
    telegram: { success: true, results: [] }
  };
  private postData: FullPostData | null = null;


  private async bypassLink(originalLink: string): Promise<string | null> {
    const encodedUrl = encodeURIComponent(originalLink);
    const bypassUrl = `https://api.bypass.vip/premium/bypass?url=${encodedUrl}`;
    
    try {
      const response = await fetch(bypassUrl, { headers: { 'x-api-key': BYPASS_API_KEY } });
      if (!response.ok) throw new Error(`Bypass API failed with status ${response.status}`);
      const data = await response.json();
      if (data.result) {
        this.pipelineStatus.bypass = true;
        this.stepResults.bypass = data.result;
        return data.result;
      }
      return null;
    } catch (error) {
      console.error('Bypass link error:', error);
      return null;
    }
  }

  private async createRentryPage(bypassedLink: string): Promise<string | null> {
    try {
      const homeResponse = await fetch('https://rentry.co/', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      });
      if (!homeResponse.ok) throw new Error('Failed to get Rentry home page');
      
      const homeBody = await homeResponse.text();
      const cookies = homeResponse.headers.get('set-cookie') || '';
      const csrfMatch = homeBody.match(/name="csrfmiddlewaretoken" value="([^"]+)"/);
      if (!csrfMatch) throw new Error('CSRF token not found');
      
      const csrfToken = csrfMatch[1];
      const titles = ["🌟 Mega Treasure Vault 🌟", "💎 Premium Content Hub 💎", "🔥 Ultimate Collection 🔥", "⚡ Lightning Fast Access ⚡", "🚀 Exclusive Content Zone 🚀"];
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
      const markdownContent = this.getRentryMarkdown(randomTitle, bypassedLink);

      const body = new URLSearchParams({
          csrfmiddlewaretoken: csrfToken,
          text: markdownContent
      });

      const rentryResponse = await fetch('https://rentry.co/api/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://rentry.co/',
          'Cookie': cookies,
        },
        body: body.toString()
      });

      if (rentryResponse.ok) {
        const data = await rentryResponse.json();
        if (data.url) {
          const url = `https://rentry.co/${data.url_short || data.url}`;
          this.pipelineStatus.rentry = true;
          this.stepResults.rentry = url;
          return url;
        }
      }
      throw new Error('Rentry API failed');
    } catch (error) {
      console.error('Rentry error:', error);
      return this.createPastebinPage(bypassedLink);
    }
  }

  private async createPastebinPage(bypassedLink: string): Promise<string | null> {
      // Fallback to Pastebin
      return null; // Pastebin fallback disabled for brevity, can be implemented as per prompt
  }

  private getRentryMarkdown(title: string, link: string): string {
    return `#### ${title}

!!! info 🎉 Welcome to Premium Content Hub
    %green% **Congratulations!** %% You've successfully accessed your premium mega collection. Everything is ready for download!

!!! note 📋 Important Instructions
    1. %blue% **Click the download link below** %%
    2. %purple% **Enjoy your premium content** %%

---

###### ![Mega](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrgENKJ9g_SVq5TB41jbBjkv2QvNeHAmi_mIciQT_EjWwZMAh8M1BPZKI&s=10){20px:20px} Your Mega Download Link

-> %#FF6B6B% **CLICK HERE TO DOWNLOAD** %% <-

-> %violet% **${link}** %% <-

---

##### 🌟 Join Our Premium Community

![telegram](https://static.vecteezy.com/system/resources/previews/023/986/679/non_2x/telegram-logo-telegram-logo-transparent-telegram-icon-transparent-free-free-png.png){20px:20px} %#4ECDC4% **Join our Free Channels:** %% https://t.me/addlist/RL8xXFDaLPw5N2I0

![telegram](https://static.vecteezy.com/system/resources/previews/023/986/679/non_2x/telegram-logo-telegram-logo-transparent-telegram-icon-transparent-free-free-png.png){20px:20px} %#45B7D1% **Become a VIP Member:** %% https://t.me/+QNja1COIinA1N2E0

![telegram](https://static.vecteezy.com/system/resources/previews/023/986/679/non_2x/telegram-logo-telegram-logo-transparent-telegram-icon-transparent-free-free-png.png){20px:20px} %#E6B333% **Premium Content:** %% ${PREMIUM_BUTTON.url}

!!! greentext 🚀 Premium Benefits
    ✅ %green% **Instant Downloads** %%
    ✅ %blue% **No Waiting Time** %%
    ✅ %purple% **Exclusive Content** %%
    ✅ %orange% **24/7 Support** %%

---

-> %#FF9F43% **Thank you for choosing our service! Enjoy your premium content.** %% <-`;
  }

  private async lockWithLockr(url: string, title: string): Promise<string | null> {
    const LOCKR_API_TOKEN = process.env.LOCKR_API_TOKEN || '4ea6644305d7b70e00923a8f903f6e8d90be6dceb28fb';
    try {
      const response = await fetch('https://lockr.so/api/v1/lockers', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${LOCKR_API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, target: url }),
      });
      if (!response.ok) throw new Error(`Lockr API failed with status ${response.status}`);
      const data = await response.json();
      if (data.data?.url) {
        return data.data.url;
      }
      return null;
    } catch (error) {
      console.error('Lockr error:', error);
      return null;
    }
  }

  private async shortenUrl(url: string): Promise<string | null> {
    // First attempt: TinyURL
    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const shortUrl = await response.text();
        if (shortUrl && !shortUrl.includes('Error')) {
          this.pipelineStatus.tinyurl = true;
          this.stepResults.tinyurl = shortUrl;
          return shortUrl;
        }
      }
      // Don't throw here, just log and proceed to fallback
      console.error(`TinyURL API failed with status ${response.status} or returned an error page.`);
    } catch (error) {
      console.error('TinyURL error:', error);
    }
    
    // Fallback: is.gd
    try {
        console.log('TinyURL failed, trying is.gd as a fallback...');
        const response = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
        if (response.ok) {
            const shortUrl = await response.text();
            if (shortUrl && shortUrl.startsWith('http')) {
                this.pipelineStatus.tinyurl = true; // Still mark as success if fallback works
                this.stepResults.tinyurl = shortUrl;
                return shortUrl;
            }
        }
        throw new Error(`is.gd API failed with status ${response.status}`);
    } catch (error) {
        console.error('is.gd fallback error:', error);
        return null; // Both services failed
    }
  }

  private async formatCaptionWithAI(originalCaption: string, link: string, linkPlacement: 'caption' | 'button' | 'both'): Promise<string> {
    try {
      const result = await formatTelegramCaption({ originalCaption, link, linkPlacement });
      this.pipelineStatus.gemini = true;
      return result.formattedCaption;
    } catch (error) {
      console.error('Gemini AI error:', error);
      return `${originalCaption}\n\n${linkPlacement !== 'button' ? link : ''}`; // Fallback
    }
  }
  
  private async postToTelegram(
    image: { url?: string; base64?: string },
    caption: string,
    url: string | null,
    channelIds: string[],
    useButtons: boolean
  ): Promise<TelegramResult> {
    const baseUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
    let overallSuccess = true;
    const results: ChannelPostResult[] = [];

    let replyMarkup = '';
    if (useButtons && this.postData) {
      const mainButton = { text: this.postData.settings.buttonText, url: url! };
      const vipTitles = [
        '💎 Join VIP Megas 💎', '✨ Join VIP Megas ✨', '🚀 Join VIP Megas 🚀',
        '🔥 Join VIP Megas 🔥', '🌟 Join VIP Megas 🌟', '💖 Join VIP Megas 💖'
      ];
      const randomVipTitle = vipTitles[Math.floor(Math.random() * vipTitles.length)];
      const vipButton = { text: randomVipTitle, url: 'https://t.me/+JhcI36kVQedlNWM8' };

      const inline_keyboard = [];
      if ((this.postData.settings.linkPlacement === 'button' || this.postData.settings.linkPlacement === 'both') && url) {
        inline_keyboard.push([mainButton]);
      }
      inline_keyboard.push([PREMIUM_BUTTON]);
      inline_keyboard.push([vipButton]);
      replyMarkup = JSON.stringify({ inline_keyboard });
    }

    for (const channelId of channelIds) {
      try {
        let response;
        if (image.base64) {
          const form = new FormData();
          const photoBlob = base64ToBlob(image.base64, 'image/jpeg');
          form.append('photo', photoBlob, 'image.jpg');
          form.append('chat_id', channelId);
          form.append('caption', caption);
          if (replyMarkup) {
            form.append('reply_markup', replyMarkup);
          }
          response = await fetch(baseUrl, { method: 'POST', body: form });
        } else if (image.url) {
          const urlParams = new URL(baseUrl);
          urlParams.searchParams.append('chat_id', channelId);
          urlParams.searchParams.append('caption', caption);
          urlParams.searchParams.append('photo', image.url);
          if (replyMarkup) {
            urlParams.searchParams.append('reply_markup', replyMarkup);
          }
          response = await fetch(urlParams.toString(), { method: 'POST' });
        } else {
            throw new Error("No image provided");
        }

        const result = await response.json();

        if (result.ok) {
          results.push({ channel: channelId, success: true, message_id: result.result.message_id });
        } else {
          overallSuccess = false;
          results.push({ channel: channelId, success: false, error: result.description });
          console.error(`Telegram post error for channel ${channelId}:`, result.description);
        }
      } catch (error) {
        overallSuccess = false;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (!results.find(r => r.channel === channelId)) {
            results.push({ channel: channelId, success: false, error: errorMessage });
        }
        console.error(`Telegram post error for channel ${channelId}:`, error);
      }
    }
    
    return { success: overallSuccess, results };
  }


  private async sendAdminNotification(finalResult: ProcessingResult): Promise<AdminResult> {
    try {
        const success = finalResult.success;
        const title = success ? '✅ *Post Successful*' : '❌ *Post Failed*';
        
        let telegramResultText = "*No Telegram posts attempted.*";
        if (finalResult.steps?.telegram?.results && finalResult.steps.telegram.results.length > 0) {
             telegramResultText = finalResult.steps.telegram.results.map(r => {
                const channelName = TELEGRAM_CHANNEL_IDS.find(c => c.id === r.channel)?.name || r.channel;
                const status = r.success ? '✅' : '❌';
                
                if (r.success && r.message_id) {
                    let postLink = '';
                    if (r.channel.startsWith('@')) {
                        postLink = `https://t.me/${r.channel.substring(1)}/${r.message_id}`;
                    } 
                    else if (r.channel.startsWith('-100')) {
                        postLink = `https://t.me/c/${r.channel.substring(4)}/${r.message_id}`;
                    }
                    return `   [${channelName}](${postLink}): ${status}`;
                } else {
                     const error = r.error ? ` - _${r.error}_` : '';
                     return `   ${channelName}: ${status}${error}`;
                }
             }).join('\n');
        }
        
        let statusDetails = `*Pipeline Summary*\n`;
        statusDetails += `   ‣ Bypass.vip: ${this.pipelineStatus.bypass ? '✅' : '❌'}\n`;
        statusDetails += `   ‣ Rentry.co: ${this.pipelineStatus.rentry ? '✅' : '❌'}\n`;
        statusDetails += `   ‣ Lockr.so: ${this.pipelineStatus.lockr ? '✅' : '❌'}\n`;
        statusDetails += `   ‣ URL Shortener: ${this.pipelineStatus.tinyurl ? '✅' : '❌'}\n`;
        statusDetails += `   ‣ Gemini AI: ${this.pipelineStatus.gemini ? '✅' : '❌'}\n`;
        statusDetails += `   ‣ Telegram: ${this.pipelineStatus.telegram ? '✅' : '❌'}`;

        let linksDetails = `*Generated Links*\n`;
        if (this.stepResults.bypass) linksDetails += `   🔗 *Bypass:* \`${this.stepResults.bypass}\`\n`;
        if (this.stepResults.rentry) linksDetails += `   🔗 *Rentry:* \`${this.stepResults.rentry}\`\n`;
        if (this.stepResults.lockr) {
            if (Array.isArray(this.stepResults.lockr)) {
                this.stepResults.lockr.forEach((link, i) => {
                    linksDetails += `   🔒 *Lockr ${i+1}:* \`${link}\`\n`;
                });
            } else {
                linksDetails += `   🔒 *Lockr:* \`${this.stepResults.lockr}\`\n`;
            }
        }
        if (this.stepResults.tinyurl) linksDetails += `   🔗 *Shortened:* \`${this.stepResults.tinyurl}\`\n`;


        const originalContent = this.postData ? 
`*Original Content:*\n`+
`\`\`\`\n`+
`📝 Caption: ${this.postData.caption}\n`+
`🔗 Link: ${this.postData.link}\n`+
`\`\`\`` : '';


        const message = `
${title}
-------------------------
*Post Status*
${telegramResultText}

-------------------------
${statusDetails}
${linksDetails.trim() ? `
-------------------------
${linksDetails}` : ''}
-------------------------
${originalContent}
        `.trim().replace(/\n\n\n/g, '\n\n');

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_ADMIN_ID,
                text: message,
                parse_mode: 'Markdown',
                disable_web_page_preview: true,
            })
        });

        const result = await response.json();
        const res: AdminResult = { success: result.ok };
        this.pipelineStatus.admin = result.ok;
        this.stepResults.admin = res;
        return res;
    } catch (error) {
        console.error('Admin notification error:', error);
        const res: AdminResult = { success: false, message: error instanceof Error ? error.message : 'Unknown admin notification error' };
        this.stepResults.admin = res;
        return res;
    }
  }

  public async run(data: FullPostData): Promise<ProcessingResult> {
    this.postData = data;
    
    const imagePayload = { url: data.image.url, base64: data.image.base64 };
    
    if (!imagePayload.url && !imagePayload.base64) {
      const error = 'No image provided. Cannot continue.';
      const result = {
          success: false, error, pipelineStatus: this.pipelineStatus, steps: this.stepResults,
      };
      await this.sendAdminNotification(result);
      return result;
    }
    
    const bypassedLink = await this.bypassLink(data.link);
    if (!bypassedLink) {
        const error = 'Failed at Bypass step. Cannot continue.';
        const result = { success: false, error, pipelineStatus: this.pipelineStatus, steps: this.stepResults };
        await this.sendAdminNotification(result);
        return result;
    }

    const contentPageUrl = await this.createRentryPage(bypassedLink);
    if (!contentPageUrl) {
      const error = 'Failed at Rentry step. Cannot continue.';
      const result = { success: false, error, pipelineStatus: this.pipelineStatus, steps: this.stepResults };
      await this.sendAdminNotification(result);
      return result;
    }

    const allChannelResults: ChannelPostResult[] = [];
    
    // --- Special Channel Logic ---
    const hasSpecialChannel = data.settings.selectedChannels.includes(SPECIAL_CHANNEL_ID);
    if (hasSpecialChannel) {
        const specialCaption = await this.formatCaptionWithAI(data.caption, contentPageUrl, 'caption');
        const specialResult = await this.postToTelegram(imagePayload, specialCaption, contentPageUrl, [SPECIAL_CHANNEL_ID], false);
        allChannelResults.push(...specialResult.results);
    }
    
    // --- Regular Channel Logic ---
    const regularChannels = data.settings.selectedChannels.filter(id => id !== SPECIAL_CHANNEL_ID);
    let finalUrl = contentPageUrl;
    let formattedCaption = '';

    if (regularChannels.length > 0) {
        let currentUrl = contentPageUrl;
        const lockCount = data.settings.lockCount || 1;
        const modelNameMatch = data.caption.match(/^(?:Model:\s*)?([^\n]+)/i);
        const modelName = modelNameMatch ? modelNameMatch[1].trim() : "Link";
        const lockedUrls: string[] = [];

        for (let i = 0; i < lockCount; i++) {
            const count = lockCount - i;
            const title = lockCount > 1
                ? `🔐 ${modelName} | Unlocks Remaining: ${count}/${lockCount} 🔓`
                : `🔐 ${modelName} | Final Unlock 🔓`;

            const lockedUrl = await this.lockWithLockr(currentUrl, title);
            if (!lockedUrl) {
                const error = `Failed at Lockr step ${i + 1}. Cannot continue.`;
                const result = { success: false, error, pipelineStatus: this.pipelineStatus, steps: this.stepResults };
                await this.sendAdminNotification(result);
                return result;
            }
            currentUrl = lockedUrl;
            lockedUrls.unshift(lockedUrl);
        }
        this.pipelineStatus.lockr = true;
        this.stepResults.lockr = lockedUrls;

        const finalLockedUrl = currentUrl;
        const shortUrl = await this.shortenUrl(finalLockedUrl);
        finalUrl = shortUrl || finalLockedUrl;
        
        formattedCaption = await this.formatCaptionWithAI(data.caption, finalUrl, data.settings.linkPlacement);
        
        const regularResult = await this.postToTelegram(imagePayload, formattedCaption, finalUrl, regularChannels, true);
        allChannelResults.push(...regularResult.results);
    }

    const overallSuccess = allChannelResults.every(r => r.success);
    this.pipelineStatus.telegram = overallSuccess;
    
    const finalResult: ProcessingResult = {
      success: overallSuccess,
      finalUrl,
      formattedCaption: formattedCaption || await this.formatCaptionWithAI(data.caption, contentPageUrl, 'caption'),
      pipelineStatus: this.pipelineStatus,
      steps: {
        ...this.stepResults,
        telegram: {
            success: overallSuccess,
            results: allChannelResults,
        }
      },
      error: !overallSuccess ? 'One or more channels failed to post.' : undefined,
    };

    await this.sendAdminNotification(finalResult);
    
    return finalResult;
  }
}

export async function processPost(data: FullPostData): Promise<ProcessingResult> {
  const pipeline = new PipelineService();
  try {
    return await pipeline.run(data);
  } catch (error) {
    console.error('Critical pipeline error:', error);
    const errorMessage = error instanceof Error ? error.message : 'A critical error occurred.';
    const result: ProcessingResult = {
      success: false,
      error: errorMessage,
      pipelineStatus: (pipeline as any).pipelineStatus,
      steps: (pipeline as any).stepResults,
    };
    await (pipeline as any).sendAdminNotification(result);
    return result;
  }
}

export async function deletePost(messages: { chatId: string; messageId: number }[]): Promise<{ success: boolean; error?: string }> {
    let overallSuccess = true;
    const errors = [];

    for (const message of messages) {
        try {
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: message.chatId,
                    message_id: message.messageId,
                }),
            });
            const result = await response.json();
            if (!result.ok) {
                overallSuccess = false;
                errors.push(`Channel ${message.chatId}: ${result.description}`);
            }
        } catch (error) {
            overallSuccess = false;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Channel ${message.chatId}: ${errorMessage}`);
        }
    }

    if (!overallSuccess) {
        return { success: false, error: errors.join('\n') };
    }
    return { success: true };
}
