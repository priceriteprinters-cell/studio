export interface PostFormData {
  image: {
    method: 'upload' | 'paste' | 'url' | null;
    file: File | null; // This won't be sent to server, used for client-side display
    url: string;
    base64: string; // This will be sent to the server
  };
  caption: string;
  link: string;
  settings: {
    linkPlacement: 'caption' | 'button' | 'both';
    lockCount: number;
    selectedChannels: string[];
  };
}

// The full data sent to the server-side action
export interface FullPostData extends PostFormData {
  settings: PostFormData['settings'] & {
    buttonText: string;
  };
}

export type PipelineStatus = {
  bypass: boolean;
  rentry: boolean;
  lockr: boolean;
  tinyurl: boolean;
  gemini: boolean;
  telegram: boolean;
  admin: boolean;
};

export interface ChannelPostResult {
    channel: string;
    success: boolean;
    message_id?: number;
    error?: string;
}

export type TelegramResult = {
  success: boolean;
  message?: string;
  results: ChannelPostResult[];
}

export type AdminResult = {
  success: boolean;
  message?: string;
}

export interface ProcessingResult {
  success: boolean;
  finalUrl?: string;
  formattedCaption?: string;
  pipelineStatus: PipelineStatus;
  error?: string;
  steps?: {
    bypass?: string | null;
    rentry?: string | null;
    lockr?: string | string[] | null;
    tinyurl?: string | null;
    telegram?: TelegramResult;
    admin?: AdminResult;
  }
}
