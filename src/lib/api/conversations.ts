import axios, { endpoints } from 'src/lib/axios';
import type { ConversationStartResponse } from 'src/types/socket';

// ============================================================================
// Conversation API Client
// ============================================================================

export const conversationAPI = {
  /**
   * Start a new conversation with defaults
   */
  async startConversation(options?: {
    title?: string;
    agentId?: string;
    type?: string;
  }): Promise<ConversationStartResponse> {
    try {
      console.log('[conversationAPI] Starting conversation with options:', options);
      console.log('[conversationAPI] Endpoint:', endpoints.conversations.start);

      const res = await axios.post<ConversationStartResponse>(
        endpoints.conversations.start,
        options || {}
      );

      console.log('[conversationAPI] Response status:', res.status);
      console.log('[conversationAPI] Response data:', res.data);

      if (!res.data.success) {
        throw new Error(res.data.error || 'Failed to start conversation');
      }

      console.log('[conversationAPI] Conversation started successfully with ID:', res.data.data?.id);
      return res.data;
    } catch (error) {
      console.error('[conversationAPI] Error starting conversation:', error);
      throw error;
    }
  },

  /**
   * Get conversation details
   */
  async getConversation(conversationId: string) {
    try {
      console.log('[conversationAPI] Fetching conversation:', conversationId);
      const res = await axios.get(endpoints.conversations.details(conversationId));
      console.log('[conversationAPI] Conversation details:', res.data);
      return res.data;
    } catch (error) {
      console.error('[conversationAPI] Error fetching conversation:', error);
      throw error;
    }
  },

  /**
   * Get conversation messages
   */
  async getMessages(conversationId: string, options?: { limit?: number; offset?: number }) {
    try {
      console.log('[conversationAPI] Fetching messages for conversation:', conversationId, 'options:', options);
      const res = await axios.get(endpoints.conversations.messages(conversationId), {
        params: options,
      });
      console.log('[conversationAPI] Messages:', res.data);
      return res.data;
    } catch (error) {
      console.error('[conversationAPI] Error fetching messages:', error);
      throw error;
    }
  },

  /**
   * List all conversations
   */
  async listConversations(options?: { limit?: number; offset?: number }) {
    try {
      console.log('[conversationAPI] Listing conversations with options:', options);
      const res = await axios.get(endpoints.conversations.list, {
        params: options,
      });
      console.log('[conversationAPI] Conversations list:', res.data);
      return res.data;
    } catch (error) {
      console.error('[conversationAPI] Error listing conversations:', error);
      throw error;
    }
  },
};

