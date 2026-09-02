export interface PushPublicKey {
  public_key: string;
}


export interface PushSubscriptionPayload {
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string;
}


export interface PushActionResponse {
  detail: string;

  created?: boolean;

  subscription_id?: number;

  status?: string;

  sent_count?: number;

  failed_count?: number;
}


export interface NotificationHistoryItem {
  id: number;

  kind: string;
  kind_label: string;

  title: string;
  body: string;

  url: string;

  data: Record<
    string,
    unknown
  >;

  subscribers_count: number;

  sent_count: number;

  failed_count: number;

  status: string;
  status_label: string;

  created_at: string;
}