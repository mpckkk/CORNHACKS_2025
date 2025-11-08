import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Target,
  Loader2,
  Plus,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "../components/coach/MessageBubble";
import QuickActions from "../components/coach/QuickActions";

export default function AICoach() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);

  const { data: workouts = [] } = useQuery({
    queryKey: ['workouts'],
    queryFn: () => base44.entities.Workout.list('-completed_at', 10),
    initialData: [],
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convos = await base44.agents.listConversations({
          agent_name: "fitness_coach"
        });
        setConversations(convos);
        if (convos.length > 0 && !activeConversation) {
          loadConversation(convos[0].id);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      const unsubscribe = base44.agents.subscribeToConversation(
        activeConversation.id,
        (data) => {
          setMessages(data.messages);
        }
      );
      return () => unsubscribe();
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversation = async (conversationId) => {
    try {
      const conversation = await base44.agents.getConversation(conversationId);
      setActiveConversation(conversation);
      setMessages(conversation.messages || []);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const createNewConversation = async () => {
    try {
      const conversation = await base44.agents.createConversation({
        agent_name: "fitness_coach",
        metadata: {
          name: `Coaching Session ${conversations.length + 1}`,
          description: "Fitness coaching session"
        }
      });
      setConversations([conversation, ...conversations]);
      setActiveConversation(conversation);
      setMessages([]);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!activeConversation) {
      await createNewConversation();
    }

    const messageContent = input;
    setInput("");
    setIsLoading(true);

    try {
      await base44.agents.addMessage(activeConversation, {
        role: "user",
        content: messageContent
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (prompt) => {
    setInput(prompt);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const userStats = {
    level: user?.level || 1,
    totalWorkouts: user?.total_workouts || 0,
    currentStreak: user?.current_streak || 0,
    totalXP: user?.total_xp || 0,
    fitnessGoal: user?.fitness_goal || "general_fitness"
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  AI Fitness Coach
                </h1>
                <p className="text-sm text-slate-600">
                  Your personal trainer powered by AI
                </p>
              </div>
            </div>
            <Button
              onClick={createNewConversation}
              className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">New Chat</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex gap-4 p-4">
          {/* Sidebar - User Stats */}
          <div className="hidden lg:block w-80 space-y-4">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Level</span>
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                    {userStats.level}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Workouts</span>
                  <span className="font-semibold">{userStats.totalWorkouts}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Current Streak</span>
                  <span className="font-semibold">{userStats.currentStreak} 🔥</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total XP</span>
                  <span className="font-semibold">{userStats.totalXP}</span>
                </div>
                <div className="pt-3 border-t">
                  <span className="text-sm text-slate-600">Fitness Goal</span>
                  <p className="font-semibold capitalize mt-1">
                    {userStats.fitnessGoal.replace(/_/g, ' ')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {workouts.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No workouts yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {workouts.slice(0, 5).map((workout) => (
                      <div
                        key={workout.id}
                        className="text-xs p-2 bg-slate-50 rounded-lg"
                      >
                        <p className="font-medium text-slate-900 truncate">
                          {workout.quest_name}
                        </p>
                        <p className="text-slate-500">
                          +{workout.xp_earned} XP
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Card className="flex-1 border-none shadow-lg flex flex-col overflow-hidden">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Welcome to Your AI Coach!
                  </h2>
                  <p className="text-slate-600 text-center mb-8 max-w-md">
                    I'm here to help you achieve your fitness goals. Ask me anything about workouts, form, or get a personalized training plan!
                  </p>
                  <QuickActions onSelect={handleQuickAction} />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  <AnimatePresence mode="wait">
                    {messages.map((message, index) => (
                      <MessageBubble key={index} message={message} />
                    ))}
                  </AnimatePresence>
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3"
                    >
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-slate-200 p-4">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask your coach anything... (e.g., 'Create a custom workout for building strength')"
                    className="min-h-[60px] max-h-[120px] resize-none"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-[60px] px-6"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Press Enter to send, Shift + Enter for new line
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}