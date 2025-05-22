import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { set } from "lodash";
import { Loader } from "@/components/loader";
import { Pause, Play, TrashIcon } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";

export function Missions() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  function ChatWindow() {
    const [messages, setMessages] = useState([
      { role: "bot", content: "Hi! How can I help you today?" },
    ]);
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    const handleSend = () => {
      if (!input.trim()) return;
      setMessages((prev) => [...prev, { role: "user", content: input }]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content:
              "I think I understand now! You want to invade a country with your little robots and kick of a major world war. Let me plan that for you.",
          },
        ]);
      }, 500);
      setInput("");
    };

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
      <Card className="w-md h-[700px] flex flex-col border rounded-2xl shadow-lg p-0 gap-0 rounded-b-none">
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[530px] mt-4 px-4 pt-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 mb-2 max-w-xs text-sm ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </ScrollArea>
          </div>
        </CardContent>

        {/* Input area */}
        <div className="border-t p-4 bg-zinc-100 dark:bg-zinc-950 rounded-b-2xl flex flex-col">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mb-4"
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button disabled={!input.trim()} onClick={handleSend}>
            Send
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full w-full absolute">
      <div className="flex items-center justify-center h-full">
        <h1 className="text-2xl font-bold">Missions</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0"
            disabled={loading}
            onClick={() => setLoading(true)}
          >
            {loading ? (
              <Loader color={theme === "dark" ? "white" : "black"} />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            disabled={loading}
            className="w-8 h-8 p-0"
            size="sm"
            onClick={() => setLoading(true)}
          >
            {loading ? (
              <Loader color={theme === "dark" ? "white" : "black"} />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="destructive"
            className="w-8 h-8 p-0"
            size="sm"
            onClick={() => setLoading(false)}
          >
            {loading ? (
              <Loader color="white" />
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="absolute bottom-0 right-8">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
