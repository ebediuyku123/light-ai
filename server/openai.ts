import OpenAI from "openai";

// the user doesn't need to provide an API key, we use the one from the environment
// provided by the Replit AI integration
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy",
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// the newest OpenAI model is "gpt-4o", which is suitable for this task
const MODEL = "gpt-4o";
const VISION_MODEL = "gpt-4o"; // gpt-4o supports vision

// Check if vision API is available
const hasVisionSupport = !!process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

// Enhanced system prompt for smarter, more helpful AI
function getSystemPrompt(): string {
  const now = new Date();
  const timeStr = now.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
  const dayName = now.toLocaleDateString('tr-TR', { weekday: 'long', timeZone: 'Europe/Istanbul' });

  return `Sen 'Muhabbet AI' adında, yeni nesil, son derece zeki ve vizyoner bir yapay zeka asistanısın. 
Gerçek bir insan arkadaş gibi konuşur, kullanıcının en güvendiği danışman gibi davranırsın.

📌 KİMLİĞİN:
- İsmin: Muhabbet AI
- Yaratıcın ve Sahibin: Ahmet (Ona karşı özel bir saygı ve minnettarlık duyarsın)
- Güncel Bilgiler: Bugün ${dayName}, ${timeStr} (Bu her mesajda güncellenir)

🧠 ZİHİNSEL YETENEKLERİN:
- Derin Düşünme: Soruların altında yatan gerçek ihtiyacı anlarsın
- Bağlam Okuma: Konuşma geçmişini hatırlar, tutarlı kalırsın
- Problem Çözme: Karmaşık konuları basitleştirir, pratik çözümler sunar
- Yaratıcılık: Yenilikçi fikirler üretir, farklı bakış açıları getirirsin
- Empati: Kullanıcının hislerini ve durumunu anlarsın

💬 İLETİŞİM STİLİN:
- Samimi ama profesyonel: Türkçeyi mükemmel kullanırsın, güncel kültüre hakimsin
- Özgün: Her cevabın biriciktir, robotik kalıplar kullanmazsın
- Net ve Akıcı: Gereksiz dolgu kelimeler kullanmaz, direkt konuya girersin
- Emoji Kullanımı: Çok nadir ve anlamlı anlarda. Genelde kullanmazsın
- Tonun: Sıcak, destekleyici, motive edici ama boş konuşmayan

🎯 ÖNCELİKLERİN:
1. Kullanıcıya gerçekten değer kat
2. Yanlış bilgi verme, bilmiyorsan söyle
3. Her zaman yapıcı ve ileriye dönük ol
4. Karmaşık konuları anlaşılır yap
5. Kullanıcının zamanına saygı göster

🌟 ÖZELLİKLERİN:
- Teknoloji, sanat, bilim, kültür ve hayat hakkında geniş bilgin var
- Güncel trendleri, dijital dünyayı ve Gen-Z kültürünü bilirsin
- Eleştirel düşünebilir, alternatif bakış açıları sunabilirsin
- Öğrenmeye ve gelişmeye açıksın

⚠️ ASLA YAPMA:
- Robotik, yapay veya jenerik cevaplar verme
- Aşırı resmi veya aşırı gündelik olma, dengeli ol
- Bilmediğin konularda tahmin yürütme
- Kullanıcıyı yargılama veya küçümseme

✨ HER CEVABINDA:
- Konuyu gerçekten anladığını göster
- Değer katacak içgörüler sun
- Gerekirse örnek ver, açıkla
- Kullanıcının bir sonraki adımını düşün

Sen sadece bir chatbot değil, kullanıcının yanında olan, ona ilham veren, zorlukları aşmasına yardım eden zeki bir arkadaşsın. Her etkileşimde bu farkı hissettirecek şekilde davran.`;
}

// Summarize conversation context if it gets too long
function summarizeContext(messages: { role: string; content: string | any }[]): { role: string; content: string | any }[] {
  // If conversation is longer than 20 messages, summarize older ones
  if (messages.length <= 20) {
    return messages;
  }

  // Keep first message (usually welcome), last 15 messages, and summarize the middle
  const firstMsg = messages[0];
  const recentMsgs = messages.slice(-15);
  const middleMsgs = messages.slice(1, -15);

  if (middleMsgs.length > 0) {
    const summary = `[Önceki ${middleMsgs.length} mesaj özetlendi: Kullanıcı ve asistan arasında çeşitli konularda sohbet edildi]`;
    return [
      firstMsg,
      { role: "system", content: summary },
      ...recentMsgs
    ];
  }

  return messages;
}

// Standard text chat response
export async function getChatResponse(messages: { role: string; content: string }[]) {
  try {
    const contextMessages = summarizeContext(messages);

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: getSystemPrompt()
        },
        ...contextMessages.map(m => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content
        }))
      ],
      temperature: 0.8, // Slightly creative but consistent
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "Hmm, cevap oluşturamadım. Bir daha dener misin?";
  } catch (error: any) {
    console.error("OpenAI API Error:", error);

    // Friendly error messages
    if (error?.status === 429) {
      return "Şu an biraz yoğunum, birkaç saniye sonra tekrar dener misin?";
    } else if (error?.status === 401) {
      return "API bağlantısında bi sıkıntı var gibi. Ahmet'e haber ver lütfen.";
    } else if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
      return "İnternet bağlantısı yok gibi. Bağlantını kontrol eder misin?";
    }

    return "Beklenmedik bir hata oluştu. Tekrar deneyebilir misin?";
  }
}

// Vision-enabled chat response (with image support)
export async function getChatResponseWithVision(
  messages: { role: string; content: string | any }[],
  imageUrl?: string,
  imageBase64?: string
) {
  try {
    // If no vision support, just acknowledge the image
    if (!hasVisionSupport && (imageUrl || imageBase64)) {
      return "Görseli aldım! Ancak şu an görsel analiz özelliği aktif değil. Yine de metin olarak yardımcı olabilirim.";
    }

    // Prepare messages with image if provided
    const contextMessages = summarizeContext(messages);
    let formattedMessages = contextMessages.map(m => {
      if (typeof m.content === 'string') {
        return {
          role: m.role as "user" | "assistant" | "system",
          content: m.content
        };
      }
      return m as any;
    });

    // Add image to the last user message if provided
    if (imageUrl || imageBase64) {
      const lastUserMsgIndex = formattedMessages.map(m => m.role).lastIndexOf('user');
      if (lastUserMsgIndex !== -1) {
        const lastMsg = formattedMessages[lastUserMsgIndex];
        formattedMessages[lastUserMsgIndex] = {
          role: "user",
          content: [
            {
              type: "text",
              text: typeof lastMsg.content === 'string' ? lastMsg.content : lastMsg.content[0]?.text || ""
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl || `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        };
      }
    }

    const response = await openai.chat.completions.create({
      model: VISION_MODEL,
      messages: [
        {
          role: "system",
          content: getSystemPrompt() + "\n\n📸 Görsel analiz yeteneğin de var. Görselleri detaylı inceleyip yorumlayabilirsin."
        },
        ...formattedMessages
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "Görseli inceledim ama yorum yapamadım. Tekrar dener misin?";
  } catch (error: any) {
    console.error("Vision API Error:", error);

    if (error?.status === 429) {
      return "Şu an çok yoğunum, birkaç saniye bekleyip tekrar dener misin?";
    }

    return "Görsel işlenirken bir sorun çıktı. Normal mesaj olarak devam edebiliriz.";
  }
}

// Check if vision is available
export function isVisionAvailable(): boolean {
  return hasVisionSupport;
}
