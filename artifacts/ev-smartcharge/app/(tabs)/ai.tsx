import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/GlassCard";
import { AIMessage } from "@/lib/types";
import { MOCK_STATIONS } from "@/lib/mockData";
import { fetch } from "expo/fetch";
import * as Haptics from "expo-haptics";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_CONTEXT = `You are an AI charging assistant for EV SmartCharge, a premium EV charging app. 
You help EV drivers find the best charging stations based on their needs.
Available stations: ${JSON.stringify(MOCK_STATIONS.map(s => ({
  name: s.name,
  address: s.address,
  chargers: s.chargers?.map(c => ({ type: c.charger_type, power: c.power_kw + 'kW', status: c.status })),
  rating: s.rating
})))}
Be concise, helpful, and professional. Format recommendations clearly.
Do not use markdown headers or bullet points — use plain conversational text.`;

const QUICK_PROMPTS = [
  "Find me the fastest charger nearby",
  "Which station has the best availability?",
  "I need DC fast charging for my Tesla",
  "Plan a trip with charging stops",
];

function MessageBubble({ message }: { message: AIMessage }) {
  const colors = useColors();
  const isUser = message.role === "user";

  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
          <Ionicons name="flash" size={14} color={colors.primary} />
        </View>
      )}
      <GlassCard
        style={[
          styles.bubble,
          isUser && { backgroundColor: colors.primary + "22", borderColor: colors.primary + "55" },
        ]}
      >
        <Text style={[styles.bubbleText, { color: colors.foreground }]}>{message.content}</Text>
        <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </GlassCard>
    </View>
  );
}

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your EV charging assistant. Tell me your battery level, vehicle model, and destination — I'll find the best station for you.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || loading) return;

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [userMsg, ...prev]);
    setInput("");
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_CONTEXT }] },
          contents: [{ role: "user", parts: [{ text: content }] }],
          generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
        }),
      });

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "I couldn't process that request. Please try again.";

      const assistantMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [assistantMsg, ...prev]);
    } catch (err) {
      const errorMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Connection error. Please check your internet and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [errorMsg, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <View style={[styles.headerIcon, { backgroundColor: colors.primary + "22" }]}>
          <Ionicons name="flash" size={20} color={colors.primary} />
        </View>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>AI Assistant</Text>
          <Text style={[styles.headerSub, { color: colors.accent }]}>Powered by Gemini</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={[styles.messageList, { paddingBottom: 8 }]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => <MessageBubble message={item} />}
        ListHeaderComponent={
          loading ? (
            <View style={[styles.messageRow]}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
                <Ionicons name="flash" size={14} color={colors.primary} />
              </View>
              <GlassCard style={styles.bubble}>
                <ActivityIndicator size="small" color={colors.primary} />
              </GlassCard>
            </View>
          ) : null
        }
      />

      {/* Quick Prompts */}
      {messages.length <= 1 && !loading && (
        <View style={styles.quickPrompts}>
          <FlatList
            data={QUICK_PROMPTS}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => sendMessage(item)} activeOpacity={0.8}>
                <GlassCard style={styles.quickPrompt}>
                  <Text style={[styles.quickPromptText, { color: colors.primary }]}>{item}</Text>
                </GlassCard>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputWrapper, { paddingBottom: bottomPadding + 12 }]}>
        <GlassCard style={styles.inputBar}>
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Ask about charging stations..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.sendBtn,
                { backgroundColor: input.trim() && !loading ? colors.primary : colors.border },
              ]}
            >
              <Ionicons name="arrow-up" size={18} color={input.trim() && !loading ? colors.primaryForeground : colors.mutedForeground} />
            </View>
          </TouchableOpacity>
        </GlassCard>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 14,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    gap: 8,
  },
  messageRowUser: {
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Inter_400Regular",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "right",
  },
  quickPrompts: {
    paddingVertical: 8,
  },
  quickPrompt: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quickPromptText: {
    fontSize: 12,
    fontWeight: "500",
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    fontFamily: "Inter_400Regular",
    paddingVertical: 4,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
