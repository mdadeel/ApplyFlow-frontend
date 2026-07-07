import { get, getArray, post } from '../api'

export type DiscussionChannel =
  | 'resume-review'
  | 'interview-experience'
  | 'referral'
  | 'career-question'
  | 'success-story'
  | 'general'

export const DISCUSSION_CHANNELS: DiscussionChannel[] = [
  'resume-review',
  'interview-experience',
  'referral',
  'career-question',
  'success-story',
  'general',
]

export interface Discussion {
  _id: string
  channel: DiscussionChannel
  authorId: string
  authorName?: string
  title: string
  body: string
  replyCount: number
  helpfulCount: number
  createdAt: string
  updatedAt: string
  isPinned?: boolean
}

export interface DiscussionReply {
  _id: string
  discussionId: string
  authorId: string
  authorName?: string
  body: string
  helpfulCount: number
  createdAt: string
}

export interface DiscussionThreadResponse {
  discussion: Discussion
  replies: DiscussionReply[]
}

export interface ListDiscussionsParams {
  channel?: DiscussionChannel
  page?: number
  limit?: number
}

export interface CreateDiscussionInput {
  channel: DiscussionChannel
  title: string
  body: string
}

export interface CreateReplyInput {
  body: string
}

function isDiscussionChannel(value: string): value is DiscussionChannel {
  return (DISCUSSION_CHANNELS as string[]).includes(value)
}

/**
 * Normalize a discussion payload so optional fields have sane defaults.
 */
function normalizeDiscussion(raw: Partial<Discussion> & { _id: string }): Discussion {
  return {
    _id: raw._id,
    channel: (isDiscussionChannel(String(raw.channel)) ? (raw.channel as DiscussionChannel) : 'general'),
    authorId: raw.authorId ?? '',
    authorName: raw.authorName,
    title: raw.title ?? '',
    body: raw.body ?? '',
    replyCount: raw.replyCount ?? 0,
    helpfulCount: raw.helpfulCount ?? 0,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
    isPinned: raw.isPinned,
  }
}

function normalizeReply(raw: Partial<DiscussionReply> & { _id: string }): DiscussionReply {
  return {
    _id: raw._id,
    discussionId: raw.discussionId ?? '',
    authorId: raw.authorId ?? '',
    authorName: raw.authorName,
    body: raw.body ?? '',
    helpfulCount: raw.helpfulCount ?? 0,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  }
}

/**
 * Fetch a list of discussions, optionally filtered by channel.
 */
export async function listDiscussions(
  params: ListDiscussionsParams = {},
): Promise<Discussion[]> {
  const queryParams: Record<string, string | number | undefined> = {
    channel: params.channel,
    page: params.page,
    limit: params.limit,
  }
  const raw = await getArray<Discussion>('/discussions', queryParams)
  return raw.map((item) => normalizeDiscussion(item))
}

/**
 * Fetch a single discussion thread including all replies.
 */
export async function getDiscussion(id: string): Promise<DiscussionThreadResponse> {
  const raw = await get<Partial<DiscussionThreadResponse>>(`/discussions/${id}`)
  const discussion = raw.discussion
    ? normalizeDiscussion(raw.discussion as Partial<Discussion> & { _id: string })
    : normalizeDiscussion(raw as unknown as Partial<Discussion> & { _id: string })
  const replies = Array.isArray(raw.replies)
    ? raw.replies.map((reply) =>
        normalizeReply(reply as Partial<DiscussionReply> & { _id: string }),
      )
    : []
  return { discussion, replies }
}

/**
 * Create a new discussion in the given channel.
 */
export async function createDiscussion(
  input: CreateDiscussionInput,
): Promise<Discussion> {
  const created = await post<Discussion>('/discussions', input)
  return normalizeDiscussion(created as Partial<Discussion> & { _id: string })
}

/**
 * Post a reply to an existing discussion.
 */
export async function createReply(
  discussionId: string,
  input: CreateReplyInput,
): Promise<DiscussionReply> {
  const created = await post<DiscussionReply>(`/discussions/${discussionId}/replies`, input)
  return normalizeReply(created as Partial<DiscussionReply> & { _id: string })
}

/**
 * Human-friendly labels for each channel, used by nav and filter UI.
 */
export const DISCUSSION_CHANNEL_LABELS: Record<DiscussionChannel, string> = {
  'resume-review': 'Resume Review',
  'interview-experience': 'Interview Experience',
  referral: 'Referrals',
  'career-question': 'Career Questions',
  'success-story': 'Success Stories',
  general: 'General',
}
