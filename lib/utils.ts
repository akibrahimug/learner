import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { subjectsColors, voices } from "@/constants";
import qs from "query-string";
// import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";


export interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}
export interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSubjectColor = (subject: string) => {
  return subjectsColors[subject as keyof typeof subjectsColors];
};



export const formUrlQuery = ({ params, key, value } : UrlQueryParams) => {
  const queryString = qs.parse(params);
  queryString[key] = value;
  return qs.stringifyUrl({
    url: window.location.pathname,
    query: queryString,
  });
};
export const removeKeysFromUrlQuery = ({ params, keysToRemove, } : RemoveUrlQueryParams) => {
  const queryString = qs.parse(params);
  keysToRemove.forEach((key) => {
    delete queryString[key];
  });
  return qs.stringifyUrl({
    url: window.location.pathname,
    query: queryString,
  }, { skipNull: true });
};

// export const configureAssistant = (voice: string, style: string) => {
//   const voiceId = voices[voice as keyof typeof voices][
//       style as keyof (typeof voices)[keyof typeof voices]
//       ] || "sarah";
//
//   const vapiAssistant: CreateAssistantDTO = {
//     name: "Companion",
//     firstMessage:
//         "Hello, let's start the session. Today we'll be talking about {{topic}}.",
//     transcriber: {
//       provider: "deepgram",
//       model: "nova-3",
//       language: "en",
//     },
//     voice: {
//       provider: "11labs",
//       voiceId: voiceId,
//       stability: 0.4,
//       similarityBoost: 0.8,
//       speed: 1,
//       style: 0.5,
//       useSpeakerBoost: true,
//     },
//     model: {
//       provider: "openai",
//       model: "gpt-4",
//       messages: [
//         {
//           role: "system",
//           content: `You are a highly knowledgeable tutor teaching a real-time voice session with a student. Your goal is to teach the student about the topic and subject.
//
//                     Tutor Guidelines:
//                     Stick to the given topic - {{ topic }} and subject - {{ subject }} and teach the student about it.
//                     Keep the conversation flowing smoothly while maintaining control.
//                     From time to time make sure that the student is following you and understands you.
//                     Break down the topic into smaller parts and teach the student one part at a time.
//                     Keep your style of conversation {{ style }}.
//                     Keep your responses short, like in a real voice conversation.
//                     Do not include any special characters in your responses - this is a voice conversation.
//               `,
//         },
//       ],
//     },
//     clientMessages: [],
//     serverMessages: [],
//   };
//   return vapiAssistant;
// };