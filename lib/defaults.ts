import type { DialogueInput } from "@/types/dialogue";

export const defaultDialogueInput: DialogueInput = {
  sourceText: "你再说一遍？我爸把我的卡停了？你赶紧去给我搞定，不然你就滚蛋！",
  targetLocale: "US",
  genre: "现代流媒体剧集",
  character: {
    name: "埃文",
    age: "25",
    identity: "靠家里钱生活的富二代",
    personality: "脾气暴躁、特权感强、傲慢，一旦失去控制就会慌张",
    speechStyle: "有特权感、不耐烦、句子短促、现代美式口语"
  },
  scene: {
    context: "他刚发现父亲冻结了他的信用卡，正在电话里冲助理发火。",
    relationship: "老板对助理",
    powerDynamic: "说话者对听话者有直接权力",
    stakes: "说话者感到丢脸，急着重新夺回控制感"
  },
  emotion: {
    primary: "暴怒",
    secondary: "难以置信、慌张、特权感",
    intensity: 5
  },
  outputPreferences: {
    profanityLevel: 3,
    slangLevel: 3,
    literalness: 2,
    versions: ["raw", "sarcastic", "concise"]
  }
};
