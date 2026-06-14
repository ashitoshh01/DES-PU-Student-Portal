"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useChatStore, type Conversation } from "@/store/chat.store";
import {
  X,
  Phone,
  Video,
  UserPlus,
  Search,
  Bell,
  BellOff,
  Image as ImageIcon,
  File,
  Link2,
  Users,
  Shield,
  ChevronRight,
  LogOut,
  Trash2,
} from "lucide-react";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

function MemberItem({
  name,
  role,
  status,
}: {
  name: string;
  role?: string;
  status: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-1 rounded-lg hover:bg-background transition-colors cursor-pointer">
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
          {getInitials(name)}
        </div>
        {status === "ONLINE" && (
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-success border border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-text-primary truncate">
          {name}
        </p>
      </div>
      {role && (
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            role === "Admin" || role === "FACULTY"
              ? "bg-primary-light text-primary"
              : "text-text-secondary"
          }`}
        >
          {role === "FACULTY" ? "Admin" : role === "Admin" ? "Admin" : "Member"}
        </span>
      )}
    </div>
  );
}

export default function ChatDetails({
  conversation,
}: {
  conversation: Conversation;
}) {
  const { setShowDetails } = useChatStore();
  const [muted, setMuted] = useState(false);

  const isGroup = conversation.type !== "DIRECT";
  const memberCount = conversation.member_count || conversation.members.length;

  // Mock shared media
  const sharedMedia = [
    "/placeholder-1.jpg",
    "/placeholder-2.jpg",
    "/placeholder-3.jpg",
    "/placeholder-4.jpg",
    "/placeholder-5.jpg",
  ];

  return (
    <div className="w-[320px] h-full bg-white border-l border-border/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 shrink-0">
        <h3 className="text-[14px] font-semibold text-text-primary">
          {isGroup ? "Group Info" : "Contact Info"}
        </h3>
        <button
          onClick={() => setShowDetails(false)}
          className="p-1.5 rounded-lg hover:bg-background transition-colors text-text-secondary hover:text-text-primary"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile/Group Header */}
        <div className="flex flex-col items-center py-6 px-5">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br ${
              isGroup
                ? "from-orange-400 to-amber-500"
                : "from-blue-400 to-indigo-500"
            } mb-3`}
          >
            {isGroup ? (
              <Users size={32} strokeWidth={1.5} />
            ) : (
              getInitials(conversation.name)
            )}
          </div>
          <h4 className="text-base font-bold text-text-primary">
            {conversation.name}
          </h4>
          {isGroup && (
            <p className="text-[12px] text-text-secondary mt-0.5">
              {memberCount} members
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-center gap-6 pb-5 border-b border-border/30 mx-5">
          {[
            { icon: Phone, label: "Voice Call" },
            { icon: Video, label: "Video Call" },
            { icon: UserPlus, label: "Add" },
            { icon: Search, label: "Search" },
          ].map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-background flex items-center justify-center text-text-secondary group-hover:text-primary group-hover:bg-primary-light transition-all">
                <action.icon size={16} strokeWidth={1.8} />
              </div>
              <span className="text-[10px] font-medium text-text-secondary group-hover:text-primary transition-colors">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* About / Description */}
        {(isGroup || conversation.description) && (
          <div className="px-5 py-4 border-b border-border/30">
            <h5 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-2">
              About
            </h5>
            <p className="text-[12.5px] text-text-primary leading-relaxed">
              {conversation.description ||
                "Discussion group for DBMS subject. Share notes, ask doubts and collaborate."}
            </p>
          </div>
        )}

        {/* Media, Links & Files */}
        <div className="px-5 py-4 border-b border-border/30">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
              Media, Links & Files
            </h5>
            <button className="text-[11px] font-medium text-primary hover:text-primary-dark transition-colors">
              View all
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gradient-to-br from-background to-border/30 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              >
                <ImageIcon size={16} className="text-text-secondary/30" />
              </div>
            ))}
            <div className="aspect-square rounded-lg bg-background flex items-center justify-center cursor-pointer hover:bg-border-light transition-colors">
              <span className="text-[11px] font-semibold text-text-secondary">
                +12
              </span>
            </div>
          </div>
        </div>

        {/* Members */}
        {isGroup && (
          <div className="px-5 py-4 border-b border-border/30">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">
                Members ({memberCount})
              </h5>
              <button className="text-[11px] font-medium text-primary hover:text-primary-dark transition-colors">
                Add Members
              </button>
            </div>
            <div className="space-y-0.5">
              {conversation.members.slice(0, 5).map((member) => (
                <MemberItem
                  key={member.user_id}
                  name={member.name}
                  role={member.role}
                  status={member.presence_status}
                />
              ))}
              {memberCount > 5 && (
                <button className="w-full flex items-center justify-center gap-1 py-2 text-[11px] font-medium text-primary hover:text-primary-dark transition-colors">
                  View all {memberCount} members
                  <ChevronRight size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Notifications toggle */}
        <div className="px-5 py-3 border-b border-border/30">
          <button
            onClick={() => setMuted(!muted)}
            className="w-full flex items-center gap-3 py-2 text-text-primary hover:text-primary transition-colors"
          >
            {muted ? <BellOff size={16} /> : <Bell size={16} />}
            <span className="text-[12.5px] font-medium">
              {muted ? "Unmute notifications" : "Mute notifications"}
            </span>
          </button>
        </div>

        {/* Danger zone */}
        <div className="px-5 py-3">
          {isGroup ? (
            <button className="w-full flex items-center gap-3 py-2 text-danger hover:text-red-600 transition-colors">
              <LogOut size={16} />
              <span className="text-[12.5px] font-medium">Leave Group</span>
            </button>
          ) : (
            <button className="w-full flex items-center gap-3 py-2 text-danger hover:text-red-600 transition-colors">
              <Trash2 size={16} />
              <span className="text-[12.5px] font-medium">Delete Chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
